import bcryptjs from "bcryptjs";
import { Request, Response } from "express";

import { Friendship } from "../models/friendship.model";
import { FriendRequest } from "../models/friendRequest";
import { Notification } from "../models/notification.model";
import { Report } from "../models/report.model";
import { User } from "../models/user.model";
import cloudinary from "../utils/cloudinary";
import { admin } from "../libs/firebase/firebase";
import { onlineUsers } from "../libs/socket";
import { castFirstLetterToUpperCase } from "../utils/helper";

export async function getUsersByName(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { name } = req.params;

    const users = await User.find({
      name: { $regex: name, $options: "i" },
    })
      .select("-password")
      .sort("name");

    res.status(200).json({ status: "success", data: users });
  } catch (error) {
    console.log("Error from getUsersByName function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function addFriend(req: Request, res: Response): Promise<any> {
  try {
    const { userId: userToAddId } = req.params;
    const currentUserId = req.userId;

    if (!userToAddId) {
      return res
        .status(400)
        .json({ status: "error", message: "User ID is required" });
    }

    if (userToAddId === currentUserId) {
      return res
        .status(400)
        .json({ status: "error", message: "Can not add yourself as a friend" });
    }

    const userToAdd = await User.findOne({ _id: userToAddId });
    if (!userToAdd) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // check if user is already friend
    const isAlreadyFriend = await Friendship.findOne({
      $or: [
        { user1: currentUserId, user2: userToAddId },
        { user1: userToAddId, user2: currentUserId },
      ],
    });

    if (isAlreadyFriend) {
      return res.status(400).json({
        status: "error",
        message: "You are already friend with this user",
      });
    }

    // create new request
    const newRequest = await FriendRequest.create({
      sender: currentUserId,
      receiver: userToAddId,
    });

    //  create new notification
    await Notification.create({
      type: "FriendRequest",
      sender: currentUserId,
      receiver: userToAddId,
      relatedId: newRequest._id,
    });

    // push notification to receiver
    const isUserOnline = onlineUsers.has(userToAdd._id.toString());
    if (isUserOnline) {
      await admin.messaging().send({
        token: userToAdd.fcmToken,
        android: {
          data: {
            type: "FriendRequest",
            username: currentUser.name,
            userImage: currentUser.image,
          },
        },
      });
    } else {
      await admin.messaging().send({
        token: userToAdd.fcmToken,
        android: {
          notification: {
            title: `${currentUser.name} send a friend request to you.`,
            channelId: "default",
            imageUrl: currentUser.image,
            priority: "high",
            color: "#ef4444",
          },
        },
      });
    }

    res.status(200).json({
      status: "success",
      message: "Add friend successfully",
      data: newRequest,
    });
  } catch (error) {
    console.log("Error from addFriend function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function reportUser(req: Request, res: Response): Promise<any> {
  try {
    const { userId: userToReportId } = req.params;
    const userId = req.userId;

    const { reason, description, image } = req.body;

    const reasonOptions = [
      "Inappropriate name",
      "Inappropriate profile image",
      "Use of offensive words",
    ];

    if (!reason) {
      return res
        .status(400)
        .json({ status: "error", message: "Report reason is required" });
    }

    if (!reasonOptions.includes(reason)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid report reason" });
    }

    if (description && description.length > 300) {
      return res.status(400).json({
        status: "error",
        message: "Description must be between 1-300 characters long",
      });
    }

    const reportedUser = await User.findById(userToReportId);
    if (!reportedUser) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // create new report
    const newReport = new Report({
      type: "User",
      reportBy: userId,
      reportedId: reportedUser._id,
      reason,
      description,
      image: image || null,
    });

    await newReport.save();

    res
      .status(200)
      .json({ status: "success", message: "Reported succcessfully" });
  } catch (error) {
    console.log("Error from reportUser function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.userId;

    const { name, newPassword, confirmNewPassword, image } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    if (name) {
      const nameRegex = /^(?!.*\s{2,})[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/;

      if (!nameRegex.test(name)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid name, only letter and number are allowed",
        });
      }

      if (name.length < 3) {
        return res.status(400).json({
          status: "error",
          message: "Name must be at least 3 characters long",
        });
      }

      user.name = castFirstLetterToUpperCase(name);
      await user.save();

      user.password = "";

      return res.status(200).json({
        status: "success",
        message: "Name updated successfully",
        updatedUser: user,
      });
    }

    if (newPassword) {
      // check if newPassword is the same as old password
      const isUsingOldPassword = await bcryptjs.compare(
        newPassword,
        user.password
      );

      if (newPassword.length < 8) {
        return res.status(400).json({
          status: "error",
          message: "Password must be at least 8 characters long",
        });
      }

      if (newPassword !== confirmNewPassword) {
        return res
          .status(400)
          .json({ status: "error", message: "Password mismatch" });
      }

      if (isUsingOldPassword) {
        return res.status(400).json({
          status: "error",
          message: "New password can not be the same as old password",
        });
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(newPassword, salt);

      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({
        status: "success",
        message: "Password updated successfully",
      });
    }

    if (image) {
      // delete old profile image
      if (user.image && user.image.includes("cloudinary.com")) {
        const parts = user.image.split("/");
        const publicIdWithExtension = parts.pop();
        const publicId = `user_profile_images/${
          publicIdWithExtension?.split(".")[0]
        }`;

        await cloudinary.uploader.destroy(publicId);
      }

      user.image = image;
      await user.save();

      return res.status(200).json({
        status: "success",
        message: "Profile image updated successfully",
      });
    }

    res.status(400).json({
      status: "error",
      message: "Invalid user data",
    });
  } catch (error) {
    console.log("Error from updateProfile function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function deactivateAccount(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const userId = req.userId;

    const deletedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: { isDeactivate: true, deactivatedAt: new Date() } }
    );

    if (!deletedUser) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.log("Error from deactivateAccount function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function updateFcmToken(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const userId = req.userId;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Token is required",
      });
    }

    const user = await User.findByIdAndUpdate(userId, {
      $set: { fcmToken: token },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res
      .status(200)
      .json({ status: "success", message: "Token updated successfully" });
  } catch (error) {
    console.log("Error from updateFcmToken function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
