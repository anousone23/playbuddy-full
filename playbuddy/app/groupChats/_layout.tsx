import HeaderNavigation from "@/components/shared/HeaderNavigation";
import { Stack } from "expo-router";
import React from "react";

export default function GroupChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[groupChatId]/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="createGroupChat"
        options={{
          header: () => <HeaderNavigation title="Create group chat" />,
        }}
      />
      <Stack.Screen
        name="[groupChatId]/after-create"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
