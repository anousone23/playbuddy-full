import axiosInstance from "@/libs/axios";

export async function getAllUserFriendRequests({
  type,
  status,
}: {
  type?: string;
  status?: string;
}) {
  const params = new URLSearchParams();

  if (type?.trim()) {
    params.append("type", type.trim());
  }
  if (status?.trim()) {
    params.append("status", status.trim());
  }

  const res = await axiosInstance.get(
    `/api/friendRequests?${params.toString()}`
  );

  return res.data.data;
}

export async function getFriendRequestById(requestId: string) {
  const res = await axiosInstance.get(`/api/friendRequests/${requestId}`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function acceptFriendRequest(requestId: string) {
  const res = await axiosInstance.post(
    `/api/friendRequests/${requestId}/accept`
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

export async function rejectFriendRequest(requestId: string) {
  const res = await axiosInstance.post(
    `/api/friendRequests/${requestId}/reject`
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}
