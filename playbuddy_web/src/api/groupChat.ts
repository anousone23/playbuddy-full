import axiosInstance from "@/lib/axios";
import { UpdateGroupChatType } from "@/types";

export async function getAllGroupChat() {
  const res = await axiosInstance.get("/api/groupChats/admin");

  return res.data.data;
}

export async function getReportedGroupChats() {
  const res = await axiosInstance.get("/api/groupChats/reports");

  return res.data.data;
}

export async function getGroupChatById({
  groupChatId,
}: {
  groupChatId: string;
}) {
  const res = await axiosInstance.get(`/api/groupChats/admin/${groupChatId}`);

  return res.data.data;
}

export async function getAllGroupChatReports({
  groupChatId,
}: {
  groupChatId: string;
}) {
  const res = await axiosInstance.get(`/api/groupChats/${groupChatId}/reports`);

  return res.data.data;
}

export async function updateGroupChat({
  groupChatId,
  data,
}: {
  groupChatId: string;
  data: UpdateGroupChatType;
}) {
  const res = await axiosInstance.put(
    `/api/groupChats/admin/${groupChatId}`,
    data
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

export async function acknowledgeGroupChatReport({
  groupChatId,
  reportId,
}: {
  groupChatId: string;
  reportId: string;
}) {
  const res = await axiosInstance.post(
    `/api/groupChats/${groupChatId}/reports/${reportId}/acknowledge`
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function deleteGroupChat({
  groupChatId,
}: {
  groupChatId: string;
}) {
  const res = await axiosInstance.delete(
    `/api/groupChats/admin/${groupChatId}`
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}
