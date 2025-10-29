import { Request, Response } from "express";
import { GroupChat } from "../../models/groupChat.model";
import { Report } from "../../models/report.model";
import { Types } from "mongoose";
import {
  deleteFolderAndImagesFromCloudinary,
  deleteImageFromCloudinary,
} from "../../utils/helper";
import { GroupMessage } from "../../models/groupMessage.model";
import { Notification } from "../../models/notification.model";

export async function getAllGroupChats(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const groupChats = await GroupChat.find()
      .select("name locationId sportType admin")
      .populate({ path: "locationId", model: "Location", select: "name" })
      .populate({ path: "sportType", model: "SportType" })
      .populate({ path: "admin", model: "User", select: "name" })
      .sort("name");

    res.status(200).json({ status: "success", data: groupChats });
  } catch (error) {
    console.log("Error from getAllGroupChats function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function getReportedGroupChats(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const reports = await Report.find({ type: "GroupChat" });

    const reportedGroupChatIds = reports.map((report) => report.reportedId);

    res.status(200).json({ status: "success", data: reportedGroupChatIds });
  } catch (error) {
    console.log("Error from getAllGroupChatReports function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function getAllGroupChatReports(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { groupChatId } = req.params;

    const reports = await Report.find({ reportedId: groupChatId })
      .populate({
        path: "reportBy",
        model: "User",
      })
      .sort("-createdAt");

    res.status(200).json({ status: "success", data: reports });
  } catch (error) {
    console.log("Error from getAllGroupChatReports function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function getGroupChatByIdAdmin(
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
      .populate("admin")
      .populate("locationId");

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

export async function updateGroupChatAdmin(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { groupChatId } = req.params;
    const { name, image } = req.body;

    const groupChat = await GroupChat.findById(groupChatId);

    if (!groupChat) {
      return res
        .status(404)
        .json({ status: "error", message: "Group chat not found" });
    }

    if (name) {
      const nameRegex = /^(?!.*\s{2,})[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/;
      if (!nameRegex.test(name.trim())) {
        return res.status(400).json({
          status: "error",
          message: "Invalid name, only letter and number are allowed",
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
      image: image || groupChat.image,
    };

    const updatedGroupChat = await GroupChat.findByIdAndUpdate(
      groupChatId,
      updatedData,
      { new: true }
    );

    res.status(200).json({
      status: "success",
      messag: "Groupchat updated successfully",
      data: updatedGroupChat,
    });
  } catch (error) {
    console.log("Error from getGroupChatById function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function acknowledgeGroupChatReport(
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
    console.log("Error from acknowledgeGroupChatReport function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteGroupChatAdmin(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { groupChatId } = req.params;
    const userId = req.userId;

    // 1. Get group chat
    const groupChat = await GroupChat.findById(groupChatId);

    if (!groupChat) {
      return res
        .status(404)
        .json({ status: "error", message: "Group chat not found" });
    }

    // 2. Delete group chat image from Cloudinary if exists
    if (groupChat.image && groupChat.image.includes("cloudinary.com")) {
      await deleteImageFromCloudinary({
        image: groupChat.image,
        folder: `group_chat_images`,
      });
    }

    // 3. Delete all group message imaege in cloudinary
    await deleteFolderAndImagesFromCloudinary(
      `group_message_images/${groupChat._id}`
    );

    // 4. Delete all messages from the group
    await GroupMessage.deleteMany({ groupChatId: groupChat._id });

    // 5. Delete the group chat itself
    await GroupChat.findByIdAndDelete(groupChatId);

    // 6. Notify all members except the admin who deleted it
    const notifications = groupChat.members
      .filter((memberId) => memberId.toString() !== userId)
      .map((memberId) => ({
        sender: userId,
        receiver: memberId,
        type: "GroupChatDeletion",
        relatedId: groupChat._id,
      }));

    await Notification.insertMany(notifications);

    res.status(200).json({
      status: "success",
      message: "Group chat and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("Error from deleteGroupChatAdmin:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
