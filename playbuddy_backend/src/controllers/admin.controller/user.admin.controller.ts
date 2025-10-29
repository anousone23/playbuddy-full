import bcryptjs from "bcryptjs";
import { endOfDay, startOfDay } from "date-fns";
import { Request, Response } from "express";

import { onlineUsers } from "../../libs/socket";
import { DirectMessage } from "../../models/directMessage.model";
import { GroupMessage } from "../../models/groupMessage.model";
import { Location } from "../../models/location.mode";
import { Report } from "../../models/report.model";
import { SportType } from "../../models/sportType.model";
import { User } from "../../models/user.model";
import cloudinary from "../../utils/cloudinary";
import { GroupChat } from "../../models/groupChat.model";
import { Friendship } from "../../models/friendship.model";

export async function getAllUsers(req: Request, res: Response): Promise<any> {
  try {
    const users = await User.find({ name: { $ne: "Deleted User" } })
      .select("name email isSuspended")
      .sort("name");

    return res.status(200).json({ status: "success", data: users });
  } catch (error) {
    console.log("Error in getAllUsers function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getUserGroupChatNumber(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { userId } = req.params;

    // find all groupchats that this user has joined
    const groupchats = await GroupChat.find({ members: userId });

    return res.status(200).json({ status: "success", data: groupchats.length });
  } catch (error) {
    console.log("Error in getNumberOfJoinedGroupChat function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getUserFriendNumber(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { userId } = req.params;

    const friendships = await Friendship.find({
      $or: [{ user1: userId }, { user2: userId }],
    });

    return res
      .status(200)
      .json({ status: "success", data: friendships.length });
  } catch (error) {
    console.log("Error in getNumberOfFriends function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getReportedUsers(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const userIds = await User.find().select("_id");

    const reports = await Report.find({
      type: "User",
      reportedId: { $in: userIds },
    }).select("reportedId");

    const reportedUserIds = reports.map((report) => report.reportedId);

    return res.status(200).json({ status: "success", data: reportedUserIds });
  } catch (error) {
    console.log("Error in getReportedUsers function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getUsersById(req: Request, res: Response): Promise<any> {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    console.log("Error from getUsersById function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function getAllUserReports(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { userId } = req.params;

    const reports = await Report.find({ reportedId: userId }).populate({
      path: "reportBy",
      model: "User",
      select: "-password",
    });

    return res.status(200).json({ status: "success", data: reports });
  } catch (error) {
    console.log("Error from getAllUserReports function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function acknowledgeReport(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { reportId } = req.params;

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      {
        isAcknowledged: true,
      },
      { new: true }
    );

    if (!updatedReport) {
      res.status(404).json({ status: "error", message: "Report not found" });
    }

    res.status(200).json({ status: "success", data: updatedReport });
  } catch (error) {
    console.log("Error from acknowledgeReport function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function suspendAccount(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: true },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ status: "error", message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: user,
      message: "User account suspended successfully",
    });
  } catch (error) {
    console.log("Error from suspendAccount function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function cancelAccountSuspension(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: false },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ status: "error", message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: user,
      message: "Canceled account suspension sucessfully",
    });
  } catch (error) {
    console.log("Error from suspendAccount function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function getDashboardData(
  req: Request,
  res: Response
): Promise<any> {
  try {
    // get total users
    const users = await User.find().select("_id");

    // get total locations
    const locations = await Location.find().select("_id");

    // get total sent messages in today
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());

    const [directMessageCount, groupMessageCount] = await Promise.all([
      DirectMessage.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      GroupMessage.countDocuments({ createdAt: { $gte: start, $lt: end } }),
    ]);

    const totalMessages = directMessageCount + groupMessageCount;

    const data = await SportType.aggregate([
      {
        $lookup: {
          from: "groupchats",
          localField: "_id",
          foreignField: "sportType",
          as: "groupChats",
        },
      },
      {
        $project: {
          _id: 0,
          sportType: "$name",
          count: { $size: "$groupChats" },
          totalUsersInGroups: {
            $size: {
              $reduce: {
                input: "$groupChats",
                initialValue: [],
                in: { $setUnion: ["$$value", "$$this.members"] },
              },
            },
          },
        },
      },
    ]).sort("totalUsersInGroups");

    const groupChatsPerSportType = data.filter(
      (groupChat) => groupChat.sportType !== "all"
    );

    res.status(200).json({
      status: "success",
      data: {
        totalUsers: users.length,
        onlineUsers: Array.from(onlineUsers).length,
        totalLocations: locations.length,
        totalMessages,
        groupChatsPerSportType,
      },
    });
  } catch (error) {
    console.log("Error from getOnlineUsers function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function updateProfileAdmin(
  req: Request,
  res: Response
): Promise<any> {
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

      user.name = name;
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
    }

    await user.save();

    user.password = "";

    res.status(200).json({
      status: "success",
      message: "Account updated successfully",
      data: user,
    });
  } catch (error) {
    console.log("Error from updateProfile function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
