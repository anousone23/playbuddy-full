import { Request, Response } from "express";

import { GroupInvitation } from "../models/groupInvitation.model";

export async function getAllUserGroupInvitations(
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
    const groupInvitations = await GroupInvitation.find(query)
      .populate({
        path: "sender",
        select: "-password",
      })
      .populate({
        path: "receiver",
        select: "-password",
      })
      .populate("groupChat");

    return res.status(200).json({ status: "success", data: groupInvitations });
  } catch (error) {
    console.log("Error from getAllGroupInvitations function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function getGroupInvitationById(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { invitationId } = req.params;

    const groupInvitation = await GroupInvitation.findById(
      invitationId
    ).populate("groupChat");

    if (!groupInvitation) {
      return res
        .status(404)
        .json({ status: "error", message: "Group invitation not found" });
    }

    res.status(200).json({ status: "success", data: groupInvitation });
  } catch (error) {
    console.log("Error from function getGroupInvitationById", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function rejectGroupInvitation(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { invitationId } = req.params;
    const userId = req.userId;

    if (!invitationId) {
      return res
        .status(400)
        .json({ status: "error", message: "Group invitation ID is required" });
    }

    const groupInvitation = await GroupInvitation.findById(invitationId);

    if (!groupInvitation) {
      return res
        .status(400)
        .json({ status: "error", message: "Group invitation not found" });
    }

    // check if this invitation is belong to user
    if (groupInvitation.receiver.toString() !== userId?.toString()) {
      return res.status(400).json({
        status: "error",
        message: "You are not allow to perform this action",
      });
    }

    await GroupInvitation.findByIdAndUpdate(groupInvitation._id, {
      status: "rejected",
    });

    res.status(200).json({
      status: "success",
      message: "Group Invitation rejected successfully",
    });
  } catch (error) {
    console.log("Error from function rejectFriendRequest", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
