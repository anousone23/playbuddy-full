// src/libs/groupChatAPI.ts
import axiosInstance from "@/libs/axios";
import {
  CreateGroupChatType,
  IGroupChat,
  ReportDataType,
  UpdateGroupChatType,
} from "@/types";

export async function getGroupChatById(
  groupChatId: string
): Promise<IGroupChat> {
  const res = await axiosInstance.get(`/api/groupChats/${groupChatId}`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function getAllGroupChatsInLocation(
  locationId: string
): Promise<IGroupChat[]> {
  const res = await axiosInstance.get(`/api/groupChats`, {
    params: { locationId },
  });
  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function getGroupChatNumberInLocation(
  locationId: string
): Promise<number> {
  const res = await axiosInstance.get(
    `/api/locations/${locationId}/groupChat-count`
  );
  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function createGroupChat({
  locationId,
  groupData,
}: {
  locationId: string;
  groupData: CreateGroupChatType;
}): Promise<any> {
  const { name, description, maxMembers, sportType, preferredSkill } =
    groupData;

  const newGroup = {
    name,
    description,
    maxMembers,
    sportType,
    preferredSkill,
    locationId,
  };
  const res = await axiosInstance.post(`/api/groupChats`, newGroup);
  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

export async function joinGroupChat({
  groupChatId,
  invitationId,
}: {
  groupChatId: string;
  invitationId?: string;
}): Promise<any> {
  const res = await axiosInstance.post(`/api/groupChats/${groupChatId}/join`, {
    invitationId,
  });
  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function getUserGroupChats(userId: string): Promise<IGroupChat[]> {
  const res = await axiosInstance.get(`/api/groupChats/user/${userId}`);
  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function updateGroupChat({
  groupChatId,
  data,
}: {
  groupChatId: string;
  data: UpdateGroupChatType;
}): Promise<IGroupChat> {
  const res = await axiosInstance.put(`/api/groupChats/${groupChatId}`, data);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function leaveGroupChat(groupChatId: string): Promise<any> {
  const res = await axiosInstance.post(`/api/groupChats/${groupChatId}/leave`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function kickUserFromGroupChat({
  groupChatId,
  userToKickId,
}: {
  groupChatId: string;
  userToKickId: string;
}): Promise<any> {
  const res = await axiosInstance.post(
    `/api/groupChats/${groupChatId}/members/${userToKickId}/kick`
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

export async function setAsAdmin({
  groupChatId,
  newAdminId,
}: {
  groupChatId: string;
  newAdminId: string;
}): Promise<any> {
  const res = await axiosInstance.post(
    `/api/groupChats/${groupChatId}/members/${newAdminId}/set-as-admin`
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

export async function inviteToGroupChat({
  groupChatId,
  userId,
}: {
  groupChatId: string;
  userId: string;
}): Promise<any> {
  const res = await axiosInstance.post(
    `/api/groupChats/${groupChatId}/invite`,
    { userId }
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

export async function reportGroupChat({
  groupChatId,
  reportData,
}: {
  groupChatId: string;
  reportData: ReportDataType;
}): Promise<any> {
  const res = await axiosInstance.post(
    `/api/groupChats/${groupChatId}/report`,
    reportData
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}
