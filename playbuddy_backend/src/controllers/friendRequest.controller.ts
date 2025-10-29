import { Request, Response } from "express";
import { FriendRequest } from "../models/friendRequest";
import { Friendship } from "../models/friendship.model";
import { DirectChat } from "../models/directChat.model";
import { Notification } from "../models/notification.model";
import { admin } from "../libs/firebase/firebase";
import { User } from "../models/user.model";
import { onlineUsers } from "../libs/socket";

export async function getAllFriendRequests(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const userId = req.userId;
    const { type, status } = req.query;

    let query: any = {};

    if (type === "sent") {
      query.sender = userId;
    } else if (type === "received") {
      query.receiver = userId;
    } else {
      query.$or = [{ sender: userId }, { receiver: userId }];
    }

    if (status) {
      query.status = status;
    }

    // Fetch friend requests based on query
    const friendRequests = await FriendRequest.find(query)
      .populate({
        path: "sender",
        select: "-password",
      })
      .populate({
        path: "receiver",
        select: "-password",
      });

    return res.status(200).json({ status: "success", data: friendRequests });
  } catch (error) {
    console.log("Error from getAllFriendRequests function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function getFriendRequestById(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res
        .status(404)
        .json({ status: "error", message: "Friend request not found" });
    }

    res.status(200).json({ status: "success", data: friendRequest });
  } catch (error) {
    console.log("Error from function getFriendRequestById", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function acceptFriendRequest(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    if (!requestId) {
      return res
        .status(400)
        .json({ status: "error", message: "Friend request ID is required" });
    }

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res
        .status(400)
        .json({ status: "error", message: "Friend request not found" });
    }

    // check if this request is belong to user
    if (friendRequest.receiver.toString() !== userId?.toString()) {
      return res.status(400).json({
        status: "error",
        message: "You are not allow to perform this action",
      });
    }

    await FriendRequest.findByIdAndUpdate(friendRequest._id, {
      status: "accepted",
    });

    // update both user pending friend requests to 'old'
    await FriendRequest.updateMany(
      {
        $or: [
          {
            sender: friendRequest.sender,
            receiver: friendRequest.receiver,
            status: "pending",
          },
          {
            sender: friendRequest.receiver,
            receiver: friendRequest.sender,
            status: "pending",
          },
        ],
        _id: { $ne: friendRequest._id }, // don't update the one we just accepted
      },
      { $set: { status: "old" } }
    );

    // create new friendship
    const newFriend = new Friendship({
      user1: friendRequest.sender,
      user2: friendRequest.receiver,
    });

    // create new direct chat
    const newDirectChat = new DirectChat({
      user1: friendRequest.sender,
      user2: friendRequest.receiver,
    });

    // create accepted notification
    const newNotification = new Notification({
      type: "FriendRequestAccepted",
      sender: friendRequest.receiver,
      receiver: friendRequest.sender,
      relatedId: friendRequest._id,
    });

    await newFriend.save();
    await newDirectChat.save();
    await newNotification.save();

    const notificationReceiver = await User.findById(
      friendRequest.sender
    ).select("fcmToken");
    const currentUser = await User.findById(userId)
      .select("name")
      .select("image");

    // push notification to receiver
    if (notificationReceiver && currentUser && notificationReceiver.fcmToken) {
      const isUserOnline = onlineUsers.has(notificationReceiver._id.toString());

      if (isUserOnline) {
        try {
          await admin.messaging().send({
            token: notificationReceiver.fcmToken,
            android: {
              data: {
                type: "FriendRequestAccepted",
                username: currentUser.name,
                userImage: currentUser.image,
              },
            },
          });
        } catch (error) {
          if (
            (error as any).errorInfo?.code ===
            "messaging/registration-token-not-registered"
          ) {
            await User.updateOne(
              { _id: notificationReceiver._id },
              { $unset: { fcmToken: "" } }
            );

            return res.status(200).json({
              status: "success",
              message: "Friend request accepted successfully",
            });
          }
        }
      } else {
        try {
          await admin.messaging().send({
            token: notificationReceiver.fcmToken,
            android: {
              notification: {
                title: `${currentUser.name} accepted your friend request.`,
                channelId: "default",
                imageUrl: currentUser.image,
                priority: "default",
                color: "#ef4444",
              },
            },
          });
        } catch (error) {
          if (
            (error as any).errorInfo?.code ===
            "messaging/registration-token-not-registered"
          ) {
            await User.updateOne(
              { _id: notificationReceiver._id },
              { $unset: { fcmToken: "" } }
            );

            return res.status(200).json({
              status: "success",
              message: "Friend request accepted successfully",
            });
          }
        }
      }
    }

    res.status(200).json({
      status: "success",
      message: "Friend request accepted successfully",
    });
  } catch (error) {
    console.log("Error from function acceptFriendRequest", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function rejectFriendRequest(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    if (!requestId) {
      return res
        .status(400)
        .json({ status: "error", message: "Friend request ID is required" });
    }

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res
        .status(400)
        .json({ status: "error", message: "Friend request not found" });
    }

    // check if this request is belong to user
    if (friendRequest.receiver.toString() !== userId?.toString()) {
      return res.status(400).json({
        status: "error",
        message: "You are not allow to perform this action",
      });
    }

    await FriendRequest.findByIdAndUpdate(requestId, {
      status: "rejected",
    });

    res.status(200).json({
      status: "success",
      message: "Friend request rejected successfully",
    });
  } catch (error) {
    console.log("Error from function rejectFriendRequest", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
