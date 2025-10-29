import { AntDesign } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Href, router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DirectChatItem from "@/components/DirectChatItem";
import GroupChatItem from "@/components/GroupChatItem";
import { useAuthUser } from "@/contexts/AuthUserContext";
import { useGetAllUserDirectChats } from "@/libs/React Query/directChat";
import { useGetAllFriendRequests } from "@/libs/React Query/friendRequest";
import { useGetUserGroupChats } from "@/libs/React Query/groupChat";
import { useGetAllUserGroupInvitations } from "@/libs/React Query/groupInvitations";
import { IDirectMessage, IUser } from "@/types";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator } from "react-native-paper";

export default function ChatScreen() {
  const [selectedChatSection, setSelectedChatSection] = useState("groupChat");
  const [search, setSearch] = useState("");
  const [groupChatsRefreshing] = useState(false);
  const [directChatsRefreshing] = useState(false);

  const { authUser, isLoadingAuthUser } = useAuthUser();
  const {
    data: groupChats,
    isLoading: isGettingUserGroupChats,
    refetch: refetchGroupChats,
  } = useGetUserGroupChats(authUser?._id || "");
  const {
    data: directChats,
    isLoading: isGettingDirectChats,
    refetch: refetchDirectChats,
  } = useGetAllUserDirectChats();
  const { data: friendRequests, isLoading: isGettingFriendRequests } =
    useGetAllFriendRequests({ type: "received", status: "pending" });
  const { data: groupInvitations, isLoading: isGettingGroupInvitations } =
    useGetAllUserGroupInvitations({ type: "received", status: "pending" });

  if (
    isGettingFriendRequests ||
    isGettingGroupInvitations ||
    isGettingUserGroupChats ||
    isGettingDirectChats
  )
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size={"large"} color="#0ea5e9"></ActivityIndicator>
      </SafeAreaView>
    );

  // sort by last message createdAt
  const directChatsWithMessages = directChats
    ? directChats
        .filter((directChat) => directChat.lastMessage !== null)
        .sort(
          (a, b) =>
            new Date((b.lastMessage as IDirectMessage).createdAt).getTime() -
            new Date((a.lastMessage as IDirectMessage).createdAt).getTime()
        )
    : [];

  const sortedGroupChats = groupChats
    ? [...groupChats].sort((a, b) => {
        const aDate = a.lastMessage
          ? new Date((a.lastMessage as any).createdAt).getTime()
          : 0;
        const bDate = b.lastMessage
          ? new Date((b.lastMessage as any).createdAt).getTime()
          : 0;

        if (bDate !== aDate) {
          return bDate - aDate; // newest first
        }

        return a.name.localeCompare(b.name);
      })
    : [];

  // filter by search
  const displayedGroupChats =
    selectedChatSection === "groupChat" && search
      ? groupChats?.filter((groupChat) =>
          groupChat.name.toLowerCase().includes(search.toLowerCase())
        )
      : sortedGroupChats;

  const displayedDirectChats =
    selectedChatSection === "directChat" && search
      ? directChats?.filter((chat) => {
          const friend =
            (chat.user1 as IUser)._id === authUser?._id
              ? (chat.user2 as IUser)
              : (chat.user1 as IUser);

          return friend.name.toLowerCase().includes(search.toLowerCase());
        })
      : directChatsWithMessages;

  const receviedPendingRequests = friendRequests?.filter(
    (request) => (request.receiver as IUser)._id === authUser?._id
  );
  const haveRequests =
    receviedPendingRequests?.length! > 0 || groupInvitations?.length! > 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5">
      {/* header */}
      <View className="mt-8 flex-row items-center">
        <TextInput
          className="bg-slate-50 border font-poppins-regular border-slate-300 rounded-lg px-4 py-1 flex-1"
          style={{ elevation: 5 }}
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
        />

        <View className="absolute top-[8px] right-24">
          <AntDesign name="search1" size={20} color="#17255490" />
        </View>

        <TouchableOpacity
          className="pl-8 pr-2 relative"
          onPress={() => {
            router.push("/chats/connections" as Href);
          }}
        >
          <FontAwesome5 name="user-friends" size={24} color="#172554" />

          {haveRequests && (
            <View className="w-3 h-3 bg-red-500 rounded-full border border-red-500  absolute -right-1 -top-1"></View>
          )}
        </TouchableOpacity>
      </View>

      <View className="h-[1px] bg-slate-200 mt-8"></View>

      {/* chat section */}
      <View className="flex-row items-center justify-center">
        <TouchableOpacity
          className={`flex-1 border border-slate-300 py-2 rounded-tl-lg ${
            selectedChatSection === "groupChat" && "border-primary bg-primary"
          }`}
          onPress={() => {
            setSearch("");
            setSelectedChatSection("groupChat");
          }}
        >
          <Text
            className={`font-poppins-medium text-center ${
              selectedChatSection === "groupChat" && "text-white"
            }`}
          >
            Group chats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 border border-slate-300 py-2 rounded-tr-lg ${
            selectedChatSection === "directChat" && "bg-primary border-primary"
          }`}
          onPress={() => {
            setSearch("");
            setSelectedChatSection("directChat");
          }}
        >
          <Text
            className={`font-poppins-medium text-center ${
              selectedChatSection === "directChat" && "text-white"
            }`}
          >
            Direct chats
          </Text>
        </TouchableOpacity>
      </View>

      {selectedChatSection === "groupChat" &&
        (isGettingUserGroupChats || isLoadingAuthUser ? (
          <ActivityIndicator
            className="flex-1"
            size={"small"}
            color="#0ea5e9"
          ></ActivityIndicator>
        ) : groupChats!.length > 0 ? (
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={groupChatsRefreshing}
                onRefresh={() => refetchGroupChats()}
                colors={["#0ea5e9"]}
              />
            }
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center pt-20 gap-y-2">
                <Text className="font-poppins-medium text-black text-lg">
                  No active group chat
                </Text>

                <Text className="font-poppins-medium text-black text-lg">
                  Try searching and start chating
                </Text>
              </View>
            )}
            className="mt-8"
            data={displayedGroupChats}
            contentContainerStyle={{ rowGap: 12 }}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <GroupChatItem groupChat={item} />}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="font-poppins-medium text-xl text-black text-center">
              You are not in any group chat
            </Text>
          </View>
        ))}

      {/* change to direct chat later */}
      {selectedChatSection === "directChat" &&
        (directChats!.length > 0 ? (
          <FlatList
            className="mt-8"
            data={displayedDirectChats}
            contentContainerStyle={{ rowGap: 12 }}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <DirectChatItem directChat={item} />}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center pt-20 gap-y-2">
                <Text className="font-poppins-medium text-black text-lg">
                  No active direct chat
                </Text>

                <Text className="font-poppins-medium text-black text-lg">
                  Try searching and start chat
                </Text>
              </View>
            )}
            refreshControl={
              <RefreshControl
                refreshing={directChatsRefreshing}
                onRefresh={() => refetchDirectChats()}
                colors={["#0ea5e9"]}
              />
            }
          />
        ) : (
          <View className="flex-1 justify-center items-center gap-2">
            <Text className="font-poppins-medium text-xl text-black text-center">
              You do not have any direct chat
            </Text>

            <Text className="font-poppins-medium text-xl text-black text-center">
              Let's add some friend
            </Text>
          </View>
        ))}

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
