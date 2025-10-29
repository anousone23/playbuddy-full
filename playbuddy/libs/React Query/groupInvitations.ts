import {
  getAllUserGroupInvitations,
  getGroupInvitationById,
  rejectGroupInvitation,
} from "@/api/groupInvitation";
import { IGroupInvitation } from "@/types";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useGetAllUserGroupInvitations({
  type,
  status,
}: {
  type?: string;
  status?: string;
}) {
  return useQuery<IGroupInvitation[]>({
    queryKey: ["groupInvitations", type],
    queryFn: () => getAllUserGroupInvitations({ type, status }),
  });
}

export function useGetGroupInvitationById(invitationId: string) {
  return useQuery<IGroupInvitation>({
    queryKey: ["groupInvitation", invitationId],
    queryFn: () => getGroupInvitationById(invitationId),
    enabled: Boolean(invitationId),
  });
}

export function useRejectGroupInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectGroupInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupInvitations"] });
      queryClient.invalidateQueries({ queryKey: ["groupInvitation"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      toast.success("Invitation rejected successfully", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    },
    onError: (error: AxiosError | any) => {
      toast.error(
        error.response.data.message || "Failed to reject group invitation",
        {
          position: ToastPosition.BOTTOM,
          duration: 2000,
        }
      );
    },
  });
}
