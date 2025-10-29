import * as Location from "expo-location";

import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_URL,
} from "@/constants";
import axiosInstance from "@/libs/axios";
import axios from "axios";
import { ReportDataType, UploadImageType } from "@/types";

export async function getUserLocation() {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permission to access location was denied.");
  }
  return await Location.getCurrentPositionAsync({});
}

export async function getUsersByName(name: string) {
  const res = await axiosInstance.get(`/api/users/name/${name}`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function addFriend(userId: string) {
  const res = await axiosInstance.post(`/api/users/${userId}/add-friend`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

export async function reportUser({
  userToReportId,
  reportData,
}: {
  userToReportId: string;
  reportData: ReportDataType;
}) {
  const res = await axiosInstance.post(
    `/api/users/${userToReportId}/report`,
    reportData
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

type UpdateProfileType = {
  name?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  image?: string;
};

export async function updateProfile(userData: UpdateProfileType) {
  const res = await axiosInstance.put(`/api/users/update-profile`, userData);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

export async function deactivateAccount() {
  const res = await axiosInstance.delete(`/api/users/deactivate-account`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

export async function uploadImage({
  image,
  folder,
}: {
  image: UploadImageType;
  folder: string;
}) {
  const data = new FormData();

  data.append("file", {
    uri: image.uri,
    type: "image/jpeg",
    name: image.name,
  } as any);
  data.append("cloud_name", CLOUDINARY_CLOUD_NAME);
  data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  data.append("folder", folder);

  const res = await axios.post(CLOUDINARY_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.secure_url;
}

export async function updateFcmToken({ token }: { token: string }) {
  const res = await axiosInstance.put("/api/users/update-token", { token });

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}
