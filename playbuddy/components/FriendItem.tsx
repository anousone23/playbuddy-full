import { useAuthUser } from "@/contexts/AuthUserContext";
import { useSocket } from "@/contexts/SocketProvider";

import { useGetAllUserDirectChats } from "@/libs/React Query/directChat";
import { IFriendship, IUser, UnfriendDataType } from "@/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import React, { Dispatch, SetStateAction } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";

export default function FriendItem({
  friend: friendShip,
  setUnfriendData,
}: {
  friend: IFriendship;
  setUnfriendData?: Dispatch<SetStateAction<UnfriendDataType>>;
}) {
  const { authUser } = useAuthUser();
  const { data: directChats } = useGetAllUserDirectChats();
  const { onlineUsers } = useSocket();

  const directChat = directChats?.find(
    (directChat) =>
      (directChat.user1 as IUser)._id === (friendShip.user1 as IUser)._id &&
      (directChat.user2 as IUser)._id === (friendShip.user2 as IUser)._id
  );

  const friend =
    friendShip.user1._id === authUser?._id
      ? friendShip.user2
      : friendShip.user1;
  const isOnline = onlineUsers.some((userId) => userId === friend._id);

  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center gap-x-4">
        <View className="w-12 h-12 rounded-full bg-slate-400">
          <FastImage
            source={{ uri: friend.image }}
            resizeMode={FastImage.resizeMode.cover}
            style={{ width: "100%", height: "100%", borderRadius: 999 }}
          />

          {isOnline && (
            <View
              className="w-3 h-3 rounded-full bg-green-500 border border-white absolute right-0"
              style={{ elevation: 3 }}
            />
          )}
        </View>
        <Text className="font-poppins-medium text-black">{friend.name}</Text>
      </View>

      <View className="flex-row items-center gap-x-4">
        <TouchableOpacity
          onPress={() => router.push(`/chats/directChat/${directChat?._id}`)}
        >
          <AntDesign name="message1" size={24} color="#083344" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setUnfriendData!({
              friendshipId: friendShip._id,
              modalVisible: true,
            });
          }}
        >
          <AntDesign name="deleteuser" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
