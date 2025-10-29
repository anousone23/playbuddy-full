import { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ConnectionSection from "@/components/shared/ConnectionSection";
import { useGetAllFriendRequests } from "@/libs/React Query/friendRequest";
import {
  useGetAllUserFriends,
  useUnfriend,
} from "@/libs/React Query/friendship";
import { useGetAllUserGroupInvitations } from "@/libs/React Query/groupInvitations";
import { UnfriendDataType } from "@/types";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { Modal } from "react-native-paper";

export default function ConnectionScreen() {
  const [isCollapsedFriendRequest, setIsCollapsedFriendRequest] =
    useState(true);
  const [isCollapsedGroupInvitation, setIsCollapsedGroupInvitation] =
    useState(true);
  const [isCollapsedFriend, setIsCollapsedFriend] = useState(true);
  const [unfriendData, setUnfriendData] = useState<UnfriendDataType>({
    modalVisible: false,
    friendshipId: "",
  });
  const [refreshing] = useState({
    friendRequest: false,
    groupInvitation: false,
    friend: false,
  });

  const {
    data: friendRequests,
    isLoading: isGettingFriendRequests,
    refetch: refetchFriendRequests,
  } = useGetAllFriendRequests({ status: "pending", type: "received" }); // use for identify if the request is sent to the selected user and to see a list of requests
  const {
    data: groupInvitations,
    isLoading: isGettingGroupInvitations,
    refetch: refetchGroupInvitations,
  } = useGetAllUserGroupInvitations({ type: "received", status: "pending" });
  const {
    data: friendships,
    isLoading: isGettingFriends,
    refetch: refetchFriendships,
  } = useGetAllUserFriends();
  const { mutateAsync: unfriend, isPending: isLoadingUnfriend } = useUnfriend();

  if (
    isGettingFriendRequests ||
    isGettingFriends ||
    isGettingGroupInvitations
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center ">
        <ActivityIndicator size={"large"} color={"#0ea5e9"} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5">
      {/* search bar */}
      <View className="mt-8 flex-row items-center gap-x-4">
        <TextInput
          className="bg-slate-50 border font-poppins-regular border-slate-300 rounded-xl px-4 py-2 flex-1"
          style={{ elevation: 5 }}
          placeholder="Enter a name to add friend"
          onPress={() => router.push("/chats/addFriend")}
        />

        <View className="absolute top-[10px] right-4">
          <AntDesign name="search1" size={20} color="#17255490" />
        </View>
      </View>

      <View className="h-[1px] bg-slate-200 mt-8"></View>

      <View className="flex-1">
        <ConnectionSection
          type="friendRequest"
          title={`Friend requests (${friendRequests?.length})`}
          isCollapsed={isCollapsedFriendRequest}
          setIsCollapsed={setIsCollapsedFriendRequest}
          data={friendRequests}
          refreshing={refreshing.friendRequest}
          onRefresh={refetchFriendRequests}
        />

        <ConnectionSection
          type="groupInvitation"
          title={`Group Invitations (${groupInvitations?.length})`}
          isCollapsed={isCollapsedGroupInvitation}
          setIsCollapsed={setIsCollapsedGroupInvitation}
          data={groupInvitations}
          refreshing={refreshing.groupInvitation}
          onRefresh={refetchGroupInvitations}
        />

        <ConnectionSection
          type="friend"
          title={`Friends (${friendships?.length})`}
          isCollapsed={isCollapsedFriend}
          setIsCollapsed={setIsCollapsedFriend}
          data={friendships}
          setUnfriendData={setUnfriendData}
          refreshing={refreshing.friend}
          onRefresh={refetchFriendships}
        />
      </View>

      {/* unfriend modal */}
      <Modal
        visible={unfriendData.modalVisible}
        onDismiss={() => {
          setUnfriendData({ ...unfriendData, modalVisible: false });
        }}
      >
        <View className="bg-slate-50 px-4 py-8 mx-4 rounded-md gap-y-8">
          <View className="gap-y-4">
            <Text className="text-red-500 font-poppins-bold text-center text-lg">
              Confirm unfriend
            </Text>
            <Text className="text-black font-poppins-regular text-center">
              This action will remove your friendship with this user
            </Text>
          </View>

          <View className="flex-row justify-evenly items-center">
            <TouchableOpacity
              className="bg-red-500 px-4 py-2 rounded-lg"
              onPress={async () =>
                await unfriend(unfriendData.friendshipId, {
                  onSuccess: () =>
                    setUnfriendData({ friendshipId: "", modalVisible: false }),
                })
              }
              disabled={isLoadingUnfriend}
            >
              {isLoadingUnfriend ? (
                <View className="w-20">
                  <ActivityIndicator size={"small"} color={"#f0f9ff"} />
                </View>
              ) : (
                <Text className="text-white font-poppins-semiBold text-center">
                  Confirm
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-slate-100 border border-slate-300 px-4 py-2 rounded-lg"
              onPress={() => {
                setUnfriendData({ ...unfriendData, modalVisible: false });
              }}
              disabled={isLoadingUnfriend}
            >
              <Text className="text-black font-poppins-semiBold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
