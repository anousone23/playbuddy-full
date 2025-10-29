// src/hooks/useGroupChatByIdQuery.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";

import { IGroupChat, ISportType } from "@/types";
import {
  createGroupChat,
  getAllGroupChatsInLocation,
  getGroupChatById,
  getGroupChatNumberInLocation,
  getUserGroupChats,
  inviteToGroupChat,
  joinGroupChat,
  kickUserFromGroupChat,
  leaveGroupChat,
  reportGroupChat,
  setAsAdmin,
  updateGroupChat,
} from "@/api/groupChat";
import { Href, router } from "expo-router";
import { AxiosError } from "axios";

export function useGetGroupChatById(groupChatId: string) {
  const query = useQuery<IGroupChat, Error>({
    queryKey: ["groupChat", groupChatId],
    queryFn: () => getGroupChatById(groupChatId),
    enabled: Boolean(groupChatId),
  });

  useEffect(() => {
    if (query.isError) {
      // toast.error("Failed to fetch group chat", {
      //   position: ToastPosition.BOTTOM,
      // });
      console.warn("Failed to fetch group chat");
    }
  }, [query.status, query.error, query.isError]);

  return query;
}

export function useGetAllGroupChatsInLocation(locationId: string) {
  const query = useQuery<IGroupChat[], Error>({
    queryKey: ["groupChats"],
    queryFn: () => getAllGroupChatsInLocation(locationId),
    enabled: Boolean(locationId),
  });

  useEffect(() => {
    if (query.isError) {
      toast.error(query.error?.message || "Failed to fetch group chats", {
        position: ToastPosition.BOTTOM,
      });
    }
  }, [query.status, query.error, query.isError]);

  return query;
}

export function useGetGroupChatNumberInLocation(locationId: string) {
  const query = useQuery<number, Error>({
    queryKey: ["groupChatNumber"],
    queryFn: () => getGroupChatNumberInLocation(locationId),
    enabled: Boolean(locationId),
  });

  useEffect(() => {
    if (query.isError) {
      toast.error(query.error?.message || "Failed to fetch group chat count", {
        position: ToastPosition.BOTTOM,
      });
    }
  }, [query.status, query.error, query.isError]);

  return query;
}

export function useGetUserGroupChats(userId: string) {
  const query = useQuery<IGroupChat[], Error>({
    queryKey: ["userGroupChats"],
    queryFn: () => getUserGroupChats(userId),
  });

  useEffect(() => {
    if (query.isError) {
      toast.error(query.error?.message || "Failed to fetch user group chats", {
        position: ToastPosition.BOTTOM,
      });
    }
  }, [query.status, query.error, query.isError]);

  return query;
}

export function useCreateGroupChat({
  setForm,
  setSelectedSportType,
  setSelectedSkill,
}: {
  setForm: (form: {
    name: string;
    description: string;
    maxMembers: number;
  }) => void;
  setSelectedSportType: Dispatch<SetStateAction<ISportType | null>>;
  setSelectedSkill: Dispatch<SetStateAction<string>>;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroupChat,
    onSuccess: (data) => {
      toast.success(data.message || "Group chat created successfully", {
        position: ToastPosition.BOTTOM,
      });

      queryClient.invalidateQueries({ queryKey: ["groupChats"] });

      router.push(`groupChats/${data.data._id}/after-create` as Href);

      // Clear the form only on success.
      setForm({ name: "", description: "", maxMembers: 0 });
      setSelectedSportType(null);
      setSelectedSkill("");
    },
    onError: (error: AxiosError | any) => {
      toast.error(
        error.response.data.message || "Failed to create group chat",
        {
          position: ToastPosition.BOTTOM,
          duration: 2000,
        }
      );
      console.log(error.message);
    },
  });
}

export function useJoinGroupChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinGroupChat,
    onSuccess: () => {
      toast.success("Joined group chat successfully", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });

      queryClient.invalidateQueries({ queryKey: ["userGroupChats"] });
      queryClient.invalidateQueries({ queryKey: ["groupChats"] });
      queryClient.invalidateQueries({ queryKey: ["groupInvitations"] });

      router.push(`(tabs)/chat` as Href);
    },
    onError: (error: AxiosError | any) => {
      toast.error(error.response.data.message || "Failed to join group chat", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    },
  });
}

export function useUpdateGroupChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGroupChat,
    onSuccess: (updatedGroupChat) => {
      queryClient.invalidateQueries({
        queryKey: ["groupChat", updatedGroupChat._id],
      });

      toast.success("Group chat updated successfully", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    },
    onError: (error: AxiosError | any) => {
      toast.error(
        error.response.data.message || "Failed to update group chat",
        {
          position: ToastPosition.BOTTOM,
          duration: 2000,
        }
      );
    },
  });
}

export function useLeaveGroupChat() {
  return useMutation({
    mutationFn: leaveGroupChat,
    onSuccess: () => {
      toast.success("Left group chat successfully", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
      router.replace("/(tabs)/chat" as Href);
    },
    onError: (error: AxiosError | any) => {
      toast.error(error.response.data.message || "Failed to leave group chat", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    },
  });
}

export function useKickUserFromGroupChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kickUserFromGroupChat,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groupChats"] });
      queryClient.invalidateQueries({ queryKey: ["groupChat", data.data._id] });

      toast.success("User kicked successfully", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    },
    onError: (error: AxiosError | any) => {
      toast.error(
        error.response.data.message || "Failed to kick user from group chat",
        {
          position: ToastPosition.BOTTOM,
          duration: 2000,
        }
      );
    },
  });
}

export function useSetAsAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setAsAdmin,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groupChats"] });
      queryClient.invalidateQueries({ queryKey: ["groupChat", data.data._id] });

      toast.success("Admin status changed successfully", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    },
    onError: (error: AxiosError | any) => {
      toast.error(error.response.data.message || "Failed to set as admin", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    },
  });
}

export function useInviteToGroupChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inviteToGroupChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupInvitations"] });

      toast.success("Invitation sent successfully", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    },
    onError: (error: AxiosError | any) => {
      toast.error(
        error.response.data.message || "Failed to invite to group chat",
        {
          position: ToastPosition.BOTTOM,
          duration: 2000,
        }
      );
    },
  });
}

export function useReportGroupChat() {
  return useMutation({
    mutationFn: reportGroupChat,
    onSuccess: () => {
      toast.success("Group chat reported successfully", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    },
    onError: (error: AxiosError | any) => {
      toast.error(
        error.response.data.message || "Failed to report group chat",
        {
          position: ToastPosition.BOTTOM,
          duration: 2000,
        }
      );
    },
  });
}
