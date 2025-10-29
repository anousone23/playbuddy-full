import { getAuthUser, login, logout } from "@/api/auth";
import { updateProfile } from "@/api/user";
import { IUser } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem("jwt", data.token);

      queryClient.invalidateQueries({ queryKey: ["authUser"] });

      toast.success("Login successfully");
    },
    onError: (error: AxiosError | any) => {
      toast.error(error.response.data.message || "Invalid credentials");
      console.log("Error from useLogin", error);
    },
  });
}

export function useGetAuthUser() {
  return useQuery<IUser>({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onMutate: () => {
      queryClient.clear();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });

      navigate("/signin", { replace: true });

      toast.success("Logout sucessfully");
    },
    onError: () => {
      toast.error("Failed to logout");
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });

      toast.success("Account updated successfully");
    },
    onError: (error: AxiosError | any) => {
      toast.error(error.response.data.message || "Failed to update account");
    },
  });
}
