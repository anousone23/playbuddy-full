import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Location } from "../models/location.mode";
import { SportType } from "../models/sportType.model";
import { GroupChat } from "../models/groupChat.model";

// user
export async function getAllLocations(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const locations = await Location.find().populate("sportTypes");

    if (locations.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No locations found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: locations,
    });
  } catch (error) {
    console.log("error in getAllLocations function ", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getLocationById(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { locationId } = req.params;

    const location = await Location.findById(locationId).populate("sportTypes");

    if (!location) {
      return res
        .status(404)
        .json({ status: "error", message: "Location not found" });
    }

    res.status(200).json({ status: "success", data: location });
  } catch (error) {
    console.log("Error from getLocationById function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getLocationSportTypes(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { locationId } = req.params;

    const location = await Location.findById(locationId).populate("sportTypes");

    if (!location) {
      return res
        .status(404)
        .json({ status: "error", message: "Location not found" });
    }

    res.status(200).json({ status: "success", data: location.sportTypes });
  } catch (error) {
    console.log("Error from getLocationSportTypes function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getGroupChatNumberInLocation(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { locationId } = req.params;

    const groupChats = await GroupChat.find({ locationId });

    res.status(200).json({ status: "success", data: groupChats.length });
  } catch (error) {
    console.log("Error from getGroupChatNumberInLocation function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
