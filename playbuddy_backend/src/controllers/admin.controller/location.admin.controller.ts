import { Request, Response } from "express";
import { GroupChat } from "../../models/groupChat.model";
import { Location } from "../../models/location.mode";
import { SportType } from "../../models/sportType.model";
import cloudinary from "../../utils/cloudinary";

export async function getAllLocationsAdmin(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const locations = await Location.find()
      .select("name sportTypes description images")
      .populate("sportTypes")
      .sort("name");

    return res.status(200).json({
      status: "success",
      data: locations,
    });
  } catch (error) {
    console.log("Error in getAllLocationsAdmin function ", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function createLocation(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { name, images, description, latitude, longitude, sportTypes } =
      req.body;

    // check inputs
    if (
      !name ||
      !description ||
      !latitude ||
      !longitude ||
      !images ||
      !sportTypes
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields are required" });
    }

    if (images && images.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Location image can not be empty" });
    }

    if (sportTypes && sportTypes.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Sport types can not be empty" });
    }

    // check if sport types exist
    const validSportTypes = await SportType.find({ _id: { $in: sportTypes } });

    if (validSportTypes.length !== sportTypes.length) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid sport type" });
    }

    // create location
    const newLocation = new Location({
      name,
      images,
      description,
      latitude,
      longitude,
      sportTypes,
    });

    await newLocation.save();

    return res.status(201).json({
      status: "success",
      message: "Location created successfully",
      data: newLocation,
    });
  } catch (error) {
    console.log("Error in createLocation function ", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateLocation(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { name, images, description, latitude, longitude, sportTypes } =
      req.body;
    const { locationId } = req.params;

    // get location
    const location = await Location.findById(locationId);
    if (!location) {
      return res
        .status(404)
        .json({ status: "error", message: "Location not found" });
    }

    // Check if sport types exist
    if (sportTypes && sportTypes.length > 0) {
      const validSportTypes = await SportType.find({
        _id: { $in: sportTypes },
      });

      if (validSportTypes.length !== sportTypes.length) {
        return res.status(400).json({
          status: "error",
          message: "One or more invalid sport type IDs",
        });
      }
    }

    // delete old images
    if (images && images.length > 0) {
      const deletionPromises = location.images.map(async (imgUrl) => {
        try {
          if (imgUrl.includes("res.cloudinary.com")) {
            const parts = imgUrl.split("/");
            const publicIdWithExtension = parts.pop();
            const publicId = publicIdWithExtension?.split(".")[0];

            await cloudinary.uploader.destroy(`location_images/${publicId}`);
          }
        } catch (err) {
          console.warn("Failed to delete image from Cloudinary:", err);
        }
      });

      await Promise.all(deletionPromises);
    }

    const updatedData = {
      name: name || location.name,
      images: images || location.images,
      description: description || location.description,
      latitude: latitude || location.latitude,
      longitude: longitude || location.longitude,
      sportTypes: sportTypes || location.sportTypes,
    };

    // update location
    const updatedLocation = await Location.findByIdAndUpdate(
      { _id: locationId },
      updatedData,
      { new: true }
    );

    return res.status(201).json({
      status: "success",
      message: "Location updated successfully",
      data: updatedLocation,
    });
  } catch (error) {
    console.log("Error in updateLocation function ", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteLocation(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { locationId } = req.params;

    // check if there are groupchats in location
    const groupChats = await GroupChat.find({ locationId });
    if (groupChats.length > 0) {
      return res.status(404).json({
        status: "error",
        message: "Can not delete location while there are group chats in it",
      });
    }

    // get location
    const location = await Location.findById(locationId);
    if (!location) {
      return res
        .status(404)
        .json({ status: "error", message: "Location not found" });
    }

    // delete all images
    if (location.images && location.images.length > 0) {
      const deletionPromises = location.images.map(async (imgUrl) => {
        try {
          if (imgUrl.includes("res.cloudinary.com")) {
            const parts = imgUrl.split("/");
            const publicIdWithExtension = parts.pop();
            const publicId = publicIdWithExtension?.split(".")[0];

            await cloudinary.uploader.destroy(`location_images/${publicId}`);
          }
        } catch (err) {
          console.warn("Failed to delete image from Cloudinary:", err);
        }
      });

      await Promise.all(deletionPromises);
    }

    // delete location
    await Location.deleteOne({ _id: location._id });

    return res.status(200).json({
      status: "success",
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteLocation function ", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
