import HeaderNavigation from "@/components/shared/HeaderNavigation";
import { Stack } from "expo-router";
import React from "react";

export default function ChatsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="connections"
        options={{
          header: () => <HeaderNavigation title="Connections" />,
        }}
      />
      <Stack.Screen
        name="addFriend"
        options={{
          header: () => <HeaderNavigation title="Add friend" />,
        }}
      />
      <Stack.Screen name="directChat" options={{ headerShown: false }} />
      <Stack.Screen name="groupChat" options={{ headerShown: false }} />
    </Stack>
  );
}
