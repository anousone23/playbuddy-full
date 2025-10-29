import * as SecureStore from "expo-secure-store";
import axiosInstance from "@/libs/axios";
import { IUser, LoginFormType, SignupFormType } from "@/types";

export async function getAuthUser(): Promise<IUser | null> {
  const jwtToken = await SecureStore.getItemAsync("jwt");

  if (!jwtToken) {
    return null;
  }

  const res = await axiosInstance.get("/api/auth/user");
  return res.data.data;
}

export async function signup(credential: SignupFormType) {
  const res = await axiosInstance.post("/api/auth/sign-up", credential);
  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function login(credential: LoginFormType) {
  const res = await axiosInstance.post("/api/auth/login", credential);
  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function activateAccount(email: string) {
  const res = await axiosInstance.post("/api/auth/activate-account", { email });

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

export async function logout() {
  await SecureStore.deleteItemAsync("jwt");
  return { message: "Logged out successfully" };
}

export async function forgetPassword(email: string) {
  const res = await axiosInstance.post("/api/auth/forget-password", { email });
  if (res.data.status === "error") throw new Error(res.data.message);
  return res.data;
}

export async function verifyOtp(otp: string, email: string) {
  const res = await axiosInstance.post("/api/auth/verify-otp", { otp, email });
  if (res.data.status === "error") throw new Error(res.data.message);
  return res.data;
}

export async function resetPassword(
  email: string,
  newPassword: string,
  confirmNewPassword: string
) {
  const res = await axiosInstance.post("/api/auth/reset-password", {
    email,
    newPassword,
    confirmNewPassword,
  });
  if (res.data.status === "error") throw new Error(res.data.message);
  return res.data;
}
