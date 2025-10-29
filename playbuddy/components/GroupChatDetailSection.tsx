import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";

export default function GroupChatDetailSection() {
  return (
    <ScrollView className="flex-1 px-5 mt-8 gap-y-4">
      <View className="gap-y-4">
        <View className="gap-y-2">
          <Text className="font-poppins-semiBold text-black">Username</Text>
          <Text className="font-poppins-regular text-black">lnwzamild</Text>
        </View>

        <View className="h-[1px] bg-slate-200" />

        <View className="gap-y-2">
          <Text className="font-poppins-semiBold text-black">Display name</Text>
          <Text className="font-poppins-regular text-black">Mild</Text>
        </View>

        <View className="h-[1px] bg-slate-200" />

        <TouchableOpacity>
          <Text className="font-poppins-semiBold text-red-500">Unfriend</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
