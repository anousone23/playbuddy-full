import images from "@/constants/images";
import { useRejectGroupInvitation } from "@/libs/React Query/groupInvitations";
import { IGroupInvitation } from "@/types";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";

export default function GroupInvitationItem({
  invitation,
}: {
  invitation: IGroupInvitation;
}) {
  const { mutateAsync: rejectGroupInvitation, isPending: isRejecting } =
    useRejectGroupInvitation();

  return (
    <View className="flex-row items-center justify-between py-4">
      <TouchableOpacity className="flex-row items-center gap-x-4">
        <View className="w-12 h-12 rounded-full bg-slate-400">
          {invitation.groupChat.image ? (
            <FastImage
              source={{ uri: invitation.groupChat.image }}
              resizeMode={FastImage.resizeMode.cover}
              style={{ width: "100%", height: "100%", borderRadius: 999 }}
            />
          ) : (
            <FastImage
              source={images.groupChatPlaceHolder}
              resizeMode={FastImage.resizeMode.cover}
              style={{ width: "100%", height: "100%", borderRadius: 999 }}
            />
          )}
        </View>

        <View>
          <Text className="font-poppins-medium text-black">
            {invitation.groupChat.name}
          </Text>
          <Text className="font-poppins-medium text-black opacity-50">
            Invited by {invitation.sender.name}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="flex-row items-center gap-x-4">
        <TouchableOpacity
          className="bg-primary px-4 py-1 rounded-lg"
          onPress={() =>
            router.push({
              pathname: `/groupChats/${invitation.groupChat._id}` as "/",
              params: { invitationId: invitation._id },
            })
          }
        >
          <Text className="font-poppins-regular text-sm text-white">
            Detail
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-500 px-4 py-1 rounded-lg"
          onPress={async () => await rejectGroupInvitation(invitation._id)}
          disabled={isRejecting}
        >
          <Text className="font-poppins-regular text-sm text-white">
            Reject
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
