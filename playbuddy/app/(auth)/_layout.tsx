import { Redirect, Stack } from "expo-router";
import React from "react";

import { useAuthUser } from "@/contexts/AuthUserContext";

export default function AuthLayout() {
  const { authUser, isLoadingAuthUser } = useAuthUser();

  if (!isLoadingAuthUser && authUser)
    return <Redirect href={"/(tabs)/explore"} />;

  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="forget-password" options={{ headerShown: false }} />
      <Stack.Screen name="otp" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
    </Stack>
  );
}
