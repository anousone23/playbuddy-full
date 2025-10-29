import { AntDesign } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ReportModal from "@/components/shared/ReportModal";
import { USER_REPORT_OPTIONS } from "@/constants";
import { useGetDirectChatById } from "@/libs/React Query/directChat";
import {
  useGetAllUserFriends,
  useUnfriend,
} from "@/libs/React Query/friendship";
import { IUser, ReportFormType } from "@/types";
import FastImage from "react-native-fast-image";
import { Modal } from "react-native-paper";
import { useAuthUser } from "@/contexts/AuthUserContext";

export default function DirectChatDetailsScreen() {
  const { directChatId } = useLocalSearchParams();

  // report form
  const [reportForm, setReportForm] = useState<ReportFormType>({
    reason: "",
    description: "",
    image: {
      name: "",
      type: "",
      uri: "",
    },
  });
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [unfriendModal, setUnfriendModal] = useState(false);
  const [reportedUser, setReportedUser] = useState<string | null>(null);

  const { data: directChat, isLoading: isGettingDirectChats } =
    useGetDirectChatById(directChatId as string);
  const { authUser, isLoadingAuthUser } = useAuthUser();
  const { data: friends, isLoading: isGettingFriends } = useGetAllUserFriends();
  const { mutateAsync: unfriend, isPending: isLoadingUnfriend } = useUnfriend();

  if (isGettingFriends || isGettingDirectChats || isLoadingAuthUser) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size={"large"} color="#0ea5e9"></ActivityIndicator>
      </SafeAreaView>
    );
  }

  const friend =
    (directChat?.user1 as IUser)._id === authUser?._id
      ? (directChat?.user2 as IUser)
      : (directChat?.user1 as IUser);

  const friendship = friends?.find(
    (friend) =>
      friend.user1._id === (directChat?.user1 as IUser)._id &&
      friend.user2._id === (directChat?.user2 as IUser)._id
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50 relative">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-20 left-5"
      >
        <AntDesign name="left" size={20} color="#172554" />
      </TouchableOpacity>

      <View className="items-center justify-center mt-16">
        <View className="w-40 h-40 rounded-full bg-slate-400 ">
          <FastImage
            source={{ uri: friend.image }}
            resizeMode={FastImage.resizeMode.cover}
            style={{ width: "100%", height: "100%", borderRadius: 999 }}
          />
        </View>
      </View>

      {/* section tab */}
      <View className="flex-row border-y border-y-slate-300 mt-8">
        <View className={`flex-1 items-center justify-center py-4 bg-primary `}>
          <FontAwesome5 name="user" size={20} color="#f0f9ff" />
        </View>
      </View>

      <ScrollView className="flex-1 px-5 mt-8 gap-y-4">
        <View className="gap-y-4">
          <View className="gap-y-2">
            <Text className="font-poppins-semiBold text-black">Name</Text>
            <Text className="font-poppins-regular text-black">
              {friend.name}
            </Text>
          </View>

          <View className="h-[1px] bg-slate-200" />

          <TouchableOpacity
            onPress={() => {
              setReportedUser(friend._id);
              setReportModalVisible(true);
            }}
          >
            <Text className="font-poppins-semiBold text-red-500">Report</Text>
          </TouchableOpacity>

          <View className="h-[1px] bg-slate-200" />

          <TouchableOpacity onPress={() => setUnfriendModal(true)}>
            <Text className="font-poppins-semiBold text-red-500">Unfriend</Text>
          </TouchableOpacity>

          <View className="h-[1px] bg-slate-200" />
        </View>
      </ScrollView>

      {/* report modal */}
      <ReportModal
        type="user"
        form={reportForm}
        setForm={setReportForm}
        modalVisible={reportModalVisible}
        setModalVisible={setReportModalVisible}
        reasonOptions={USER_REPORT_OPTIONS}
        reportedUser={reportedUser}
      />

      {/* unfriend modal */}
      <Modal
        visible={unfriendModal}
        onDismiss={() => {
          setUnfriendModal(false);
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
                await unfriend(friendship?._id as string, {
                  onSuccess: () => {
                    setUnfriendModal(false);
                    return router.replace("/(tabs)/chat");
                  },
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
                setUnfriendModal(false);
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
