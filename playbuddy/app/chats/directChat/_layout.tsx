import { Stack } from "expo-router";
import React from "react";

export default function DirectChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[directChatId]/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="[directChatId]/details"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
