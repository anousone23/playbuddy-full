import {
  acknowledgeGroupChatReport,
  deleteGroupChat,
  getAllGroupChat,
  getAllGroupChatReports,
  getGroupChatById,
  getReportedGroupChats,
  updateGroupChat,
} from "@/api/groupChat";
import { IGroupChat, IReport } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function useGetAllGroupChats() {
  return useQuery<IGroupChat[]>({
    queryKey: ["groupChats"],
    queryFn: getAllGroupChat,
  });
}

export function useGetReportedGroupChats() {
  return useQuery<string[]>({
    queryKey: ["groupChatReports"],
    queryFn: getReportedGroupChats,
  });
}

export function useGetGroupChatById({ groupChatId }: { groupChatId: string }) {
  return useQuery<IGroupChat>({
    queryKey: ["groupChat", groupChatId],
    queryFn: () => getGroupChatById({ groupChatId }),
  });
}

export function useGetAllGroupChatReports({
  groupChatId,
}: {
  groupChatId: string;
}) {
  return useQuery<IReport[]>({
    queryKey: ["groupChatReports", groupChatId],
    queryFn: () => getAllGroupChatReports({ groupChatId }),
  });
}

export function useUpdateGroupChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGroupChat,
    onSuccess: (data) => {
      toast.success("Group chat updated successfully");
      queryClient.invalidateQueries({ queryKey: ["groupChat", data.data._id] });
    },
    onError: (error: AxiosError | any) => {
      console.log("Error from useUpdateGroupChat", error);
      toast.error(error.response.data.message || "Failed to update group chat");
    },
  });
}

export function useAcknowledgeGroupChatReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acknowledgeGroupChatReport,
    onSuccess: (data) => {
      console.log(data);

      queryClient.invalidateQueries({
        queryKey: ["groupChatReports", data.reportedId],
      });

      toast.success("Report acknowledged");
    },
    onError: (error: AxiosError | any) => {
      console.log("Error from useAcknowledgeGroupChatReport", error);

      toast.error(
        error.response.data.messgage || "Failed to acknowledge report"
      );
    },
  });
}

export function useDeleteGroupChat() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: deleteGroupChat,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groupChats"],
      });

      toast.success("Group chat deleted successfully");
      navigate("/groupChats", { replace: true });
    },
    onError: (error: AxiosError | any) => {
      console.log("Error from useDeleteGroupChat", error);

      toast.error(
        error.response.data.messgage || "Failed to delete group chat"
      );
    },
  });
}
