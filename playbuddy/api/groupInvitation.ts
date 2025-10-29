import axiosInstance from "@/libs/axios";

export async function getAllUserGroupInvitations({
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
    `/api/groupInvitations?${params.toString()}`
  );

  return res.data.data;
}

export async function getGroupInvitationById(invitationId: string) {
  const res = await axiosInstance.get(`/api/groupInvitations/${invitationId}`);

  return res.data.data;
}

export async function rejectGroupInvitation(invitationId: string) {
  const res = await axiosInstance.post(
    `/api/groupInvitations/${invitationId}/reject`
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}
