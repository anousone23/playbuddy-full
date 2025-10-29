import uuid from "react-native-uuid";
import { getAllUserGroupMessages, sendGroupMessage } from "@/api/groupMessage";
import { IGroupMessage } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { socket } from "../socket";
import { SEND_GROUP_MESSAGE_EVENT } from "@/constants";
import { useAuthUser } from "@/contexts/AuthUserContext";

export function useGetAllUserGroupMessages({
  groupChatId,
}: {
  groupChatId: string;
}) {
  return useQuery<IGroupMessage[]>({
    queryKey: ["groupMessages", groupChatId],
    queryFn: () => getAllUserGroupMessages({ groupChatId }),
  });
}

// export function useSendGroupMessage() {
//   const queryClient = useQueryClient();
//   const { authUser } = useAuthUser();

//   return useMutation({
//     mutationFn: sendGroupMessage,
//     onMutate: async ({ groupChatId, data }) => {
//       await queryClient.cancelQueries({
//         queryKey: ["groupMessages", groupChatId],
//       });

//       const previousMessages = queryClient.getQueryData([
//         "groupMessages",
//         groupChatId,
//       ]) as IGroupMessage[];

//       const optimisticMessage: IGroupMessage = {
//         _id: uuid.v4(),
//         sender: authUser!,
//         text: data.text || null,
//         image: data.image || null,
//         groupChatId,
//         readBy: [],
//         createdAt: new Date(),
//       };

//       queryClient.setQueryData(
//         ["groupMessages", groupChatId],
//         (old: IGroupMessage[]) => [...old, optimisticMessage]
//       );

//       return { previousMessages };
//     },
//     onSuccess: (data) => {
//       socket.emit(SEND_GROUP_MESSAGE_EVENT, data.data);

//       queryClient.invalidateQueries({ queryKey: ["notifications"] });
//     },
//     onError: (error: AxiosError | any, { groupChatId }, context) => {
//       toast.error(error.response.data.message || "Failed to send message ", {
//         position: ToastPosition.BOTTOM,
//       });
//       queryClient.setQueryData(
//         ["groupMessages", groupChatId],
//         context?.previousMessages
//       );
//     },
//     // Always refetch after error or success:
//     onSettled: (data) => {
//       queryClient.invalidateQueries({
//         queryKey: ["groupMessages", data.data.groupChatId],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["userGroupChats"],
//       });
//     },
//   });
// }

export function useSendGroupMessage() {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  return useMutation({
    mutationFn: sendGroupMessage,
    onMutate: async ({ groupChatId, data }) => {
      try {
        await queryClient.cancelQueries({
          queryKey: ["groupMessages", groupChatId],
        });

        const previousMessages = queryClient.getQueryData([
          "groupMessages",
          groupChatId,
        ]) as IGroupMessage[];

        const optimisticMessage: IGroupMessage = {
          _id: uuid.v4(),
          sender: authUser!,
          text: data.text || null,
          image: data.image || null,
          groupChatId,
          readBy: [],
          createdAt: new Date(),
        };

        queryClient.setQueryData(
          ["groupMessages", groupChatId],
          (old: IGroupMessage[] = []) => [...old, optimisticMessage]
        );

        return { previousMessages, groupChatId };
      } catch (error) {
        console.error("Error in onMutate: ", (error as Error).message || "");

        return { previousMessages: undefined, groupChatId };
      }
    },
    onSuccess: (data) => {
      socket.emit(SEND_GROUP_MESSAGE_EVENT, data.data);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: AxiosError | any, variables, context) => {
      toast.error(error.response?.data?.message || "Failed to send message", {
        position: ToastPosition.BOTTOM,
      });

      if (context?.previousMessages && context?.groupChatId) {
        queryClient.setQueryData(
          ["groupMessages", context.groupChatId],
          context.previousMessages
        );
      }
    },
    onSettled: (data, error, variables, context) => {
      const groupChatId =
        data?.data?.groupChatId ||
        context?.groupChatId ||
        variables?.groupChatId;

      if (groupChatId) {
        queryClient.invalidateQueries({
          queryKey: ["groupMessages", groupChatId],
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["userGroupChats"],
      });
    },
  });
}
