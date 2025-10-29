import { Request, Response } from "express";

import { DirectChat } from "../models/directChat.model";
import { DirectMessage } from "../models/directMessage.model";
import { Friendship } from "../models/friendship.model";
import { deleteFolderAndImagesFromCloudinary } from "../utils/helper";

export async function unfriend(req: Request, res: Response): Promise<any> {
  try {
    const { friendshipId } = req.params;
    const userId = req.userId;

    const friendship = await Friendship.findById(friendshipId);

    if (!friendship) {
      return res
        .status(404)
        .json({ status: "error", message: "Friendship not found" });
    }

    // check if user is in this friendship
    if (
      friendship.user1.toString() !== userId &&
      friendship.user2.toString() !== userId
    ) {
      return res.status(404).json({
        status: "error",
        message: "You are not friend with this user",
      });
    }

    const directChat = await DirectChat.findOne({
      user1: friendship.user1,
      user2: friendship.user2,
    });

    if (!directChat) {
      return res.status(404).json({
        status: "error",
        message: "Direct chat not found",
      });
    }

    const friendId =
      directChat.user1.toString() === userId.toString()
        ? directChat.user2
        : directChat.user1;

    // delete all messages and direct chat
    await DirectMessage.deleteMany({ directChatId: directChat?._id });

    // delete direct chat
    const deletedDirectChat = await DirectChat.findByIdAndDelete(
      directChat._id
    );

    // delete friendship
    const deletedFriendship = await Friendship.findByIdAndDelete(
      friendship._id
    );

    if (!deletedFriendship) {
      return res.status(404).json({
        status: "error",
        message: "Friendship not found",
      });
    }

    // delete all images that belong to this direct chat
    await deleteFolderAndImagesFromCloudinary(
      `direct_message_images/${deletedDirectChat?._id}`
    );

    res.status(200).json({
      status: "success",
      message: "Unfriend successfully",
      directChatId: deletedDirectChat?._id,
      friendId,
    });
  } catch (error) {
    console.log("Error from unfriend function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function getAllUserFriends(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(400).json({ status: "error", message: "User ID is required" });
    }

    const userFriends = await Friendship.find({
      $or: [{ user1: userId }, { user2: userId }],
    })
      .sort("name")
      .populate({
        path: "user1",
        select: "-password",
      })
      .populate({
        path: "user2",
        select: "-password",
      });

    res.status(200).json({ status: "success", data: userFriends });
  } catch (error) {
    console.log("Error from getUserFriends function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
