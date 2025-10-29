import {
  acceptFriendRequest,
  getAllUserFriendRequests,
  getFriendRequestById,
  rejectFriendRequest,
} from "@/api/friendRequest";
import { IFriendRequest } from "@/types";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useGetAllFriendRequests({
  type,
  status,
}: {
  type?: string;
  status?: string;
}) {
  return useQuery<IFriendRequest[]>({
    queryKey: ["friendRequests", type],
    queryFn: () => getAllUserFriendRequests({ type, status }),
  });
}

export function useGetFriendRequestById(requestId: string) {
  return useQuery({
    queryKey: ["friendRequest", requestId],
    queryFn: () => getFriendRequestById(requestId),
    enabled: Boolean(requestId),
    retry: 0,
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequest"] });
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
      queryClient.invalidateQueries({ queryKey: ["directChats"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      toast.success("Friend request accepted", {
        position: ToastPosition.BOTTOM,
      });
    },
    onError: (error: AxiosError | any) => {
      toast.error(
        error.response.data.message || "Failed to accept friend request",
        {
          position: ToastPosition.BOTTOM,
        }
      );
    },
  });
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequest"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      toast.success("Friend request rejected", {
        position: ToastPosition.BOTTOM,
      });
    },
    onError: (error: AxiosError | any) => {
      toast.error(
        error.response.data.message || "Failed to reject friend request",
        {
          position: ToastPosition.BOTTOM,
        }
      );
    },
  });
}
