import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { useGetGroupChatById } from "@/libs/React Query/groupChat";
import { INotification } from "@/types";
import { formateTime } from "@/utils/helper";
import { FontAwesome } from "@expo/vector-icons";
import FastImage from "react-native-fast-image";

export default function KickFromGroupChatNotificationItem({
  notification,
}: {
  notification: INotification;
}) {
  const { data: groupChat, isLoading: isGettingGroupChat } =
    useGetGroupChatById(notification.relatedId);

  if (isGettingGroupChat) {
    return (
      <View
        className="items-center justify-center px-4 py-8 rounded-lg bg-slate-100"
        style={{ elevation: 3 }}
      >
        <ActivityIndicator size={"small"} color={"#0ea5e9"} />
      </View>
    );
  }
  return (
    <>
      <View
        className={` px-4 py-4 rounded-lg ${
          notification.isRead ? "bg-slate-200" : "bg-slate-100"
        }`}
        style={{ elevation: 3 }}
      >
        <View className="flex-row items-center gap-x-4">
          {/* profile image */}
          <View className="relative">
            <View className="w-14 h-14 rounded-full bg-slate-400">
              <FastImage
                source={{ uri: notification.sender.image }}
                resizeMode={FastImage.resizeMode.cover}
                style={{ width: "100%", height: "100%", borderRadius: 999 }}
              />
            </View>
            <View
              className="bg-red-500 items-center justify-center absolute rounded-full right-0 -bottom-2"
              style={{ elevation: 3 }}
            >
              <FontAwesome
                name="ban"
                size={16}
                color="#f0f9ff"
                className="p-1 px-1.5"
              />
            </View>
          </View>

          <View className="items-start gap-y-2 flex-1">
            <Text className="font-poppins-medium text-black text-md">
              {notification.sender.name}{" "}
              {
                <Text className="font-poppins-regular">
                  has kicked you from{" "}
                  {groupChat?.name ? (
                    <Text className="font-poppins-medium">
                      {groupChat.name}
                    </Text>
                  ) : (
                    <Text className="opacity-70">(Deleted group chat)</Text>
                  )}
                </Text>
              }
            </Text>

            <View className="flex-row items-center">
              <Text className="font-poppins-regular text-sm text-[#08334490] flex-1">
                {formateTime(notification.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="h-[1px]" />
    </>
  );
}
