import uuid from "react-native-uuid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import {
  getAllUserDirectMessages,
  sendDirectMessage,
} from "@/api/directMessage";
import { IDirectMessage, IUser } from "@/types";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { socket } from "../socket";
import { SEND_DIRECT_MESSAGE_EVENT } from "@/constants";
import { useAuthUser } from "@/contexts/AuthUserContext";

export function useGetAllUserDirectMessages({
  directChatId,
}: {
  directChatId: string;
}) {
  return useQuery<IDirectMessage[]>({
    queryKey: ["directMessages", directChatId],
    queryFn: () => getAllUserDirectMessages({ directChatId }),
  });
}

// export function useSendDirectMessage() {
//   const queryClient = useQueryClient();
//   const { authUser } = useAuthUser();

//   return useMutation({
//     mutationFn: sendDirectMessage,
//     onMutate: async ({ directChatId, data }) => {
//       try {
//         await queryClient.cancelQueries({
//           queryKey: ["directMessages", directChatId],
//         });

//         const previousMessages = queryClient.getQueryData([
//           "directMessages",
//           directChatId,
//         ]) as IDirectMessage[];

//         const optimisticMessage: IDirectMessage = {
//           _id: uuid.v4(),
//           sender: {
//             _id: authUser?._id!,
//             name: authUser?.name!,
//             image: authUser?.image!,
//           } as IUser,
//           receiver: {
//             _id: data.receiverId,
//           } as IUser,
//           text: data.text || null,
//           image: data.image || null,
//           directChatId,
//           isRead: false,
//           createdAt: new Date(),
//         };

//         queryClient.setQueryData(
//           ["directMessages", directChatId],
//           (old: IDirectMessage[]) => [...old, optimisticMessage]
//         );

//         return { previousMessages };
//       } catch (error) {
//         console.error("Error in onMutate: ", (error as Error).message || "");
//         throw error;
//       }
//     },
//     onSuccess: (data) => {
//       socket.emit(SEND_DIRECT_MESSAGE_EVENT, data.data);

//       queryClient.invalidateQueries({ queryKey: ["notifications"] });
//     },
//     onError: (error: AxiosError | any, { directChatId }, context) => {
//       toast.error(error.response.data.message || "Failed to send message ", {
//         position: ToastPosition.BOTTOM,
//       });
//       queryClient.setQueryData(
//         ["directMessages", directChatId],
//         context?.previousMessages
//       );
//     },
//     // Always refetch after error or success:
//     onSettled: (data) => {
//       queryClient.invalidateQueries({
//         queryKey: ["directMessages", data.data.directChatId],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["directChats"],
//       });
//     },
//   });
// }

export function useSendDirectMessage() {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  return useMutation({
    mutationFn: sendDirectMessage,
    onMutate: async ({ directChatId, data }) => {
      try {
        await queryClient.cancelQueries({
          queryKey: ["directMessages", directChatId],
        });

        const previousMessages = queryClient.getQueryData([
          "directMessages",
          directChatId,
        ]) as IDirectMessage[];

        const optimisticMessage: IDirectMessage = {
          _id: uuid.v4(),
          sender: {
            _id: authUser?._id!,
            name: authUser?.name!,
            image: authUser?.image!,
          } as IUser,
          receiver: {
            _id: data.receiverId,
          } as IUser,
          text: data.text || null,
          image: data.image || null,
          directChatId,
          isRead: false,
          createdAt: new Date(),
        };

        queryClient.setQueryData(
          ["directMessages", directChatId],
          (old: IDirectMessage[] = []) => [...old, optimisticMessage]
        );

        return { previousMessages, directChatId };
      } catch (error) {
        console.error("Error in onMutate: ", (error as Error).message || "");

        return { previousMessages: undefined, directChatId };
      }
    },
    onSuccess: (data) => {
      socket.emit(SEND_DIRECT_MESSAGE_EVENT, data.data);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: AxiosError | any, variables, context) => {
      toast.error(error.response?.data?.message || "Failed to send message", {
        position: ToastPosition.BOTTOM,
      });

      if (context?.previousMessages && context?.directChatId) {
        queryClient.setQueryData(
          ["directMessages", context.directChatId],
          context.previousMessages
        );
      }
    },
    onSettled: (data, error, variables, context) => {
      const directChatId =
        data?.data?.directChatId ||
        context?.directChatId ||
        variables?.directChatId;

      if (directChatId) {
        queryClient.invalidateQueries({
          queryKey: ["directMessages", directChatId],
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["directChats"],
      });
    },
  });
}
