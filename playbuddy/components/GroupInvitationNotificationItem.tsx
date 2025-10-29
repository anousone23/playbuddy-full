import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import {
  useGetGroupInvitationById,
  useRejectGroupInvitation,
} from "@/libs/React Query/groupInvitations";
import { INotification } from "@/types";
import { formateTime } from "@/utils/helper";
import { router } from "expo-router";
import FastImage from "react-native-fast-image";

export default function GroupInvitationNotificationItem({
  notification,
}: {
  notification: INotification;
}) {
  const { relatedId } = notification;

  const {
    mutateAsync: rejectGroupInvitation,
    isPending: isRejectingGroupInvitation,
  } = useRejectGroupInvitation();

  const { data: groupInvitation, isLoading: isGettingGroupInvitation } =
    useGetGroupInvitationById(relatedId);

  const isOldInvitation = groupInvitation?.status === "old";
  const isPendingInvitation = groupInvitation?.status === "pending";

  if (isGettingGroupInvitation) {
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
        className={`px-4 py-4 rounded-lg ${
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
              <MaterialCommunityIcons
                name="account-group"
                size={16}
                color="#f0f9ff"
                className="p-1"
              />
            </View>
          </View>

          {/* details */}
          <View className="items-start gap-y-2 flex-1">
            <Text className="font-poppins-medium text-black text-md">
              {notification.sender.name}{" "}
              <Text className="font-poppins-regular">
                invite you to join{" "}
                {groupInvitation?.groupChat ? (
                  <Text className="font-poppins-medium">
                    {groupInvitation.groupChat.name}
                  </Text>
                ) : (
                  <Text className="font-poppins-medium text-gray-500">
                    (Deleted Group)
                  </Text>
                )}
              </Text>
            </Text>

            {/* created at */}
            <View className="flex-row items-center">
              <Text className="font-poppins-regular text-sm text-[#08334490] flex-1">
                {formateTime(notification.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* render status if status is not pending */}
        {!isPendingInvitation && !isOldInvitation && (
          <Text
            className={`font-poppins-regular text-sm absolute right-4 bottom-4 ${
              groupInvitation?.status === "accepted"
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {groupInvitation?.status}
          </Text>
        )}

        {/* render button if status is pending */}
        {isPendingInvitation && (
          <View className="flex-row items-center gap-x-4 justify-end">
            <TouchableOpacity className="bg-primary px-4 py-1 rounded-lg">
              <Text
                className="font-poppins-regular text-sm text-white"
                onPress={() =>
                  router.push({
                    pathname:
                      `/groupChats/${groupInvitation?.groupChat._id}` as "/",
                    params: { invitationId: groupInvitation._id },
                  })
                }
              >
                Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-500 px-4 py-1 rounded-lg"
              onPress={async () =>
                await rejectGroupInvitation(notification.relatedId)
              }
              disabled={isRejectingGroupInvitation}
            >
              <Text className="font-poppins-regular text-sm text-white">
                Reject
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="h-[1px]" />
    </>
  );
}
