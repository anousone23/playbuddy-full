import axiosInstance from "@/libs/axios";

export async function getAllUserGroupMessages({
  groupChatId,
}: {
  groupChatId: string;
}) {
  const res = await axiosInstance.get(
    `/api/groupChats/${groupChatId}/messages`
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

type groupMessageData = {
  text?: string;
  image?: string;
};

export async function sendGroupMessage({
  groupChatId,
  data,
}: {
  groupChatId: string;
  data: groupMessageData;
}) {
  const res = await axiosInstance.post(
    `/api/groupChats/${groupChatId}/send-message`,
    { text: data.text, image: data.image }
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}
