import { Request, Response } from "express";

import { Types } from "mongoose";
import { Notification } from "../models/notification.model";
import { FriendRequest } from "../models/friendRequest";
import { GroupInvitation } from "../models/groupInvitation.model";
import { Friendship } from "../models/friendship.model";
import { DirectChat } from "../models/directChat.model";
import cloudinary from "./cloudinary";

export const toObjectId = (id: string): Types.ObjectId =>
  new Types.ObjectId(id);

export async function resetData(req: Request, res: Response): Promise<any> {
  try {
    await Notification.deleteMany();
    await FriendRequest.deleteMany();
    await GroupInvitation.deleteMany();
    await Friendship.deleteMany();
    await DirectChat.deleteMany();

    return res.json({ message: "Data reset successfully" });
  } catch (error) {
    console.log("Error from resetData: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function generateAvatar(name: string): Promise<string> {
  const params = new URLSearchParams();
  params.set("seed", name.trim());

  const url = `https://api.dicebear.com/9.x/initials/png?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch avatar");

    return response.url;
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return "";
  }
}

export async function deleteImageFromCloudinary({
  image,
  folder,
}: {
  image: string;
  folder: string;
}) {
  const parts = image.split("/");
  const publicIdWithExtension = parts.pop();
  const publicId = `${folder}/${publicIdWithExtension?.split(".")[0]}`;

  await cloudinary.uploader.destroy(publicId);
}

export async function deleteFolderAndImagesFromCloudinary(folder: string) {
  try {
    // Step 1: Try listing images under the folder
    const { resources } = await cloudinary.api.resources({
      type: "upload",
      prefix: `${folder}/`,
      max_results: 1, // Only need to check if at least 1 exists
    });

    if (!resources || resources.length === 0) {
      console.log(`Folder ${folder} does not exist or is already empty.`);
      return; // No need to continue
    }

    // Step 2: List all images properly to delete
    const { resources: allResources } = await cloudinary.api.resources({
      type: "upload",
      prefix: `${folder}/`,
      max_results: 500,
    });

    const publicIds = allResources.map((file: any) => file.public_id);

    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
      console.log(`Deleted ${publicIds.length} images from folder: ${folder}`);
    }

    // Step 3: Delete the folder itself
    await cloudinary.api.delete_folder(folder);
    console.log(`Deleted folder: ${folder}`);
  } catch (error: any) {
    if (error?.error?.message?.includes("Cannot find folder")) {
      console.log(`Folder ${folder} not found, nothing to delete.`);
    } else {
      console.error(`Error deleting folder and images from ${folder}`, error);
    }
  }
}

export function castFirstLetterToUpperCase(str: string): string {
  if (!str) return "";

  return str.at(0)!.toUpperCase() + str.substring(1);
}
