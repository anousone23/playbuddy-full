import { Stack } from "expo-router";
import React from "react";

export default function LocationLayout() {
  return (
    <Stack>
      <Stack.Screen name="[locationId]/index" />
    </Stack>
  );
}
