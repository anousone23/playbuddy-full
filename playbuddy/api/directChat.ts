import axiosInstance from "@/libs/axios";

export async function getAllUserDirectChats() {
  const res = await axiosInstance.get("/api/directChats");

  return res.data.data;
}

export async function getDirectChatById(directChatId: string) {
  const res = await axiosInstance.get(`/api/directChats/${directChatId}`);

  return res.data.data;
}
