import images from "@/constants/images";
import { IGroupChat } from "@/types";
import { caseFirstLetterToUpperCase } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";

export default function LocationGroupChatItem({
  groupChat,
}: {
  groupChat: IGroupChat;
}) {
  return (
    <View
      className="gap-y-4 rounded-lg border border-slate-300 overflow-hidden"
      style={{ backgroundColor: "#f1f5f9", elevation: 2, marginBottom: 28 }}
    >
      {/* header */}
      <View className="bg-primary flex-row items-center justify-between px-4 py-1">
        <View className="bg-slate-400 w-12 h-12 rounded-full border border-white">
          {groupChat?.image ? (
            <FastImage
              source={{ uri: groupChat.image }}
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

        <Text className="font-poppins-semiBold text-white text-lg">
          {groupChat.name}
        </Text>

        <View className="flex-row items-center gap-2">
          <Ionicons name="people" size={24} color="#eff6ff" />
          <Text className="font-poppins-semiBold text-white">
            {groupChat.members.length}/{groupChat.maxMembers}
          </Text>
        </View>
      </View>

      {/* details */}
      <View className="gap-y-2 px-4 items-start">
        <Text className="font-poppins-medium text-sm text-black">
          Sport type
        </Text>

        <View className="rounded-xl px-2 py-1 border border-slate-300">
          <Text className="font-poppins-regular text-sm text-black">
            {groupChat.sportType.name}
          </Text>
        </View>
      </View>

      {/* Preferred skill */}
      <View className="px-4 pb-4 flex-row items-end justify-between">
        <View className="gap-y-2">
          <Text className="font-poppins-medium text-sm text-black">
            Preferred skill
          </Text>
          <Text className="font-poppins-regular text-sm">
            {caseFirstLetterToUpperCase(groupChat.preferredSkill)}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-primary px-4 py-1 rounded-md"
          onPress={() => {
            router.push({
              pathname: `groupChats/${groupChat._id}` as "/",
              params: { loactionId: groupChat.locationId },
            });
          }}
        >
          <Text className="font-poppins-medium text-sm text-white">
            Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
