// context/OnlineUsersContext.tsx
import {
  DIRECT_MESSAGES_READ,
  GROUP_MESSAGES_READ,
  ONLINE_USERS_EVENT,
  RECEIVE_DIRECT_MESSAGE_EVENT,
  RECEIVE_GROUP_MESSAGE_EVENT,
  UNFRIEND_EVENT_RECEIVE,
  UPDATE_GROUPCHAT_LASTMESSAGE,
  UPDATE_GROUPCHAT_LASTMESSAGE_READ_STATUS,
} from "@/constants";
import { socket } from "@/libs/socket";
import { IDirectMessage, IGroupMessage } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";

type SocketContextType = {
  onlineUsers: string[];
  setOnlineUsers: (users: string[]) => void;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    socket.on(ONLINE_USERS_EVENT, (onlineUsers) => {
      setOnlineUsers(onlineUsers);
    });

    socket.on(RECEIVE_DIRECT_MESSAGE_EVENT, (newMessage: IDirectMessage) => {
      // real time message in direct chat screen
      // queryClient.setQueryData(
      //   ["directMessages", newMessage.directChatId],
      //   (old: IDirectMessage[]) => {
      //     if (!old) return [newMessage];

      //     return [...old, newMessage];
      //   }
      // );
      queryClient.invalidateQueries({
        queryKey: ["directMessages", newMessage.directChatId],
      });

      // real time message in chat screen (direct chat last message)
      // queryClient.setQueryData(
      //   ["directChats"],
      //   (directChats: IDirectChat[]) => {
      //     if (directChats) {
      //       return directChats.map((directChat) => {
      //         if (directChat._id === newMessage.directChatId) {
      //           return {
      //             ...directChat,
      //             lastMessage: newMessage,
      //           };
      //         }
      //         return directChat;
      //       });
      //     }

      //     return directChats;
      //   }
      // );
      queryClient.invalidateQueries({
        queryKey: ["directChats"],
      });
    });

    socket.on(RECEIVE_GROUP_MESSAGE_EVENT, (newMessage: IGroupMessage) => {
      // real time message in direct chat screen
      // queryClient.setQueryData(
      //   ["groupMessages", newMessage.groupChatId],
      //   (old: IGroupMessage[]) => {
      //     if (!old) return [newMessage];

      //     return [...old, newMessage];
      //   }
      // );

      // real time message in direct chat screen (work around)
      queryClient.invalidateQueries({
        queryKey: ["groupMessages", newMessage.groupChatId],
      });
    });

    socket.on(UPDATE_GROUPCHAT_LASTMESSAGE, (newMessage: IGroupMessage) => {
      // queryClient.setQueryData(
      //   ["userGroupChats"],
      //   (groupChats: IGroupChat[]) => {
      //     if (groupChats) {
      //       return groupChats.map((groupChat) => {
      //         if (groupChat._id === newMessage.groupChatId) {
      //           return {
      //             ...groupChat,
      //             lastMessage: {
      //               ...newMessage,
      //               sender: (newMessage.sender as IUser)._id,
      //             },
      //           };
      //         }
      //         return groupChat;
      //       });
      //     }

      //     return groupChats;
      //   }
      // );
      queryClient.invalidateQueries({ queryKey: ["userGroupChats"] });
    });

    socket.on(DIRECT_MESSAGES_READ, ({ directChatId, updatedMessageIds }) => {
      // queryClient.setQueryData(
      //   ["directMessages", directChatId],
      //   (oldMessages: IDirectMessage[]) => {
      //     if (oldMessages) {
      //       return oldMessages.map((message) => {
      //         if (updatedMessageIds.includes(message._id)) {
      //           return { ...message, isRead: true };
      //         }
      //         return message;
      //       });
      //     }
      //     return oldMessages;
      //   }
      // );
      queryClient.invalidateQueries({
        queryKey: ["directMessages", directChatId],
      });

      // update the last message in the direct chat list
      // queryClient.setQueryData(
      //   ["directChats"],
      //   (directChats: IDirectChat[]) => {
      //     if (directChats) {
      //       return directChats.map((directChat) => {
      //         if (directChat._id === directChatId) {
      //           return {
      //             ...directChat,
      //             lastMessage: {
      //               ...(directChat.lastMessage as IDirectMessage),
      //               isRead: true,
      //             },
      //           };
      //         }

      //         return directChat;
      //       });
      //     }

      //     return directChats;
      //   }
      // )
      queryClient.invalidateQueries({
        queryKey: ["directChats"],
      });
    });

    socket.on(
      GROUP_MESSAGES_READ,
      ({ groupChatId, updatedMessageIds, reader }) => {
        // queryClient.setQueryData(
        //   ["groupMessages", groupChatId],
        //   (messages: IGroupMessage[]) => {
        //     if (messages) {
        //       return messages.map((message) => {
        //         if (updatedMessageIds.includes(message._id)) {
        //           return { ...message, readBy: [...message.readBy, reader] };
        //         }
        //         return message;
        //       });
        //     }
        //     return messages;
        //   }
        // );
        queryClient.invalidateQueries({
          queryKey: ["groupMessages", groupChatId],
        });
      }
    );

    socket.on(UPDATE_GROUPCHAT_LASTMESSAGE_READ_STATUS, () => {
      queryClient.invalidateQueries({ queryKey: ["userGroupChats"] });
    });

    socket.on(UNFRIEND_EVENT_RECEIVE, ({ directChatId }) => {
      queryClient.invalidateQueries({ queryKey: ["directChats"] });
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    });

    return () => {
      socket.off(ONLINE_USERS_EVENT);
      socket.off(RECEIVE_DIRECT_MESSAGE_EVENT);
      socket.off(RECEIVE_GROUP_MESSAGE_EVENT);
      socket.off(UPDATE_GROUPCHAT_LASTMESSAGE);
      socket.off(DIRECT_MESSAGES_READ);
      socket.off(GROUP_MESSAGES_READ);
      socket.off(UPDATE_GROUPCHAT_LASTMESSAGE_READ_STATUS);
      socket.off(UNFRIEND_EVENT_RECEIVE);
    };
  }, [queryClient]);

  return (
    <SocketContext.Provider value={{ onlineUsers, setOnlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketOld = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useOnlineUsers must be used within OnlineUsersProvider");
  return context;
};
