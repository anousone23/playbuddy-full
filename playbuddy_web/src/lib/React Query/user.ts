import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  acknowledgeReport,
  cancelAccountSuspension,
  getAllUserReports,
  getAllUsers,
  getDashboardData,
  getReportedUser,
  getUserById,
  getUserFriendNumber,
  getUserGroupChatNumber,
  suspendAccount,
} from "@/api/user";
import { DashbaordType, IReport, IUser } from "@/types";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useGetAllUsers() {
  return useQuery<IUser[]>({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });
}

export function useGetUserJoinedGroupChatNumber({
  userId,
}: {
  userId: string;
}) {
  return useQuery<number>({
    queryKey: ["users", userId, "joined-groupchat-number"],
    queryFn: () => getUserGroupChatNumber({ userId }),
  });
}

export function useGetUserFriendNumber({ userId }: { userId: string }) {
  return useQuery<number>({
    queryKey: ["users", userId, "friend-number"],
    queryFn: () => getUserFriendNumber({ userId }),
  });
}

export function useGetReportedUsers() {
  return useQuery<string[]>({
    queryKey: ["reportedUsers"],
    queryFn: getReportedUser,
  });
}

export function useGetUserById({ userId }: { userId: string }) {
  const query = useQuery<IUser>({
    queryKey: ["user", userId],
    queryFn: () => getUserById({ userId }),
  });

  if (query.isError) {
    toast.error(query.error.message);
  }

  return query;
}

export function useGetAllUserReports({ userId }: { userId: string }) {
  const query = useQuery<IReport[]>({
    queryKey: ["userReports", userId],
    queryFn: () => getAllUserReports({ userId }),
  });

  if (query.isError) {
    toast.error(query.error.message);
  }

  return query;
}

export function useAcknowledgeReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acknowledgeReport,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["userReports", data.reportedId],
      });

      toast.success("Report acknowledged");
    },
    onError: (error: AxiosError | any) => {
      console.log("Error from useAcknowledgeReport", error);

      toast.error(
        error.response.data.messgage || "Failed to acknowledge report"
      );
    },
  });
}

export function useSuspendAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: suspendAccount,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", data._id],
      });

      toast.success("User account suspended");
    },
    onError: (error: AxiosError | any) => {
      console.log("Error from useSuspendAccount", error);

      toast.error(error.response.data.messgage || "Failed to suspend accoutn");
    },
  });
}

export function useCancelAccountSuspension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelAccountSuspension,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", data._id],
      });

      toast.success("Account suspension canceled");
    },
    onError: (error: AxiosError | any) => {
      console.log("Error from useCancelAccountSuspension", error);

      toast.error(
        error.response.data.messgage || "Failed to cancel account suspension"
      );
    },
  });
}

export function useGetDashboardData() {
  return useQuery<DashbaordType>({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });
}
