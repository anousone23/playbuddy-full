import {
  activateAccount,
  forgetPassword,
  getAuthUser,
  login,
  logout,
  resetPassword,
  signup,
  verifyOtp,
} from "@/api/auth";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Href, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Dispatch, SetStateAction } from "react";

import { updateFcmToken } from "@/api/user";
import { useAuthUser } from "@/contexts/AuthUserContext";
import { AxiosError } from "axios";
import { socket } from "../socket";

export function useSignup() {
  const { setAuthUser } = useAuthUser();
  return useMutation({
    mutationFn: signup,
    onSuccess: async (data) => {
      await SecureStore.setItemAsync("jwt", data);

      const user = await getAuthUser();

      if (user) {
        setAuthUser(user);
      }

      toast.success("Signup successfully", { position: ToastPosition.BOTTOM });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Signup failed", {
        position: ToastPosition.BOTTOM,
      });
    },
  });
}

export function useLogin() {
  const { setAuthUser } = useAuthUser();
  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      await SecureStore.setItemAsync("jwt", data);

      socket.connect();

      toast.success("Login successfully", { position: ToastPosition.BOTTOM });

      const user = await getAuthUser();

      if (user) {
        setAuthUser(user);
      }
    },
    onError: (error: AxiosError | any) => {
      toast.error(error.response?.data?.message || "Login failed", {
        position: ToastPosition.BOTTOM,
      });
    },
  });
}

export function useActivateAccount({
  setIsAccountDeativated,
}: {
  setIsAccountDeativated: Dispatch<SetStateAction<boolean>>;
}) {
  return useMutation({
    mutationFn: activateAccount,
    onSuccess: () => {
      toast.success("Account activated successfully", {
        position: ToastPosition.BOTTOM,
      });
      setIsAccountDeativated(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to activate accont",
        {
          position: ToastPosition.BOTTOM,
        }
      );
    },
  });
}

export function useLogout() {
  const { setAuthUser } = useAuthUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onMutate: () => {
      queryClient.clear();
    },
    onSuccess: async () => {
      socket.disconnect();

      setAuthUser(null);

      toast.success("Logout successfully", { position: ToastPosition.BOTTOM });

      router.dismissTo("/(auth)/sign-in" as Href);

      queryClient.clear();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Logout failed", {
        position: ToastPosition.BOTTOM,
      });
    },
  });
}

export function useForgetPassword() {
  return useMutation({
    mutationFn: forgetPassword,
    onSuccess: (data, email: string) => {
      toast.success(data.message, { position: ToastPosition.BOTTOM });
      router.replace({ pathname: "/(auth)/otp", params: { email } } as Href);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to send reset password request",
        { position: ToastPosition.BOTTOM }
      );
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: forgetPassword,
    onSuccess: () => {
      toast.success("Code resent", { position: ToastPosition.BOTTOM });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to resend code", {
        position: ToastPosition.BOTTOM,
      });
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ otp, email }: { otp: string; email: string }) =>
      verifyOtp(otp, email),
    onSuccess: (data, variables) => {
      toast.success(data.message, { position: ToastPosition.BOTTOM });

      router.replace({
        pathname: "/(auth)/reset-password",
        params: { email: variables.email },
      } as Href);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "OTP verification failed", {
        position: ToastPosition.BOTTOM,
      });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      email,
      newPassword,
      confirmNewPassword,
    }: {
      email: string;
      newPassword: string;
      confirmNewPassword: string;
    }) => resetPassword(email, newPassword, confirmNewPassword),
    onSuccess: (data) => {
      toast.success(data.message, { position: ToastPosition.BOTTOM });
      router.replace("/(auth)/sign-in" as Href);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Reset password failed", {
        position: ToastPosition.BOTTOM,
      });
    },
  });
}

export function useUpdateFcmToken() {
  return useMutation({
    mutationFn: updateFcmToken,
    onError: (error: any) => {
      console.log(
        error.response?.data?.message || "Failed to update FCM token"
      );
    },
  });
}
