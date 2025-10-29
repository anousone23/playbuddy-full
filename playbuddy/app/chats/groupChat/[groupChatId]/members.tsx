import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import GroupMember from "@/components/GroupMember";
import ReportModal from "@/components/shared/ReportModal";
import {
  useGetGroupChatById,
  useKickUserFromGroupChat,
  useSetAsAdmin,
} from "@/libs/React Query/groupChat";
import { IUser, ReportFormType } from "@/types";
import { useLocalSearchParams } from "expo-router";
import { Modal } from "react-native-paper";
import { useAuthUser } from "@/contexts/AuthUserContext";

const reasonOptions = [
  "Inappropriate name",
  "Inappropriate profile image",
  "Use of offensive words",
];

export default function GroupMemberScreen() {
  const { groupChatId } = useLocalSearchParams();

  // report
  const [reportedUser, setReportedUser] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  // kicking user
  const [kickUserModal, setKickUserModal] = useState(false);
  const [userToKickId, setUserToKickId] = useState("");
  // change group admin
  const [setAsAdminModal, setSetAsAdminModal] = useState(false);
  const [newAdminId, setNewAdminId] = useState("");
  // form
  const [form, setForm] = useState<ReportFormType>({
    reason: "",
    description: "",
    image: {
      name: "",
      type: "",
      uri: "",
    },
  });

  // data fetching
  const { data: groupChat, isLoading: isGettingGroupChat } =
    useGetGroupChatById(groupChatId as string);
  const { authUser, isLoadingAuthUser } = useAuthUser();
  const { mutateAsync: kickUser, isPending: isKickingUser } =
    useKickUserFromGroupChat();
  const { mutateAsync: setAsAdmin, isPending: isSettingAsAdmin } =
    useSetAsAdmin();

  // derive
  const isGroupAdmin =
    (groupChat?.admin as IUser)._id.toString() === authUser?._id.toString();

  async function handleKickUser() {
    await kickUser(
      { groupChatId: groupChatId as string, userToKickId },
      {
        onSuccess: () => {
          setKickUserModal(false);
          setUserToKickId("");
        },
      }
    );
  }

  async function handleSetAsAdmin() {
    await setAsAdmin(
      {
        groupChatId: groupChatId as string,
        newAdminId,
      },
      {
        onSuccess: (data) => {
          setSetAsAdminModal(false);
          setNewAdminId("");
        },
      }
    );
  }

  if (isGettingGroupChat || isLoadingAuthUser) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size={"large"} color={"#0ea5e9"} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5 ">
      <Text className="font-poppins-semiBold text-black mt-8">
        Members: {groupChat?.members.length}
      </Text>
      <FlatList
        data={groupChat?.members}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ rowGap: 8, paddingBottom: 24, paddingTop: 12 }}
        renderItem={({ item }) => (
          <GroupMember
            setModalVisible={setModalVisible}
            setKickUserModal={setKickUserModal}
            setReportedUser={setReportedUser}
            setUserToKickId={setUserToKickId}
            setSetAsAdminModal={setSetAsAdminModal}
            setNewAdminId={setNewAdminId}
            member={item}
            isGroupAdmin={isGroupAdmin}
            groupChatAdminId={(groupChat?.admin as IUser)._id}
          />
        )}
      />

      {/* report modal */}
      <ReportModal
        type="user"
        reportedUser={reportedUser}
        reasonOptions={reasonOptions}
        form={form}
        setForm={setForm}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />

      {/* kick user modal */}
      <Modal
        visible={kickUserModal}
        onDismiss={() => {
          setKickUserModal(false);
        }}
      >
        <View className="bg-slate-50 px-4 py-8 mx-4 rounded-md gap-y-8">
          <View className="gap-y-4">
            <Text className="text-red-500 font-poppins-bold text-center text-lg">
              Confirm kick user from group chat
            </Text>
            <Text className="text-black font-poppins-regular text-center">
              This action will remove this user from group chat
            </Text>
          </View>

          <View className="flex-row justify-evenly items-center">
            <TouchableOpacity
              className="bg-red-500 px-4 py-2 rounded-lg"
              onPress={handleKickUser}
            >
              {isKickingUser ? (
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
                setKickUserModal(false);
              }}
              disabled={isKickingUser}
            >
              <Text className="text-black font-poppins-semiBold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* set as admin  modal */}
      <Modal
        visible={setAsAdminModal}
        onDismiss={() => setSetAsAdminModal(false)}
      >
        <View className="bg-slate-50 px-4 py-8 mx-4 rounded-md gap-y-8">
          <View className="gap-y-4">
            <Text className="text-primary font-poppins-bold text-center text-lg">
              Confirm set this member as group admin
            </Text>
            <Text className="text-black font-poppins-regular text-center">
              This action will set this member to group admin
            </Text>
          </View>

          <View className="flex-row justify-evenly items-center">
            <TouchableOpacity
              className="bg-primary px-4 py-2 rounded-lg"
              onPress={handleSetAsAdmin}
            >
              {isSettingAsAdmin ? (
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
                setSetAsAdminModal(false);
              }}
              disabled={isSettingAsAdmin}
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
