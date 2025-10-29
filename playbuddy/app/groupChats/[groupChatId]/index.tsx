import { Ionicons } from "@expo/vector-icons";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Collapsible from "react-native-collapsible";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/shared/CustomButton";
import HeaderNavigation from "@/components/shared/HeaderNavigation";
import images from "@/constants/images";
import {
  useGetGroupChatById,
  useJoinGroupChat,
} from "@/libs/React Query/groupChat";
import { IUser } from "@/types";
import FastImage from "react-native-fast-image";
import { ActivityIndicator } from "react-native-paper";
import { useAuthUser } from "@/contexts/AuthUserContext";

export default function GroupchatDetails() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const { groupChatId, invitationId } = useLocalSearchParams();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const { data: groupChat, isLoading: isGettingGroupChat } =
    useGetGroupChatById(groupChatId as string);
  const { mutateAsync: joinGroupChat, isPending: isJoiningGroupChat } =
    useJoinGroupChat();
  const { authUser } = useAuthUser();

  const isGroupAdmin = (groupChat?.admin as IUser)?._id === authUser?._id;
  const isAlreadyMember = groupChat?.members.some(
    (member) => member?._id === authUser?._id
  );
  const isGroupFull = groupChat?.members.length === groupChat?.maxMembers;

  useEffect(() => {
    navigation.setOptions({
      header: () => <HeaderNavigation title={groupChat?.name} />,
    });
  }, [navigation, groupChat]);

  async function handleJoinGroupChat() {
    if (invitationId) {
      await joinGroupChat({
        groupChatId: groupChatId as string,
        invitationId: invitationId as string,
      });

      return;
    }

    joinGroupChat({ groupChatId: groupChatId as string });
  }

  if (isGettingGroupChat)
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size={"large"} color="#0ea5e9" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5">
      <View className="mt-8 gap-y-4 mb-2">
        {/* header */}
        <View className="flex-row items-center justify-between">
          <View className="bg-primary px-2 py-1 rounded-xl">
            <Text className="font-poppins-medium text-white text-sm">
              {groupChat?.sportType.name}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name="people" size={24} color="#172554" />
            <Text className="font-poppins-semiBold text-black">
              {groupChat?.members.length}/{groupChat?.maxMembers}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView ref={scrollViewRef}>
        {/* group image */}
        <View className="w-56 h-56 bg-slate-400 rounded-full mx-auto">
          {groupChat?.image ? (
            <FastImage
              source={{ uri: groupChat.image }}
              resizeMode={FastImage.resizeMode.cover}
              style={{ width: "100%", height: "100%", borderRadius: 999 }}
            />
          ) : (
            <FastImage
              source={images.groupChatPlaceHolder}
              resizeMode={FastImage.resizeMode.cover}
              style={{ width: "100%", height: "100%", borderRadius: 999 }}
            />
          )}
        </View>

        {/* group name */}
        <View className="border-y border-y-slate-200 py-3 mt-8">
          <Text className="font-poppins-semiBold text-black">Name</Text>
          <Text className="font-poppins-regular text-black">
            {groupChat?.name}
          </Text>
        </View>

        {/* creator */}
        <View className="border-b border-y-slate-200 py-3">
          <Text className="font-poppins-semiBold text-black">Creator</Text>
          <Text className="font-poppins-regular text-black">
            {(groupChat?.creator as IUser)?.name}
          </Text>
        </View>

        {/* admin */}
        <View className="border-b border-b-slate-200 py-3">
          <Text className="font-poppins-semiBold text-black">Admin</Text>
          <Text className="font-poppins-regular text-black">
            {(groupChat?.admin as IUser)?.name}
          </Text>
        </View>

        {/* description */}
        <View className="border-b border-b-slate-200 py-3">
          <Text className="font-poppins-semiBold text-black">Description</Text>
          <Text className="font-poppins-regular text-black">
            {groupChat?.description || "-"}
          </Text>
        </View>

        {/* preferred skill */}
        <View className="border-b border-b-slate-200 py-3 ">
          <Text className="font-poppins-semiBold text-black">
            Preferred skill
          </Text>
          <Text className="font-poppins-regular text-black">
            {groupChat?.preferredSkill}
          </Text>
        </View>

        {/* members */}
        <View className="border-b border-b-slate-200 py-4 mb-12 ">
          <View className="flex-row items-center relative">
            <Text className="font-poppins-semiBold text-black">Members</Text>
            <TouchableOpacity
              className="items-center justify-center absolute right-2 bottom-[2px]"
              onPress={() => {
                setIsCollapsed(!isCollapsed);

                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollToEnd();
                }
              }}
            >
              <EvilIcons name="chevron-down" size={28} color="#172554" />
            </TouchableOpacity>
          </View>

          <Collapsible collapsed={isCollapsed}>
            {groupChat?.members.map((member: IUser, index, array) => (
              <View
                key={member?._id}
                className={`flex-row items-center gap-x-4 py-3 ${
                  index !== array.length - 1
                    ? "border-b border-b-slate-200"
                    : ""
                }`}
              >
                <View className="w-8 h-8 rounded-full bg-slate-400">
                  <FastImage
                    source={{ uri: member.image }}
                    style={{ width: "100%", height: "100%", borderRadius: 999 }}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                </View>
                <Text className="font-poppins-regular text-black">
                  {member?.name}
                </Text>
              </View>
            ))}
          </Collapsible>
        </View>
      </ScrollView>

      <CustomButton
        title={
          isGroupAdmin
            ? "You are this group admin"
            : isAlreadyMember
            ? "You are already in this group chat"
            : isGroupFull
            ? "This group is already full"
            : "Join"
        }
        isLoading={isJoiningGroupChat}
        disabled={
          isGroupAdmin || isAlreadyMember || isJoiningGroupChat || isGroupFull
        }
        onPress={handleJoinGroupChat}
        titleStyles="text-md"
        containerStyles="!py-3 mb-6"
      />
    </SafeAreaView>
  );
}
