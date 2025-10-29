import { getAllNotification, markNotificationAsRead } from "@/api/notification";
import { INotification } from "@/types";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useGetAllNotifications() {
  return useQuery<INotification[]>({
    queryKey: ["notifications"],
    queryFn: getAllNotification,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: AxiosError | any) => {
      toast.error(
        error.response.data.message || "Failed to update notification status",
        {
          position: ToastPosition.BOTTOM,
          duration: 2000,
        }
      );
    },
  });
}
