import { Server, Socket } from "socket.io";

import { IDirectMessageSchema, IGroupMessageSchema } from "../types";
import { User } from "../models/user.model";
import { GroupMessage } from "../models/groupMessage.model";
import { DirectMessage } from "../models/directMessage.model";
import { GroupChat } from "../models/groupChat.model";

const USER_ONLINE_EVENT = "user-online";
const ONLINE_USERS_EVENT = "online-users";
const SEND_DIRECT_MESSAGE_EVENT = "send-direct-message";
const RECEIVE_DIRECT_MESSAGE_EVENT = "receive-direct-message";
const JOIN_GROUP_EVENT = "join-group";
const LEAVE_GROUP_EVENT = "leave-group";
const SEND_GROUP_MESSAGE_EVENT = "send-group-message";
const RECEIVE_GROUP_MESSAGE_EVENT = "receive-group-message";
const READ_DIRECT_MESSAGES = "read-all-direct-messages";
const DIRECT_MESSAGES_READ = "all-direct-messages-read";
const UPDATE_GROUPCHAT_LASTMESSAGE = "update-groupchat-lastmessage";
const READ_GROUP_MESSAGES = "read-all-group-messages";
const GROUP_MESSAGES_READ = "group-messages-read";
const UPDATE_GROUPCHAT_LASTMESSAGE_READ_STATUS =
  "update-groupchat-lastmessage-read-status";
const UNFRIEND_EVENT = "unfriend";
const UNFRIEND_EVENT_RECEIVE = "unfriend-receive";

export const onlineUsers: Map<string, string> = new Map(); // userId -> socketId

