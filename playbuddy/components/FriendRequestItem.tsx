import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from "@/libs/React Query/friendRequest";
import { IFriendRequest, IUser } from "@/types";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";

export default function FriendRequestItem({
  friendRequest,
}: {
  friendRequest: IFriendRequest;
}) {
  const sender = friendRequest.sender as IUser;

  const {
    mutateAsync: acceptFriendRequest,
    isPending: isAcceptingFriendRequest,
  } = useAcceptFriendRequest();
  const {
    mutateAsync: rejectFriendRequest,
    isPending: isRejectingFriendRequest,
  } = useRejectFriendRequest();

  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center gap-x-4">
        <View className="w-10 h-10 rounded-full bg-slate-400">
          <FastImage
            source={{ uri: sender.image }}
            resizeMode={FastImage.resizeMode.cover}
            style={{ width: "100%", height: "100%", borderRadius: 999 }}
          />
        </View>
        <Text className="font-poppins-medium text-black">{sender.name}</Text>
      </View>

      <View className="flex-row items-center gap-x-4">
        <TouchableOpacity
          className="bg-primary px-4 py-1 rounded-lg disabled:bg-slate-300"
          onPress={async () => await acceptFriendRequest(friendRequest._id)}
          disabled={isAcceptingFriendRequest}
        >
          <Text className="font-poppins-regular text-sm text-white">
            Accept
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-500 px-4 py-1 rounded-lg disabled:bg-slate-300"
          onPress={async () => {
            rejectFriendRequest(friendRequest._id);
          }}
          disabled={isRejectingFriendRequest}
        >
          <Text className="font-poppins-regular text-sm text-white">
            Reject
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
