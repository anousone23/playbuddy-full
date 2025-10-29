import axiosInstance from "@/libs/axios";

export async function getAllUserFriends() {
  const res = await axiosInstance.get(`/api/friendships`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function unfriend(friendshipId: string) {
  const res = await axiosInstance.delete(`/api/friendships/${friendshipId}`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}
