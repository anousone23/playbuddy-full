import axiosInstance from "@/lib/axios";
import { UpdateProfileType } from "@/types";

export async function getAllUsers() {
  const res = await axiosInstance.get("/api/users");

  return res.data.data;
}

export async function getUserGroupChatNumber({ userId }: { userId: string }) {
  const res = await axiosInstance.get(
    `/api/users/${userId}/joined-groupchat-number`
  );

  return res.data.data;
}

export async function getUserFriendNumber({ userId }: { userId: string }) {
  const res = await axiosInstance.get(`/api/users/${userId}/friend-number`);

  return res.data.data;
}

export async function getReportedUser() {
  const res = await axiosInstance.get("/api/users/reports");

  return res.data.data;
}

export async function getUserById({ userId }: { userId: string }) {
  const res = await axiosInstance.get(`/api/users/${userId}`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function getAllUserReports({ userId }: { userId: string }) {
  const res = await axiosInstance.get(`/api/users/${userId}/reports`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function acknowledgeReport({
  userId,
  reportId,
}: {
  userId: string;
  reportId: string;
}) {
  const res = await axiosInstance.post(
    `/api/users/${userId}/reports/${reportId}/acknowledge`
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function suspendAccount({ userId }: { userId: string }) {
  const res = await axiosInstance.post(`/api/users/${userId}/suspend`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function cancelAccountSuspension({ userId }: { userId: string }) {
  const res = await axiosInstance.post(`/api/users/${userId}/cancel-suspend`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function getDashboardData() {
  const res = await axiosInstance.get(`/api/users/dashboard`);

  return res.data.data;
}

export async function updateProfile({ data }: { data: UpdateProfileType }) {
  const res = await axiosInstance.put(`/api/users/update-profile-admin`, data);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}
