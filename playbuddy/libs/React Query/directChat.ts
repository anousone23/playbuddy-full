import { getAllUserDirectChats, getDirectChatById } from "@/api/directChat";
import { IDirectChat } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useGetAllUserDirectChats() {
  return useQuery<IDirectChat[]>({
    queryKey: ["directChats"],
    queryFn: getAllUserDirectChats,
  });
}

export function useGetDirectChatById(directChatId: string) {
  return useQuery<IDirectChat>({
    queryKey: ["directChat", directChatId],
    queryFn: () => getDirectChatById(directChatId),
  });
}
