import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

export default function HeaderNavigation({
  title,
}: {
  title: string | undefined;
}) {
  return (
    <View
      className="flex-row items-center bg-slate-50 px-5"
      style={{ paddingVertical: 20, paddingTop: 54, elevation: 1 }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <AntDesign name="left" size={20} color="#172554" />
      </TouchableOpacity>
      <View className="flex-1 items-center">
        <Text className="font-poppins-semiBold text-black text-xl">
          {title || "Location Details"}
        </Text>
      </View>
    </View>
  );
}
