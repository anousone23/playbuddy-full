import axiosInstance from "@/libs/axios";

export async function getAllNotification() {
  const res = await axiosInstance.get("/api/notifications");

  return res.data.data;
}

export async function markNotificationAsRead() {
  const res = await axiosInstance.put(`/api/notifications/mark-as-read`);

  return res.data;
}
