import { Request, Response } from "express";
import { GroupChat } from "../../models/groupChat.model";
import { Location } from "../../models/location.mode";
import { SportType } from "../../models/sportType.model";

export async function getAllSportTypes(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const sportTypes = await SportType.find()
      .collation({ locale: "en", strength: 1 })
      .sort("name");

    res.status(200).json({ status: "success", data: sportTypes });
  } catch (error) {
    console.log("Error in getAllSportTypes function", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}

export async function createSportType(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "sport type name is required",
      });
    }

    const nameRegex = /^(?!.*\s{2,})[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/;
    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid name, only letter and number are allowed",
      });
    }

    // check if sport type already exist
    const existingSporType = await SportType.findOne({ name });

    if (existingSporType) {
      return res.status(400).json({
        status: "error",
        message: "Sport type already exist",
      });
    }

    const newSportType = await SportType.create({ name: name.toLowerCase() });

    res.status(200).json({
      statusbar: "success",
      message: "Sport type created successfully",
      data: newSportType,
    });
  } catch (error) {
    console.log("Error from createSportType function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateSportType(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { sportTypeId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "sport type name is required",
      });
    }

    const nameRegex = /^(?!.*\s{2,})[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/;
    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid name, only letter and number are allowed",
      });
    }

    // check if sport type already exist
    const existingSporType = await SportType.findOne({ name });
    if (existingSporType) {
      return res.status(400).json({
        status: "error",
        message: "Sport type already exist",
      });
    }

    // update sport type
    const updatedSportType = await SportType.findByIdAndUpdate(
      sportTypeId,
      { name: name.toLowerCase() },
      { new: true }
    );

    if (!updatedSportType) {
      return res.status(404).json({
        status: "error",
        message: "Sport type not found",
      });
    }

    res.status(200).json({
      statusbar: "success",
      message: "Sport type updated successfully",
      data: updatedSportType,
    });
  } catch (error) {
    console.log("Error from updateSportType function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteSportType(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { sportTypeId } = req.params;

    const groupChatSportTypes = await GroupChat.find({
      sportType: sportTypeId,
    });

    const locationSportTypes = await Location.find({
      sportTypes: sportTypeId,
    });

    const isBeingUsed =
      groupChatSportTypes.length > 0 || locationSportTypes.length > 0;

    if (isBeingUsed) {
      return res.status(409).json({
        status: "error",
        message:
          "Cannot delete sport type while it's being used in a Location or Group Chat.",
      });
    }

    const deletedSportType = await SportType.findByIdAndDelete(sportTypeId);

    if (!deletedSportType) {
      return res.status(404).json({
        status: "error",
        message: "Sport type not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Sport type deleted successfully.",
    });
  } catch (error) {
    console.error("Error from deleteSportType:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
