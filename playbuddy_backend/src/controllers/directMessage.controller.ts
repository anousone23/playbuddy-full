import { Request, Response } from "express";
import { DirectChat } from "../models/directChat.model";
import { DirectMessage } from "../models/directMessage.model";
import { Notification } from "../models/notification.model";
import { User } from "../models/user.model";
import { onlineUsers } from "../libs/socket";
import { admin } from "../libs/firebase/firebase";

export async function getAllUserDirectMessages(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { directChatId } = req.params;
    const userId = req.userId;

    const directChat = await DirectChat.findById(directChatId);

    if (!directChat) {
      return res
        .status(404)
        .json({ status: "error", message: "Direct chat not found" });
    }

    // check if user is in this direct chat
    if (
      directChat.user1.toString() !== userId &&
      directChat.user2.toString() !== userId
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "You are not in this direct chat " });
    }

    // get all messages
    const messages = await DirectMessage.find({ directChatId })
      .populate({
        path: "sender",
        select: "-password",
      })
      .populate({
        path: "receiver",
        select: "-password",
      });

    return res.status(200).json({ status: "success", data: messages });
  } catch (error) {
    console.log("Error from getAllUserDirectMessages", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function sendDirectMessage(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const senderId = req.userId;
    const { text, image, receiverId } = req.body;
    const { directChatId } = req.params;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        status: "error",
        message: "Sender and receiver ID is required",
      });
    }

    // check if user is sending message to him/her self
    if (senderId === receiverId) {
      return res.status(400).json({
        status: "error",
        message: "Can not send message to yourself",
      });
    }

    if (!text && !image) {
      return res
        .status(400)
        .json({ status: "error", message: "Text or image is required" });
    }

    const directChat = await DirectChat.findById(directChatId);

    if (!directChat) {
      return res
        .status(404)
        .json({ status: "error", message: "Direct chat not found" });
    }

    const participantIds = [
      directChat.user1.toString(),
      directChat.user2.toString(),
    ];

    // check if sender and receiver is belong to this direct chat
    if (
      !participantIds.includes(senderId) ||
      !participantIds.includes(receiverId)
    ) {
      return res.status(404).json({
        status: "error",
        message: "Users are not in this direct chat",
      });
    }

    // TODO: handle image uploading

    // create new message
    const newMessage = new DirectMessage({
      sender: senderId,
      receiver: receiverId,
      text: text || null,
      image: image || null,
      directChatId: directChat._id,
    });

    await newMessage.save();

    // update direct chat lastMessage
    await DirectChat.findByIdAndUpdate(directChat._id, {
      lastMessage: newMessage._id,
    });

    // create notification
    await Notification.create({
      sender: senderId,
      receiver: receiverId,
      type: "DirectMessage",
      relatedId: directChatId,
    });

    // push notification to receiver
    const sender = await User.findById(senderId).select("image").select("name");
    const receiver = await User.findById(receiverId).select("fcmToken");

    if (sender && receiver && receiver.fcmToken) {
      const isOnline = onlineUsers.has(receiver._id.toString());

      if (isOnline) {
        try {
          await admin.messaging().send({
            token: receiver.fcmToken,
            android: {
              data: {
                type: "DirectMessage",
                username: sender.name,
                userImage: sender.image,
                text: text || "",
                image: image || "",
                directChatId,
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
              message: "Message sent successfully",
              data: newMessage,
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
                body: text || "Sent a photo",
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
              message: "Message sent successfully",
              data: newMessage,
            });
          }
        }
      }
    }

    res.status(200).json({
      status: "success",
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.log("Error from sendDirectMessage", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
