import { IGroupChat, IUser } from "@/types";
import { caseFirstLetterToUpperCase } from "@/utils/helper";
import Feather from "@expo/vector-icons/Feather";
import React, { Dispatch, SetStateAction, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type GroupChatProfileSectionType = {
  setModalVisible: Dispatch<
    SetStateAction<{
      name: boolean;
      description: boolean;
      preferredSkill: boolean;
      maxMembers: boolean;
    }>
  >;
  setReportModalVisible: Dispatch<SetStateAction<boolean>>;
  groupChat: IGroupChat;
  isGroupAdmin: boolean;
  setLeaveGroupModal: Dispatch<SetStateAction<boolean>>;
};

export default function GroupChatProfileSection({
  setModalVisible,
  setReportModalVisible,
  groupChat,
  isGroupAdmin,
  setLeaveGroupModal,
}: GroupChatProfileSectionType) {
  const [isTextOverOneLine, setIsTextOverOneLine] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  return (
    <ScrollView
      className="flex-1 px-5 mt-8 gap-y-4"
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View className="gap-y-4">
        {/* name */}
        <View className="flex-row">
          <View className="gap-y-2 flex-1">
            <Text className="font-poppins-semiBold text-black">Group name</Text>
            <Text className="font-poppins-regular text-black ">
              {groupChat.name}
            </Text>
          </View>

          {isGroupAdmin && (
            <TouchableOpacity
              className="self-end items-center justify-center"
              onPress={() => {
                setModalVisible((prev) => ({ ...prev, name: true }));
              }}
            >
              <Feather name="edit" size={20} color="#083344" />
            </TouchableOpacity>
          )}
        </View>

        <View className="h-[1px] bg-slate-200" />

        {/* group admin */}
        <View className="flex-row">
          <View className="gap-y-2 flex-1">
            <Text className="font-poppins-semiBold text-black">Admin</Text>
            <Text className="font-poppins-regular text-black ">
              {(groupChat.admin as IUser).name}
            </Text>
          </View>
        </View>

        <View className="h-[1px] bg-slate-200" />

        {/* sport type */}
        <View className="flex-row">
          <View className="gap-y-2 flex-1">
            <Text className="font-poppins-semiBold text-black">Sport type</Text>
            <Text className="font-poppins-regular text-black ">
              {caseFirstLetterToUpperCase(groupChat.sportType.name)}
            </Text>
          </View>
        </View>

        <View className="h-[1px] bg-slate-200" />

        {/* description */}
        <View className="flex-row items-center">
          <View className="gap-y-2 flex-1">
            <Text className="font-poppins-semiBold text-black">
              Description
            </Text>

            <Text
              onPress={() => setShowFullText(!showFullText)}
              className="font-poppins-regular text-black pr-8"
              numberOfLines={showFullText ? undefined : 1}
              onTextLayout={(e) => {
                const lines = e.nativeEvent.lines.length;
                setIsTextOverOneLine(lines > 1);
              }}
            >
              {groupChat.description || "-"}
            </Text>
          </View>

          {isGroupAdmin && (
            <TouchableOpacity
              className="self-end items-center justify-center"
              onPress={() => {
                setModalVisible((prev) => ({ ...prev, description: true }));
              }}
            >
              <Feather name="edit" size={20} color="#083344" />
            </TouchableOpacity>
          )}
        </View>

        <View className="h-[1px] bg-slate-200" />

        {/* Preferred skill */}
        <View className="flex-row">
          <View className="gap-y-2 flex-1">
            <Text className="font-poppins-semiBold text-black">
              Preferred skill
            </Text>
            <Text className="font-poppins-regular text-black">
              {caseFirstLetterToUpperCase(groupChat.preferredSkill)}
            </Text>
          </View>

          {isGroupAdmin && (
            <TouchableOpacity
              className="self-end items-center justify-center"
              onPress={() => {
                setModalVisible((prev) => ({ ...prev, preferredSkill: true }));
              }}
            >
              <Feather name="edit" size={20} color="#083344" />
            </TouchableOpacity>
          )}
        </View>

        <View className="h-[1px] bg-slate-200" />

        {/* max members */}
        <View className="flex-row">
          <View className="gap-y-2 flex-1">
            <Text className="font-poppins-semiBold text-black">
              Max members
            </Text>
            <Text className="font-poppins-regular text-black">
              {groupChat.maxMembers.toString()}
            </Text>
          </View>

          {isGroupAdmin && (
            <TouchableOpacity
              className="self-end items-center justify-center"
              onPress={() => {
                setModalVisible((prev) => ({ ...prev, maxMembers: true }));
              }}
            >
              <Feather name="edit" size={20} color="#083344" />
            </TouchableOpacity>
          )}
        </View>

        <View className="h-[1px] bg-slate-200" />

        {/* report group */}
        {!isGroupAdmin && (
          <>
            <TouchableOpacity onPress={() => setReportModalVisible(true)}>
              <Text className="font-poppins-semiBold text-red-500 ">
                Report group
              </Text>
            </TouchableOpacity>
            <View className="h-[1px] bg-slate-200" />
          </>
        )}

        {/* leave group */}
        <TouchableOpacity onPress={() => setLeaveGroupModal(true)}>
          <Text className="font-poppins-semiBold text-red-500">
            Leave group
          </Text>
        </TouchableOpacity>

        <View className="h-[1px] bg-slate-200" />
      </View>
    </ScrollView>
  );
}
