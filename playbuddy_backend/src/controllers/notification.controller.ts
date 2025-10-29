import { Request, Response } from "express";
import { Notification } from "../models/notification.model";

export async function getAllNotifications(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const userId = req.userId;

    let unreadNotifications = await Notification.find({
      receiver: userId,
      isRead: false,
    })
      .populate("sender")
      .populate("receiver")
      .sort("-createdAt");

    if (unreadNotifications.length < 5) {
      const remainingCount = 5 - unreadNotifications.length;

      const readNotifications = await Notification.find({
        receiver: userId,
        isRead: true,
      })
        .populate("sender")
        .populate("receiver")
        .sort("-createdAt")
        .limit(remainingCount);

      unreadNotifications = [...unreadNotifications, ...readNotifications];
    }

    res.status(200).json({ status: "success", data: unreadNotifications });
  } catch (error) {
    console.log("Error from getAllNotifications", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function markNotificationAsRead(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const userId = req.userId;

    await Notification.updateMany({ receiver: userId }, { isRead: true });

    res.status(200).json({
      status: "success",
      message: "Notification status updated successfully",
    });
  } catch (error) {
    console.log("Error from markNotificationAsRead", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