export const initializeSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(USER_ONLINE_EVENT, (userId: string) => {
      if (!userId) return;

      const existingSocketId = onlineUsers.get(userId);

      if (existingSocketId && existingSocketId !== socket.id) {
        console.log(
          "user logged in from another device, disconnecting previous socket"
        );

        const existingSocket = io.sockets.sockets.get(existingSocketId);
        if (existingSocket) {
          existingSocket.disconnect(true);
        }
      }

      onlineUsers.set(userId, socket.id);
      socket.data.userId = userId;

      console.log(`User ${userId} is online`);
      console.log(onlineUsers);

      io.emit(ONLINE_USERS_EVENT, Array.from(onlineUsers.keys()));
    });

    socket.on(SEND_DIRECT_MESSAGE_EVENT, async (data: IDirectMessageSchema) => {
      try {
        const sender = await User.findById(data.sender).select("-password");
        const receiver = await User.findById(data.receiver).select("-password");

        if (!sender || !receiver) return;

        const message = {
          ...data,
          sender,
          receiver,
        };

        const receiverSocketId = onlineUsers.get(receiver?._id.toString());

        if (!receiverSocketId) {
          return console.log("receiver socket id not found");
        }

        io.to(receiverSocketId).emit(RECEIVE_DIRECT_MESSAGE_EVENT, message);
      } catch (error) {
        console.log("Error from SEND_DIRECT_MESSAGE_EVENT", error);
      }
    });

    socket.on(JOIN_GROUP_EVENT, (groupId: string) => {
      socket.join(groupId);
      console.log(`Socket ${socket.id} joined group ${groupId}`);
    });

    socket.on(LEAVE_GROUP_EVENT, (groupId: string) => {
      socket.leave(groupId);
      console.log(`Socket ${socket.id} left group ${groupId}`);
    });

    socket.on(SEND_GROUP_MESSAGE_EVENT, async (data: IGroupMessageSchema) => {
      try {
        const messageId = data._id;

        const message = await GroupMessage.findById(messageId)
          .populate({
            path: "sender",
            select: "-password",
          })
          .populate({
            path: "readBy",
            select: "-password",
          });

        if (!message) return;

        const groupChat = await GroupChat.findById(data.groupChatId).select(
          "members"
        );
        const memberIds = groupChat?.members.map((memberId) =>
          memberId.toString()
        );
        const onlineMemberSocketIds = memberIds
          ?.filter((memberId) => onlineUsers.has(memberId))
          .map((memberId) => onlineUsers.get(memberId));

        io.to(data.groupChatId.toString()).emit(
          RECEIVE_GROUP_MESSAGE_EVENT,
          message
        );

        if (onlineMemberSocketIds && onlineMemberSocketIds.length > 0) {
          onlineMemberSocketIds.forEach((socketId) => {
            if (socketId) {
              io.to(socketId.toString()).emit(
                UPDATE_GROUPCHAT_LASTMESSAGE,
                message
              );
            }
          });
        }
      } catch (error) {
        console.log("Error from SEND_GROUP_MESSAGE_EVENT", error);
      }
    });

    // read direct messages
    socket.on(
      READ_DIRECT_MESSAGES,
      async ({ directChatId, senderId, receiverId, unreadMessageIds }) => {
        try {
          if (
            !directChatId ||
            !senderId ||
            !receiverId ||
            unreadMessageIds.length === 0
          )
            return;

          await DirectMessage.updateMany(
            { _id: { $in: unreadMessageIds } },
            { $set: { isRead: true } }
          );

          const senderSocketId = onlineUsers.get(senderId.toString());
          const receiverSocketId = onlineUsers.get(receiverId.toString());

          if (!senderSocketId && !receiverSocketId) return;

          const payload = { directChatId, updatedMessageIds: unreadMessageIds };

          if (senderSocketId) {
            io.to(senderSocketId).emit(DIRECT_MESSAGES_READ, payload);
          }

          if (receiverSocketId) {
            io.to(receiverSocketId).emit(DIRECT_MESSAGES_READ, payload);
          }
        } catch (error) {
          console.log("Error from READ_DIRECT_MESSAGES", error);
        }
      }
    );

    socket.on(
      READ_GROUP_MESSAGES,
      async ({ groupChatId, unreadMessageIds }) => {
        try {
          if (!groupChatId || unreadMessageIds.length === 0) return;

          const currentUserId = socket.data.userId;

          await GroupMessage.updateMany(
            {
              _id: { $in: unreadMessageIds },
              readBy: { $ne: currentUserId },
            },
            {
              $addToSet: { readBy: currentUserId },
            }
          );

          const reader = await User.findById(currentUserId).select("-password");
          const groupChat = await GroupChat.findById(groupChatId).select(
            "members"
          );
          const memberIds = groupChat?.members.map((memberId) =>
            memberId.toString()
          );
          const onlineMemberSocketIds = memberIds
            ?.filter((memberId) => onlineUsers.has(memberId))
            .map((memberId) => onlineUsers.get(memberId));

          if (!reader) return;

          // emit event to group chat
          io.to(groupChatId).emit(GROUP_MESSAGES_READ, {
            groupChatId,
            updatedMessageIds: unreadMessageIds,
            reader,
          });

          // emit event to each member that is online
          if (onlineMemberSocketIds && onlineMemberSocketIds.length > 0) {
            onlineMemberSocketIds.forEach((socketId) => {
              io.to(socketId!).emit(UPDATE_GROUPCHAT_LASTMESSAGE_READ_STATUS);
            });
          }
        } catch (error) {
          console.log("Error from READ_GROUP_MESSAGES", error);
        }
      }
    );

    socket.on(UNFRIEND_EVENT, ({ directChatId, friendId }) => {
      const friendSocketId = onlineUsers.get(friendId);

      if (!friendSocketId) return;

      socket.to(friendSocketId).emit(UNFRIEND_EVENT_RECEIVE, {
        directChatId,
      });
    });

    socket.on("disconnect", () => {
      const userId = (socket.data as any).userId;

      if (userId && onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} is offline`);

        io.emit(ONLINE_USERS_EVENT, Array.from(onlineUsers.keys()));
      }

      console.log(`Socket disconnected: ${socket.id}`);
      console.log(onlineUsers);
    });
  });
};
