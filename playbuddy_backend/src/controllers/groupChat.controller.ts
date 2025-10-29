import { Request, Response } from "express";
import { Schema, Types } from "mongoose";
import { GroupChat } from "../models/groupChat.model";
import { GroupMessage } from "../models/groupMessage.model";
import { Location } from "../models/location.mode";
import { GroupInvitation } from "../models/groupInvitation.model";
import { Report } from "../models/report.model";
import { Notification } from "../models/notification.model";
import cloudinary from "../utils/cloudinary";
import {
  deleteFolderAndImagesFromCloudinary,
  deleteImageFromCloudinary,
} from "../utils/helper";
import { admin } from "../libs/firebase/firebase";
import { User } from "../models/user.model";
import { onlineUsers } from "../libs/socket";

export async function getAllGroupChatInLocation(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { locationId } = req.query;

    const groupChats = await GroupChat.find({
      locationId,
    })
      .populate("sportType")
      .sort("name");

    res.status(200).json({ status: "success", data: groupChats });
  } catch (error) {
    console.log("Error from getAllGroupChatInLocation function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function getGroupChatById(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { groupChatId } = req.params;

    const isValidId = Types.ObjectId.isValid(groupChatId);

    if (!isValidId) {
      console.log("Invalid group ID", groupChatId);

      return res.status(400).json({
        status: "error",
        message: "Invalid group chat ID",
      });
    }

    const groupChat = await GroupChat.findById(groupChatId)
      .populate("sportType")
      .populate("members")
      .populate("creator")
      .populate("admin");

    if (!groupChat) {
      return res
        .status(404)
        .json({ status: "error", message: "Group chat not found" });
    }

    res.status(200).json({ status: "success", data: groupChat });
  } catch (error) {
    console.log("Error from getGroupChatById function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function getUserGroupChats(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const userId = req.userId;

    const groupChats = await GroupChat.find({ members: userId })
      .populate("sportType")
      .populate("lastMessage");

    res.status(200).json({ status: "success", data: groupChats });
  } catch (error) {
    console.log("Error from getUserGroupChats function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function createGroupChat(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const userId = req.userId;
    const {
      name,
      description,
      sportType,
      maxMembers,
      preferredSkill,
      locationId,
    } = req.body;

    // Check if locationId is provided
    if (!locationId) {
      return res
        .status(400)
        .json({ status: "error", message: "Location ID is required" });
    }

    // Check required fields
    if (!name || !sportType || !preferredSkill || !maxMembers) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required fields",
      });
    }

    // Validate group name length
    if (name.trim().length < 3 || name.trim().length > 30) {
      return res.status(400).json({
        status: "error",
        message: "Group name must be between 3-30 characters",
      });
    }

    const nameRegex = /^(?!.*\s{2,})[A-Za-z0-9']+?(?: [A-Za-z0-9']+?)*$/;
    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid name, only letter and number are allowed",
      });
    }

    // Validate description length
    if (description && description.trim().length > 300) {
      return res.status(400).json({
        status: "error",
        message: "Description must be between 0-300 characters",
      });
    }

    // Validate maxMembers range
    if (maxMembers < 2 || maxMembers > 30) {
      return res.status(400).json({
        status: "error",
        message: "Max members must be between 2-30 people",
      });
    }

    // Validate preferredSkill
    const validSkills = ["casual", "beginner", "intermediate", "advanced"];
    if (!validSkills.includes(preferredSkill)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid preferred skill" });
    }

    // Get location
    const location = await Location.findById(locationId);
    if (!location) {
      return res
        .status(404)
        .json({ status: "error", message: "Location not found" });
    }

    // Check if selected sport types are allowed in this location
    const isInvalidSportType = !location.sportTypes.includes(sportType);

    if (isInvalidSportType) {
      return res.status(400).json({
        status: "error",
        message: "Selected sport types are not allowed in this location",
      });
    }

    // Create group chat
    const newGroupChat = new GroupChat({
      name,
      description,
      sportType,
      preferredSkill,
      members: [userId],
      creator: userId,
      admin: userId,
      maxMembers,
      locationId,
      joinedAt: {
        [userId as string]: new Date(),
      },
    });

    await newGroupChat.save();

    res.status(201).json({
      status: "success",
      message: "Group chat created successfully",
      data: newGroupChat,
    });
  } catch (error) {
    console.error("Error from createGroupChat function:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function updateGroupChat(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const userId = req.userId;
    const { groupChatId } = req.params;

    const { name, description, preferredSkill, maxMembers, image } = req.body;

    // get group chat
    const groupChat = await GroupChat.findById(groupChatId);

    if (!groupChat) {
      return res
        .status(404)
        .json({ status: "error", message: "Group chat not found" });
    }

    // check if user is group admin
    const isGroupAdmin = groupChat.admin.toString() === userId;

    if (!isGroupAdmin) {
      return res.status(403).json({
        status: "error",
        message: "You are not allowed to perform this action",
      });
    }

    // check if preferred skill is valid
    if (preferredSkill) {
      if (
        !["casual", "beginner", "intermediate", "advanced"].includes(
          preferredSkill
        )
      ) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid preferred skill" });
      }
    }

    // check group name
    if (name) {
      if (name.trim().length < 3 || name.trim().length > 30) {
        return res.status(400).json({
          status: "error",
          message: "Group name must be between 3-30 characters",
        });
      }

      const nameRegex = /^(?!.*\s{2,})[A-Za-z0-9']+?(?: [A-Za-z0-9']+?)*$/;
      if (!nameRegex.test(name.trim())) {
        return res.status(400).json({
          status: "error",
          message: "Invalid name, only letter and number are allowed",
        });
      }
    }

    // check max members
    if (maxMembers) {
      if (maxMembers < 2 || maxMembers > 30) {
        return res.status(400).json({
          status: "error",
          message: "Max members must be between 2-30 people",
        });
      }
    }

    if (image) {
      // delete old group image
      if (groupChat.image && groupChat.image.includes("cloudinary.com")) {
        await deleteImageFromCloudinary({
          image: groupChat.image,
          folder: "group_chat_images",
        });
      }
    }

    // update group chat
    const updatedData = {
      name: name || groupChat.name,
      description: description || groupChat.description,
      preferredSkill: preferredSkill || groupChat.preferredSkill,
      maxMembers: maxMembers || groupChat.maxMembers,
      image: image || groupChat.image,
    };

    const updatedGroupChat = await GroupChat.findByIdAndUpdate(
      groupChatId,
      updatedData,
      { new: true }
    )
      .populate("sportType")
      .populate("members")
      .populate("creator")
      .populate("admin");

    res.status(200).json({
      status: "success",
      message: "Group chat updated successfully",
      data: updatedGroupChat,
    });
  } catch (error) {
    console.log("Error from updateGroupChat function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteGroupChat(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const userId = req.userId;
    const { locationId, groupChatId } = req.params;

    // get group chat
    const groupChat = await GroupChat.findById(groupChatId);

    if (!groupChat) {
      return res
        .status(404)
        .json({ status: "error", message: "Group chat not found" });
    }

    //  check if user is group admin
    const isGroupAdmin = groupChat.admin.toString() === userId;

    if (!isGroupAdmin) {
      return res.status(403).json({
        status: "error",
        message: "You are not allowed to perform this action",
      });
    }

    if (groupChat.image && groupChat.image.includes("cloudinary.com")) {
      await deleteImageFromCloudinary({
        image: groupChat.image,
        folder: `group_chat_images`,
      });
    }

    await deleteFolderAndImagesFromCloudinary(
      `group_message_images/${groupChat._id}`
    );

    // delete all message in group chat
    await GroupMessage.deleteMany({ groupChatId: groupChat._id });

    // delete group chat
    await GroupChat.findByIdAndDelete(groupChatId);

    res
      .status(200)
      .json({ status: "success", message: "Group chat deleted successfully" });
  } catch (error) {
    console.log("Error from deleteGroupChat function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function joinGroupChat(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.userId;
    const { groupChatId } = req.params;
    const { invitationId } = req.body;

    // get groupChat
    const groupChat = await GroupChat.findById(groupChatId);

    if (!groupChat) {
      return res.status(404).json({
        status: "error",
        message: "Group chat not found",
      });
    }

    // check if user is already in group chat
    const isAlreadyInGroupChat = groupChat.members.some(
      (memberId) => memberId.toString() === userId
    );

    // check if group is already full
    const isFull = groupChat.members.length === groupChat.maxMembers;

    if (isFull) {
      return res.status(400).json({
        status: "error",
        message: "Group chat is full",
      });
    }

    if (isAlreadyInGroupChat) {
      return res.status(404).json({
        status: "error",
        message: "User is already in this group chat",
      });
    }

    // join group
    groupChat.members.push(userId as any);
    groupChat.joinedAt.set(userId as any, new Date());
    await groupChat.save();

    // Handle invitation status
    const invitation = await GroupInvitation.findById(invitationId);
    if (invitation) {
      // Mark current one as accepted
      invitation.status = "accepted";
      await invitation.save();

      // Mark other invitations as old
      await GroupInvitation.updateMany(
        {
          _id: { $ne: invitationId }, // exclude the current one
          groupChat: groupChat._id,
          receiver: userId,
        },
        { status: "old" }
      );

      // Send notification to the inviter
      await Notification.create({
        type: "GroupInvitationAccepted",
        receiver: invitation.sender,
        sender: userId,
        relatedId: invitation._id,
      });

      // push notification to the inviter
      const sender = await User.findById(userId).select("name").select("image");
      const receiver = await User.findById(invitation.sender).select(
        "fcmToken"
      );

      if (sender && receiver && receiver.fcmToken) {
        const isUserOnline = onlineUsers.has(receiver._id.toString());

        if (isUserOnline) {
          try {
            await admin.messaging().send({
              token: receiver.fcmToken,
              android: {
                data: {
                  type: "GroupInvitationAccepted",
                  username: sender.name,
                  userImage: sender.image,
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
                message: "Joined group successfully",
                data: groupChat,
              });
            }
          }
        } else {
          try {
            await admin.messaging().send({
              token: receiver.fcmToken,
              android: {
                notification: {
                  title: `${sender.name} accept your group invitation.`,
                  channelId: "default",
                  imageUrl: sender.image,
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
                { _id: receiver._id },
                { $unset: { fcmToken: "" } }
              );

              return res.status(200).json({
                status: "success",
                message: "Joined group successfully",
                data: groupChat,
              });
            }
          }
        }
      }
    } else {
      // If there is no invitationId, mark all as old
      await GroupInvitation.updateMany(
        { groupChat: groupChat._id, receiver: userId },
        { status: "old" }
      );
    }

    res.status(200).json({
      status: "success",
      message: "Joined group successfully",
      data: groupChat,
    });
  } catch (error) {
    console.log("Error from joinGroupChat function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function leaveGroupChat(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { groupChatId } = req.params;
    const userId = req.userId;

    // get groupChat
    const groupChat = await GroupChat.findById(groupChatId);

    if (!groupChat) {
      return res.status(404).json({
        status: "error",
        message: "Group chat not found",
      });
    }

    // check if user are in this group chat
    const isInThisGroupChat = groupChat.members.some(
      (member) => member.toString() === userId
    );

    if (!isInThisGroupChat) {
      return res.status(404).json({
        status: "error",
        message: "You are not in this group chat",
      });
    }

    // remove user from group chat
    groupChat.members = groupChat.members.filter(
      (memberId) => memberId.toString() !== userId
    );

    if (groupChat.joinedAt) {
      groupChat.joinedAt.delete(userId as any);
    }

    // check if user is group admin
    const isGroupAdmin = groupChat.admin.toString() === userId;

    // If the user is the admin and reassign to the next oldest member
    if (isGroupAdmin && groupChat.members.length > 0) {
      const joinedEntries = Array.from(groupChat.joinedAt.entries());

      // Sort by join date (earliest first)
      joinedEntries.sort(
        (a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime()
      );

      // Assign new admin
      if (joinedEntries.length > 0) {
        groupChat.admin = joinedEntries[0][0];
      }
    }

    // If the user is the admin and there are no members left then delete the group chat
    if (isGroupAdmin && groupChat.members.length === 0) {
      // delete group image from cloudinary
      if (groupChat.image && groupChat.image.includes("cloudinary.com")) {
        await deleteImageFromCloudinary({
          image: groupChat.image,
          folder: "group_chat_images",
        });
      }

      await GroupMessage.deleteMany({ groupChatId: groupChat._id });
      const deletedGroupChat = await GroupChat.findByIdAndDelete(groupChatId);

      // delete all images that belong to this group chat
      await deleteFolderAndImagesFromCloudinary(
        `group_message_images/${deletedGroupChat?._id}`
      );

      return res.status(200).json({
        status: "success",
        message: "Left group successfuly",
      });
    }

    await groupChat.save();

    res
      .status(200)
      .json({ status: "success", message: "Left group successfuly" });
  } catch (error) {
    console.log("Error from leaveGroupChat function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function kickFromGroupChat(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { groupChatId, memberId: userToKickId } = req.params;
    const userId = req.userId;

    // get group chat
    const groupChat = await GroupChat.findById(groupChatId);

    if (!groupChat) {
      return res
        .status(404)
        .json({ status: "error", message: "Group chat not found" });
    }

    // check if user is group admin
    const isGroupAdmin = groupChat.admin.toString() === userId?.toString();

    if (!isGroupAdmin) {
      return res.status(404).json({
        status: "error",
        message: "You are not allowed to perform this action",
      });
    }

    // check if user is kicking himself
    const isKickingYourself = userId === userToKickId;

    if (isKickingYourself) {
      return res.status(404).json({
        status: "error",
        message: "Can not kick yourself",
      });
    }

    // check if user to kick is in this group chat
    const isInThisGroupChat = groupChat.members.includes(userToKickId as any);

    if (!isInThisGroupChat) {
      return res
        .status(404)
        .json({ status: "error", message: "User is not in this group chat" });
    }

    // remove from group chat
    groupChat.members = groupChat.members.filter(
      (memberId) => memberId.toString() !== userToKickId.toString()
    );

    // remove kicked user joinedAt
    groupChat.joinedAt.delete(userToKickId as any);

    await groupChat.save();

    // create notification to kicked user
    const notification = await Notification.create({
      sender: userId,
      receiver: userToKickId,
      relatedId: groupChat._id,
      type: "KickFromGroupChat",
    });

    if (!notification) {
      return res
        .status(400)
        .json({ status: "error", message: "Failed to create notification" });
    }

    res.status(200).json({
      status: "success",
      message: "User kicked successfully",
      data: groupChat,
    });
  } catch (error) {
    console.log("Error from kickFromGroupChat", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function setAsAdmin(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.userId;
    const { groupChatId, memberId } = req.params;

    const groupChat = await GroupChat.findById(groupChatId);

    if (!groupChat) {
      return res
        .status(404)
        .json({ status: "error", message: "Group chat not found" });
    }

    const isGroupAdmin = userId?.toString() === groupChat.admin.toString();

    if (!isGroupAdmin) {
      return res.status(400).json({
        status: "error",
        message: "You are not allowed to perform this action",
      });
    }

    // check if user want to set himself as admin again
    const isAlreadyAdmin = userId?.toString() === memberId.toString();

    if (isAlreadyAdmin) {
      return res.status(400).json({
        status: "error",
        message: "You are already group admin",
      });
    }

    // check if member is in this group
    const isMemberInGroupChat = groupChat.members.includes(memberId as any);

    if (!isMemberInGroupChat) {
      return res.status(400).json({
        status: "error",
        message: "Member is not in this group chat",
      });
    }

    // change admin status
    groupChat.admin = memberId as any;

    await groupChat.save();

    res.status(200).json({
      status: "success",
      message: "Admin status changed successfully",
      data: groupChat,
    });
  } catch (error) {
    console.log("Error from setAsAdmin", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function inviteToGroupChat(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { groupChatId } = req.params;
    const { userId: receiverId } = req.body;
    const senderId = req.userId;

    if (!receiverId) {
      return res
        .status(400)
        .json({ status: "error", message: "User ID is required" });
    }

    const groupChat = await GroupChat.findById(groupChatId);

    if (!groupChat) {
      return res
        .status(404)
        .json({ status: "error", message: "Group chat not found" });
    }

    // check if sender is in this group chat
    if (!groupChat?.members.includes(senderId as any)) {
      return res
        .status(400)
        .json({ status: "error", message: "You are not in this group chat" });
    }

    // check if receiver is already in this group chat
    const isAlreadyInGroupChat = groupChat?.members.includes(receiverId);

    if (isAlreadyInGroupChat) {
      res.status(400).json({
        status: "error",
        message: "User is already in this group chat",
      });
    }

    // create new group invitation
    const newGroupInvitation = new GroupInvitation({
      sender: senderId,
      receiver: receiverId,
      groupChat: groupChatId,
    });

    // create group invitation notification
    const newNotification = new Notification({
      type: "GroupInvitation",
      sender: senderId,
      receiver: receiverId,
      relatedId: newGroupInvitation._id,
    });

    await newGroupInvitation.save();
    await newNotification.save();

    const sender = await User.findById(senderId).select("name");
    const receiver = await User.findById(receiverId).select("fcmToken");

    // push notification to receiver
    if (sender && receiver && receiver.fcmToken) {
      const isUserOnline = onlineUsers.has(receiver._id.toString());
      const invitationId = newGroupInvitation._id.toString();

      if (isUserOnline) {
        try {
          await admin.messaging().send({
            token: receiver.fcmToken,
            android: {
              data: {
                type: "GroupInvitation",
                username: sender.name,
                groupImage: groupChat.image || "",
                groupName: groupChat.name,
                groupId: groupChatId,
                invitationId,
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
              message: "Invitation sent successfully",
              data: newGroupInvitation,
            });
          }
        }
      } else {
        try {
          await admin.messaging().send({
            token: receiver.fcmToken,
            android: {
              notification: {
                title: `${sender.name} invite you to join ${groupChat.name}`,
                channelId: "default",
                imageUrl: groupChat.image || undefined,
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
              { _id: receiver._id },
              { $unset: { fcmToken: "" } }
            );

            return res.status(200).json({
              status: "success",
              message: "Invitation sent successfully",
              data: newGroupInvitation,
            });
          }
        }
      }
    }

    res.status(200).json({
      status: "success",
      message: "Invitation sent successfully",
      data: newGroupInvitation,
    });
  } catch (error) {
    console.log("Error from inviteToGroupChat", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function reportGroupChat(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { groupChatId } = req.params;
    const userId = req.userId;

    const { reason, description, image } = req.body;

    const reasonOptions = [
      "Inappropriate group name",
      "Inappropriate group image",
      "Inappropriate group content",
    ];

    const reportedGroupChat = await GroupChat.findById(groupChatId);
    if (!reportedGroupChat) {
      return res
        .status(404)
        .json({ status: "error", message: "Group chat not found" });
    }

    // check if user is group admin
    const isGroupAdmin = userId === reportedGroupChat.admin.toString();

    if (isGroupAdmin) {
      return res.status(400).json({
        status: "error",
        message: "Can not report your own group chat",
      });
    }

    // check if user is group member
    const isGroupMember = reportedGroupChat.members.includes(userId as any);

    if (!isGroupMember) {
      return res.status(400).json({
        status: "error",
        message: "You are not in this group chat",
      });
    }

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

    // create new report
    const newReport = new Report({
      type: "GroupChat",
      reportBy: userId,
      reportedId: reportedGroupChat._id,
      reason,
      description,
      image: image || null,
    });

    await newReport.save();

    res
      .status(200)
      .json({ status: "success", message: "Reported succcessfully" });
  } catch (error) {
    console.log("Error from reportGroupChat", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
