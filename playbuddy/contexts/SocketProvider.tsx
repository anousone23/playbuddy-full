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
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

type SocketContextType = {
  onlineUsers: string[];
  setOnlineUsers: Dispatch<SetStateAction<string[]>>;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const handleOnlineUsers = (onlineUsers: string[]) => {
      setOnlineUsers(onlineUsers);
    };

    const handleDirectMessage = (newMessage: IDirectMessage) => {
      queryClient.invalidateQueries({
        queryKey: ["directMessages", newMessage.directChatId],
      });
      queryClient.invalidateQueries({
        queryKey: ["directChats"],
      });
    };

    const handleGroupMessage = (newMessage: IGroupMessage) => {
      queryClient.invalidateQueries({
        queryKey: ["groupMessages", newMessage.groupChatId],
      });
    };

    const handleUpdateGroupLastMessage = (newMessage: IGroupMessage) => {
      queryClient.invalidateQueries({ queryKey: ["userGroupChats"] });
    };

    const handleDirectMessagesRead = ({
      directChatId,
      updatedMessageIds,
    }: any) => {
      queryClient.invalidateQueries({
        queryKey: ["directMessages", directChatId],
      });
      queryClient.invalidateQueries({
        queryKey: ["directChats"],
      });
    };

    const handleGroupMessagesRead = ({
      groupChatId,
      updatedMessageIds,
      reader,
    }: any) => {
      queryClient.invalidateQueries({
        queryKey: ["groupMessages", groupChatId],
      });
    };

    const handleUpdateGroupLastMessageReadStatus = () => {
      queryClient.invalidateQueries({ queryKey: ["userGroupChats"] });
    };

    const handleUnfriend = ({ directChatId }: any) => {
      queryClient.invalidateQueries({ queryKey: ["directChats"] });
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    };

    socket.on(ONLINE_USERS_EVENT, handleOnlineUsers);
    socket.on(RECEIVE_DIRECT_MESSAGE_EVENT, handleDirectMessage);
    socket.on(RECEIVE_GROUP_MESSAGE_EVENT, handleGroupMessage);
    socket.on(UPDATE_GROUPCHAT_LASTMESSAGE, handleUpdateGroupLastMessage);
    socket.on(DIRECT_MESSAGES_READ, handleDirectMessagesRead);
    socket.on(GROUP_MESSAGES_READ, handleGroupMessagesRead);
    socket.on(
      UPDATE_GROUPCHAT_LASTMESSAGE_READ_STATUS,
      handleUpdateGroupLastMessageReadStatus
    );
    socket.on(UNFRIEND_EVENT_RECEIVE, handleUnfriend);

    return () => {
      socket.off(ONLINE_USERS_EVENT, handleOnlineUsers);
      socket.off(RECEIVE_DIRECT_MESSAGE_EVENT, handleDirectMessage);
      socket.off(RECEIVE_GROUP_MESSAGE_EVENT, handleGroupMessage);
      socket.off(UPDATE_GROUPCHAT_LASTMESSAGE, handleUpdateGroupLastMessage);
      socket.off(DIRECT_MESSAGES_READ, handleDirectMessagesRead);
      socket.off(GROUP_MESSAGES_READ, handleGroupMessagesRead);
      socket.off(
        UPDATE_GROUPCHAT_LASTMESSAGE_READ_STATUS,
        handleUpdateGroupLastMessageReadStatus
      );
      socket.off(UNFRIEND_EVENT_RECEIVE, handleUnfriend);
    };
  }, [queryClient]);

  return (
    <SocketContext.Provider value={{ onlineUsers, setOnlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useOnlineUsers must be used within OnlineUsersProvider");
  return context;
};
