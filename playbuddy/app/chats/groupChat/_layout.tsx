import HeaderNavigation from "@/components/shared/HeaderNavigation";
import { Stack } from "expo-router";
import React from "react";

export default function DirectChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[groupChatId]/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="[groupChatId]/details"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="[groupChatId]/invite"
        options={{
          header: () => <HeaderNavigation title="Invite people" />,
        }}
      />
      <Stack.Screen
        name="[groupChatId]/members"
        options={{
          header: () => <HeaderNavigation title="Group members" />,
        }}
      />
    </Stack>
  );
}
