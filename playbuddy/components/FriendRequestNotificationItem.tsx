import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import AntDesign from "@expo/vector-icons/AntDesign";

import {
  useAcceptFriendRequest,
  useGetFriendRequestById,
  useRejectFriendRequest,
} from "@/libs/React Query/friendRequest";
import { INotification } from "@/types";
import { formateTime } from "@/utils/helper";
import FastImage from "react-native-fast-image";

export default function FriendRequestNotificationItem({
  notification,
}: {
  notification: INotification;
}) {
  const { relatedId } = notification;

  const {
    mutateAsync: acceptFriendRequest,
    isPending: isAcceptingFriendRequest,
  } = useAcceptFriendRequest();
  const {
    mutateAsync: rejectFriendRequest,
    isPending: isRejectingFriendRequest,
  } = useRejectFriendRequest();
  const { data: friendRequest, isLoading: isGettingFriendRequest } =
    useGetFriendRequestById(relatedId);

  const isOldRequest = friendRequest?.status === "old";
  const isPendingRequest = friendRequest?.status === "pending";

  if (isGettingFriendRequest) {
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
              className="bg-primary items-center justify-center absolute rounded-full right-0 -bottom-2"
              style={{ elevation: 3 }}
            >
              <AntDesign
                name="adduser"
                size={16}
                color="#f0f9ff"
                className="p-1"
              />
            </View>
          </View>

          <View className="items-start gap-y-2 flex-1">
            <Text className="font-poppins-medium text-black text-md">
              {notification.sender.name}{" "}
              <Text className="font-poppins-regular">
                sent a friend request to you
              </Text>
            </Text>

            <View className="flex-row items-center">
              <Text className="font-poppins-regular text-sm text-[#08334490] flex-1">
                {formateTime(notification.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* render status if status is not pending */}
        {!isPendingRequest && !isOldRequest ? (
          <View className="absolute right-4 bottom-4">
            <Text
              className={`font-poppins-regular text-sm  ${
                friendRequest?.status === "accepted"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {friendRequest?.status}
            </Text>
          </View>
        ) : null}

        {isPendingRequest ? (
          <View className="flex-row items-center gap-x-4 justify-end">
            <TouchableOpacity
              className="bg-primary px-4 py-1 rounded-lg"
              onPress={async () =>
                await acceptFriendRequest(notification.relatedId)
              }
              disabled={isAcceptingFriendRequest || isRejectingFriendRequest}
            >
              <Text className="font-poppins-regular text-sm text-white">
                Accept
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-500 px-4 py-1 rounded-lg"
              onPress={async () =>
                await rejectFriendRequest(notification.relatedId)
              }
              disabled={isAcceptingFriendRequest || isRejectingFriendRequest}
            >
              <Text className="font-poppins-regular text-sm text-white">
                Reject
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </>
  );
}
