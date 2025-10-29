import axiosInstance from "@/libs/axios";

export async function getAllUserDirectMessages({
  directChatId,
}: {
  directChatId: string;
}) {
  const res = await axiosInstance.get(
    `/api/directChats/${directChatId}/messages`
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

type DirectMessageData = {
  text?: string;
  image?: string;
  receiverId: string;
};

export async function sendDirectMessage({
  directChatId,
  data,
}: {
  directChatId: string;
  data: DirectMessageData;
}) {
  const res = await axiosInstance.post(
    `/api/directChats/${directChatId}/send-message`,
    { text: data.text, image: data.image, receiverId: data.receiverId }
  );

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}
