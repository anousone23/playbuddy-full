import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { ActivityIndicator, Animated, View } from "react-native";

export default function HiddenItem({
  swipeAnimatedValue,
  isDeletingNotification,
}: {
  swipeAnimatedValue: Animated.Value;
  isDeletingNotification: boolean;
}) {
  return (
    <Animated.View
      className="flex-row h-full bg-slate-200"
      style={{
        opacity: swipeAnimatedValue.interpolate({
          inputRange: [-260, -200],
          outputRange: [1, 0], // Opacity changes from 1 (fully visible) to 0 (fully hidden)
          extrapolate: "clamp", // Ensures the value doesn't go beyond the specified range
        }),
      }}
    >
      <View className="flex-1"></View>

      <View className="bg-red-500 h-full w-[20%] rounded-lg items-center justify-center ">
        {isDeletingNotification ? (
          <ActivityIndicator size={"small"} color={"#f0f9ff"} />
        ) : (
          <MaterialIcons name="delete-outline" size={24} color="#f0f9ff" />
        )}
      </View>
    </Animated.View>
  );
}
