import { Request, Response } from "express";

import { DirectChat } from "../models/directChat.model";

export async function getAllUserDirectChats(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const userId = req.userId;

    const directChats = await DirectChat.find({
      $or: [{ user1: userId }, { user2: userId }],
    })
      .populate({
        path: "user1",
        select: "-password",
      })
      .populate({
        path: "user2",
        select: "-password",
      })
      .populate("lastMessage");

    res.status(200).json({ status: "success", data: directChats });
  } catch (error) {
    console.log("Error from getAllUserDirectChats function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function getDirectChatById(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { directChatId } = req.params;

    const directChat = await DirectChat.findById(directChatId)
      .populate({
        path: "user1",
        select: "-password",
      })
      .populate({
        path: "user2",
        select: "-password",
      });

    if (!directChat) {
      return res.status(404).json({
        status: "error",
        message: "Direct chat not found",
      });
    }

    res.status(200).json({ status: "success", data: directChat });
  } catch (error) {
    console.log("Error from getDirectChatById function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
