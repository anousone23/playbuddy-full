import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Octicons from "@expo/vector-icons/Octicons";
import React, { Dispatch, SetStateAction, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Menu } from "react-native-paper";

import { useGetAllFriendRequests } from "@/libs/React Query/friendRequest";
import { useGetAllUserFriends } from "@/libs/React Query/friendship";
import { useAddFriend } from "@/libs/React Query/user";
import { IUser } from "@/types";
import FastImage from "react-native-fast-image";
import { useAuthUser } from "@/contexts/AuthUserContext";
import { useSocket } from "@/contexts/SocketProvider";

type GroupMemberType = {
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  setReportedUser: Dispatch<SetStateAction<string | null>>;
  setKickUserModal: Dispatch<SetStateAction<boolean>>;
  setUserToKickId: Dispatch<SetStateAction<string>>;
  setSetAsAdminModal: Dispatch<SetStateAction<boolean>>;
  setNewAdminId: Dispatch<SetStateAction<string>>;
  member: IUser;
  isGroupAdmin: boolean;
  groupChatAdminId: string;
};

export default function GroupMember({
  setModalVisible,
  setReportedUser,
  setKickUserModal,
  setUserToKickId,
  setSetAsAdminModal,
  setNewAdminId,
  member,
  isGroupAdmin,
  groupChatAdminId,
}: GroupMemberType) {
  const [optionVisible, setOptionVisible] = useState(false);

  const { onlineUsers } = useSocket();
  const { data: friendRequests, isLoading: isGettingFriendRequests } =
    useGetAllFriendRequests({ type: "sent", status: "pending" }); // use for identify if the request is sent to selected user
  const { authUser, isLoadingAuthUser } = useAuthUser();
  const { data: friendships, isLoading: isGettingUserFriends } =
    useGetAllUserFriends();
  const { mutateAsync: addFriend, isPending: isAddingFriend } = useAddFriend();

  const hasSentRequest = friendRequests?.some(
    (req) =>
      (req.sender as IUser)._id === authUser?._id &&
      (req.receiver as IUser)._id === member._id
  );
  const isUser = authUser?._id === member._id;
  const isFriend = friendships?.some(
    (friend) =>
      (friend.user1._id === authUser?._id && friend.user2._id === member._id) ||
      (friend.user1._id === member._id && friend.user2._id === authUser?._id)
  );

  const isOnline = onlineUsers.some(
    (onlineUserId) =>
      onlineUserId === member._id && onlineUserId !== authUser?._id
  );

  if (isGettingFriendRequests || isLoadingAuthUser || isGettingUserFriends) {
    return (
      <View className=" items-center justify-center py-4 border border-slate-300 bg-slate-100 px-4 rounded-lg">
        <ActivityIndicator color={"#0ea5e9"} size={"small"} />
      </View>
    );
  }

  return (
    <View
      className="flex-row items-center justify-between py-4 border border-slate-300 bg-slate-100 px-4 rounded-lg"
      style={{ elevation: 3 }}
    >
      {/* profile */}
      <View className="flex-row items-center gap-x-4">
        <View className="relative">
          <View className="w-12 h-12 rounded-full bg-slate-400">
            <FastImage
              source={{ uri: member.image }}
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
        </View>

        <Text className="font-poppins-medium text-black">
          {member.name}{" "}
          {groupChatAdminId === member._id && (
            <Text className="text-primary">(Admin)</Text>
          )}
        </Text>
      </View>

      {/* options */}
      {!isUser && (
        <Menu
          contentStyle={{ backgroundColor: "#f1f5f9" }}
          visible={optionVisible}
          onDismiss={() => setOptionVisible(false)}
          anchorPosition="bottom"
          anchor={
            <TouchableOpacity onPress={() => setOptionVisible(true)}>
              <Feather name="more-horizontal" size={24} color="#083344" />
            </TouchableOpacity>
          }
        >
          {!hasSentRequest && !isFriend && (
            <Menu.Item
              disabled={isAddingFriend}
              onPress={async () => {
                setOptionVisible(false);
                await addFriend(member._id);
              }}
              title="Add friend"
              titleStyle={{
                fontFamily: "Poppins-Regular",
                fontSize: 14,
                color: "#083344",
              }}
              leadingIcon={() => (
                <AntDesign name="adduser" size={20} color="#083344" />
              )}
            />
          )}
          {isGroupAdmin && (
            <>
              <Menu.Item
                onPress={() => {
                  setOptionVisible(false);
                  setNewAdminId(member._id);
                  setSetAsAdminModal(true);
                }}
                title="Set as admin"
                titleStyle={{
                  fontFamily: "Poppins-Regular",
                  fontSize: 14,
                  color: "#083344",
                }}
                leadingIcon={() => (
                  <MaterialCommunityIcons
                    name="shield-account-outline"
                    size={20}
                    color="#083344"
                  />
                )}
              />
              <Menu.Item
                onPress={() => {
                  setOptionVisible(false);
                  setUserToKickId(member._id);
                  setKickUserModal(true);
                }}
                title="Kick"
                titleStyle={{
                  fontFamily: "Poppins-Regular",
                  fontSize: 14,
                  color: "#ef4444",
                }}
                leadingIcon={() => (
                  <FontAwesome name="ban" size={20} color="#ef4444" />
                )}
              />
            </>
          )}

          <Menu.Item
            onPress={() => {
              setOptionVisible(false);
              setReportedUser(member._id);
              setModalVisible(true);
            }}
            title="Report"
            titleStyle={{
              fontFamily: "Poppins-Regular",
              fontSize: 14,
              color: "#ef4444",
            }}
            leadingIcon={() => (
              <Octicons name="report" size={20} color="#ef4444" />
            )}
          />
        </Menu>
      )}
    </View>
  );
}
