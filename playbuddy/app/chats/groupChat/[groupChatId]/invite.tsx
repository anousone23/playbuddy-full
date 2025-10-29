import { useAuthUser } from "@/contexts/AuthUserContext";
import { useGetAllUserFriends } from "@/libs/React Query/friendship";
import {
  useGetGroupChatById,
  useInviteToGroupChat,
} from "@/libs/React Query/groupChat";
import { useGetAllUserGroupInvitations } from "@/libs/React Query/groupInvitations";
import { IFriendship, IUser } from "@/types";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";

export default function GroupInviteScreen() {
  const { groupChatId } = useLocalSearchParams();

  const [search, setSearch] = useState("");

  const { authUser } = useAuthUser();
  const { data: friendships, isPending: isGettingFriends } =
    useGetAllUserFriends();
  const { data: groupChat, isLoading: isGettingGroupChat } =
    useGetGroupChatById(groupChatId as string);

  // filter only friends that are not in the group chat
  let displayedFriends = friendships?.filter((friend) => {
    const friendUser =
      friend.user1._id === authUser?._id ? friend.user2 : friend.user1;

    const isAlreadyInGroup = groupChat?.members.some(
      (member) => member._id === friendUser._id
    );

    return !isAlreadyInGroup;
  });

  // filter friend by search
  displayedFriends = search
    ? displayedFriends?.filter((userFriend) => {
        const friend =
          userFriend.user1._id === authUser?._id
            ? userFriend.user2
            : userFriend.user1;

        return friend.name.includes(search);
      })
    : displayedFriends;

  if (isGettingFriends || isGettingGroupChat) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size={"small"} color={"#0ea5e9"} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5">
      <TextInput
        placeholder="Search..."
        placeholderTextColor={"#17255480"}
        className="bg-slate-50 border font-poppins-regular border-slate-300 rounded-xl px-4 py-2 mt-8"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center gap-y-2 mt-12">
            <Text className="font-poppins-medium text-black text-xl">
              You have no friends
            </Text>
            <Text className="font-poppins-medium text-black text-xl">
              Try adding someone
            </Text>
          </View>
        )}
        className="mt-8"
        data={displayedFriends}
        keyExtractor={(item) => item._id}
        ItemSeparatorComponent={() => (
          <View className="h-[1px] bg-slate-200"></View>
        )}
        renderItem={({ item }) => (
          <RenderItem
            key={item._id}
            friend={item}
            user={authUser!}
            groupChatId={groupChatId as string}
          />
        )}
      />
    </SafeAreaView>
  );
}

function RenderItem({
  friend: friendship,
  user,
  groupChatId,
}: {
  friend: IFriendship;
  user: IUser;
  groupChatId: string;
}) {
  const friend =
    friendship.user1._id === user?._id ? friendship.user2 : friendship.user1;

  const { data: groupInvitations, isLoading: isGettingGroupInvitations } =
    useGetAllUserGroupInvitations({ type: "sent", status: "pending" });
  const { mutateAsync: inviteToGroupChat, isPending: isInviting } =
    useInviteToGroupChat();

  const isAlreadyInvited = groupInvitations?.some((invitation) => {
    return (
      invitation.sender._id === user._id &&
      invitation.receiver._id === friend._id &&
      invitation.groupChat?._id === groupChatId
    );
  });

  if (isGettingGroupInvitations) {
    return (
      <View className="flex-1 items-center justify-center py-4">
        <ActivityIndicator size={"small"} color={"#0ea5e9"} />
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-x-4 py-4">
        <View className="w-12 h-12 rounded-full bg-slate-400">
          <FastImage
            source={{ uri: friend.image }}
            resizeMode={FastImage.resizeMode.cover}
            style={{ width: "100%", height: "100%", borderRadius: 999 }}
          />
        </View>
        <Text className="font-poppins-medium text-black">{friend.name}</Text>
      </View>
      {isAlreadyInvited ? (
        <TouchableOpacity
          className={`bg-slate-100 border border-slate-300 px-4 py-1 rounded-lg`}
          disabled={true}
        >
          <Text className="font-poppins-medium text-sm text-black">
            Request sent
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className={`bg-primary px-4 py-1 rounded-lg ${
            isInviting && "bg-slate-400"
          }`}
          onPress={async () =>
            await inviteToGroupChat({
              groupChatId: groupChatId as string,
              userId: friend._id,
            })
          }
          disabled={isInviting}
        >
          <Text className="font-poppins-medium text-sm text-white">Invite</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
