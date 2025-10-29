import { Request, Response } from "express";
import { GroupChat } from "../models/groupChat.model";
import { GroupMessage } from "../models/groupMessage.model";
import { Notification } from "../models/notification.model";
import { User } from "../models/user.model";
import { onlineUsers } from "../libs/socket";
import { admin } from "../libs/firebase/firebase";

export async function sendGroupMessage(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const senderId = req.userId;
    const { groupChatId } = req.params;
    const { text, image } = req.body;

    const groupChat = await GroupChat.findById(groupChatId);

    if (!text && !image) {
      return res
        .status(400)
        .json({ status: "error", message: "Group message can not be empty" });
    }

    if (!groupChat) {
      return res
        .status(404)
        .json({ status: "error", message: "Group chat not found" });
    }

    // check if user is in group chat
    if (!groupChat.members.some((member) => member.toString() === senderId)) {
      return res.status(403).json({
        status: "error",
        message: "User is not a member of this group chat",
      });
    }

    // create new group message
    const newGroupMessage = await GroupMessage.create({
      sender: senderId,
      text: text || null,
      image: image || null,
      groupChatId: groupChat._id,
    });

    if (!newGroupMessage) {
      return res.status(400).json({
        status: "error",
        message: "Failed to send group message",
      });
    }

    // update direct chat lastMessage
    await GroupChat.findByIdAndUpdate(groupChat._id, {
      lastMessage: newGroupMessage._id,
    });

    // create nofication to all members
    const notifications = groupChat.members
      .filter((memberId) => memberId.toString() !== senderId)
      .map((memberId) => ({
        sender: senderId,
        receiver: memberId,
        type: "GroupMessage",
        relatedId: groupChat._id,
      }));

    await Notification.insertMany(notifications);

    // push notification to all members
    const sender = await User.findById(senderId).select("name image");
    const receivers = await User.find({
      _id: {
        $in: groupChat.members.filter((id) => id.toString() !== senderId),
      },
    }).select("fcmToken");

    if (sender && receivers.length > 0) {
      for (const receiver of receivers) {
        const isOnline = onlineUsers.has(receiver._id.toString());

        if (receiver.fcmToken) {
          if (isOnline) {
            try {
              await admin.messaging().send({
                token: receiver.fcmToken,
                android: {
                  data: {
                    type: "GroupMessage",
                    groupChatId: groupChat._id.toString(),
                    username: sender.name,
                    userImage: sender.image,
                    text: text || "",
                    image: image || "",
                  },
                },
              });
            } catch (error) {
              if (
                (error as any).errorInfo?.code ===
                "messaging/registration-token-not-registered"
              ) {
                await User.updateOne(
                  { _id: receiver._id },
                  { $unset: { fcmToken: "" } }
                );

                return res.status(200).json({
                  status: "success",
                  message: "Group message sent successfully",
                  data: newGroupMessage,
                });
              }
            }
          } else {
            try {
              await admin.messaging().send({
                token: receiver.fcmToken,
                android: {
                  notification: {
                    title: sender.name,
                    body: text || "send a photo",
                    imageUrl: sender.image,
                    channelId: "default",
                    priority: "high",
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
                  { _id: receiver._id },
                  { $unset: { fcmToken: "" } }
                );

                return res.status(200).json({
                  status: "success",
                  message: "Group message sent successfully",
                  data: newGroupMessage,
                });
              }
            }
          }
        }
      }
    }

    res.status(200).json({
      status: "success",
      message: "Group message sent successfully",
      data: newGroupMessage,
    });
  } catch (error) {
    console.log("Error from sendGroupMessage", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getAllUserGroupMessages(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { groupChatId } = req.params;
    const userId = req.userId;

    const groupChat = await GroupChat.findById(groupChatId);

    if (!groupChat) {
      return res
        .status(404)
        .json({ status: "error", message: "Group chat not found" });
    }

    // check if user is in this group chat
    if (!groupChat.members.some((member) => member.toString() === userId)) {
      return res
        .status(400)
        .json({ status: "error", message: "User is not in this group chat" });
    }

    // get all messages
    const messages = await GroupMessage.find({ groupChatId })
      .populate({
        path: "sender",
        select: "-password",
      })
      .populate({
        path: "readBy",
        select: "-password",
      });

    return res.status(200).json({ status: "success", data: messages });
  } catch (error) {
    console.log("Error from getAllUserDirectMessages", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
