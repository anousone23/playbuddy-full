import { useAuthUser } from "@/contexts/AuthUserContext";
import { useSocket } from "@/contexts/SocketProvider";

import { IDirectChat, IDirectMessage, IUser } from "@/types";
import { formatMessageTime } from "@/utils/helper";
import { Href, router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";

export default function DirectChatItem({
  directChat,
}: {
  directChat: IDirectChat;
}) {
  const { authUser } = useAuthUser();
  const { onlineUsers } = useSocket();

  const friend =
    (directChat.user1 as IUser)._id === authUser?._id
      ? (directChat.user2 as IUser)
      : (directChat.user1 as IUser);

  const isOnline = onlineUsers.some((userId) => userId === friend._id);
  const lastMessage = directChat.lastMessage as IDirectMessage | null;
  const isMyMessage = lastMessage?.sender === authUser?._id;

  return (
    <>
      <TouchableOpacity
        className="py-4 px-2 rounded-lg flex-row items-center gap-x-4 bg-slate-100"
        style={{ elevation: 3 }}
        onPress={() => {
          router.push(`chats/directChat/${directChat._id}` as Href);
        }}
      >
        {/* image */}
        <View>
          <View className="h-16 w-16 rounded-full bg-slate-300">
            <FastImage
              source={{ uri: friend.image }}
              resizeMode={FastImage.resizeMode.cover}
              style={{ width: "100%", height: "100%", borderRadius: 999 }}
            />

            {isOnline && (
              <View
                className="w-4 h-4 rounded-full bg-green-500 border border-white absolute right-0"
                style={{ elevation: 3 }}
              />
            )}
          </View>
        </View>

        <View className="flex-1 gap-y-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-poppins-medium text-black text-lg">
              {friend.name}
            </Text>
          </View>

          <View className="flex-row items-center">
            {lastMessage && (
              <Text
                className={`flex-1 font-poppins-medium  ${
                  !isMyMessage && !lastMessage.isRead
                    ? "text-black"
                    : " text-[#17255480]"
                } text-sm`}
              >
                {isMyMessage
                  ? `You: ${lastMessage?.text || " photo"}`
                  : lastMessage?.text || " photo"}
              </Text>
            )}

            <View className="flex-row items-center gap-x-4 ">
              {/* unread status */}
              {lastMessage && !isMyMessage && !lastMessage?.isRead && (
                <View className="w-3 h-3 bg-primary rounded-full justify-self-end" />
              )}

              {/* timestamp */}
              <Text className="font-poppins-medium text-[#17255480] text-sm ">
                {lastMessage?.createdAt &&
                  formatMessageTime(lastMessage.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
}
