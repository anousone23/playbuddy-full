import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";

import { getAllUserFriends, unfriend } from "@/api/friendship";
import { IFriendship } from "@/types";
import { socket } from "../socket";
import { UNFRIEND_EVENT } from "@/constants";

export function useGetAllUserFriends() {
  return useQuery<IFriendship[]>({
    queryKey: ["friendships"],
    queryFn: () => getAllUserFriends(),
  });
}

export function useUnfriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unfriend,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
      queryClient.invalidateQueries({ queryKey: ["driectChats"] });

      socket.emit(UNFRIEND_EVENT, {
        directChatId: data.directChatId,
        friendId: data.friendId,
      });

      toast.success("Unfriend successfully", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    },
    onError: (error: AxiosError | any) => {
      toast.error(error.response.data.message || "Failed to unfriend", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    },
  });
}
