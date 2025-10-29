import { AntDesign } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import { Href, router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import GroupChatProfileSection from "@/components/GroupChatProfileSection";
import EditModal from "@/components/shared/EditModal";
import ReportModal from "@/components/shared/ReportModal";
import {
  CLOUDINARY_GROUP_CHAT_IMAGE_FOLDER,
  GROUP_REPORT_OPTIONS,
} from "@/constants";
import images from "@/constants/images";
import {
  useGetGroupChatById,
  useLeaveGroupChat,
  useUpdateGroupChat,
} from "@/libs/React Query/groupChat";
import { useUploadImage } from "@/libs/React Query/user";
import { IUser, ReportFormType } from "@/types";
import { compressImage, openImagePicker } from "@/utils/helper";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import FastImage from "react-native-fast-image";
import { Modal } from "react-native-paper";
import { useAuthUser } from "@/contexts/AuthUserContext";

export default function GroupChatDetailsScreen() {
  const { groupChatId } = useLocalSearchParams();

  const [leaveGroupModal, setLeaveGroupModal] = useState(false);

  // group information
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [preferredSkill, setPreferredSkill] = useState(
    "Select group preferred skill"
  );
  const [maxMembers, setMaxMembers] = useState("");
  const [modalVisible, setModalVisible] = useState({
    name: false,
    description: false,
    preferredSkill: false,
    maxMembers: false,
  });
  // report
  const [reportForm, setReportForm] = useState<ReportFormType>({
    reason: "",
    description: "",
    image: {
      name: "",
      type: "image/jpeg",
      uri: "",
    },
  });
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const { data: groupChat, isLoading: isGettingGroupChat } =
    useGetGroupChatById(groupChatId as string);
  const { authUser, isLoadingAuthUser } = useAuthUser();
  const { mutateAsync: updateGroupChat, isPending: isUpdatingGroupChat } =
    useUpdateGroupChat();
  const { mutateAsync: leaveGroupChat, isPending: isLeavingGroupChat } =
    useLeaveGroupChat();
  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadImage();

  async function handleChangeGroupImage() {
    const result = await openImagePicker();

    if (!result || result.canceled) return;

    const compressedImage = await compressImage(result.assets[0].uri);

    const source = {
      uri: compressedImage,
      type: "image/jpeg",
      name: result.assets[0].fileName!,
    };

    await uploadImage(
      { image: source, folder: CLOUDINARY_GROUP_CHAT_IMAGE_FOLDER },
      {
        onSuccess: async (data) =>
          await updateGroupChat({
            groupChatId: groupChatId.toString(),
            data: { image: data },
          }),
      }
    );
  }

  if (isGettingGroupChat || isLoadingAuthUser) {
    return (
      <View className="flex-1 items-center justify-center ">
        <ActivityIndicator size={"large"} color={"#0ea5e9"} />
      </View>
    );
  }

  const isGroupAdmin = authUser?._id === (groupChat?.admin as IUser)?._id;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 relative">
      {/* back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-16 left-5"
      >
        <AntDesign name="left" size={20} color="#172554" />
      </TouchableOpacity>

      {/* group image */}
      <View className="items-center justify-center mt-12">
        {isUploadingImage || isUpdatingGroupChat ? (
          // uploading state
          <View className="w-40 h-40 rounded-full bg-slate-200 border border-slate-300 items-center justify-center">
            <ActivityIndicator size={"small"} color={"#0ea5e9"} />
          </View>
        ) : (
          // image
          <View className="w-40 h-40 rounded-full bg-slate-200 border border-slate-300 items-center justify-center">
            {groupChat?.image ? (
              <FastImage
                source={{ uri: groupChat?.image }}
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

            {isGroupAdmin && (
              <TouchableOpacity
                className="absolute right-0 bottom-0 bg-primary p-3 rounded-full"
                onPress={handleChangeGroupImage}
                style={{ elevation: 3 }}
              >
                <Feather name="camera" size={20} color="#f0f9ff" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* members and invite icons */}
      <View className="flex-row items-center justify-center gap-x-8 mt-8">
        <TouchableOpacity
          className="rounded-full bg-primary px-2 py-2"
          onPress={() =>
            router.push(`/chats/groupChat/${groupChatId}/members` as Href)
          }
        >
          <Feather name="users" size={20} color="#f0f9ff" />
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-full bg-primary px-2 py-2"
          onPress={() =>
            router.push(`/chats/groupChat/${groupChatId}/invite` as Href)
          }
        >
          <AntDesign name="addusergroup" size={20} color="#f0f9ff" />
        </TouchableOpacity>
      </View>

      {/* section tab */}
      <View className="flex-row border-y border-y-slate-300 mt-8 ">
        <TouchableOpacity
          className={`flex-1 items-center justify-center py-4 bg-primary`}
        >
          <Entypo name="text" size={24} color="#f0f9ff" />
        </TouchableOpacity>
      </View>

      <GroupChatProfileSection
        setModalVisible={setModalVisible}
        setReportModalVisible={setReportModalVisible}
        groupChat={groupChat!}
        isGroupAdmin={isGroupAdmin}
        setLeaveGroupModal={setLeaveGroupModal}
      />

      {/* edit group name modal */}
      <EditModal
        type="text"
        label="Edit group name"
        placeholder="Enter your group name"
        visible={modalVisible.name}
        onDismiss={() => {
          setModalVisible({ ...modalVisible, name: false });
          setGroupName("");
        }}
        value={groupName}
        onChangeText={(value) => setGroupName(value)}
        onButtonPress={async () => {
          if (!groupName) {
            return toast.error("Group name is required", {
              position: ToastPosition.BOTTOM,
            });
          }

          updateGroupChat(
            {
              groupChatId: groupChatId as string,
              data: { name: groupName },
            },
            {
              onSuccess: () => {
                setModalVisible({ ...modalVisible, name: false });
                setGroupName("");
              },
            }
          );
        }}
        isUpdating={isUpdatingGroupChat}
      />

      {/* edit group description modal */}
      <EditModal
        type="description"
        label="Edit group description"
        placeholder="Enter your group description"
        visible={modalVisible.description}
        onDismiss={() => {
          setModalVisible({ ...modalVisible, description: false });
          setGroupDescription("");
        }}
        value={groupDescription}
        onChangeText={(value) => setGroupDescription(value)}
        onButtonPress={async () => {
          if (!groupDescription) {
            return toast.error("Group description is required", {
              position: ToastPosition.BOTTOM,
            });
          }

          updateGroupChat(
            {
              groupChatId: groupChatId as string,
              data: { description: groupDescription },
            },
            {
              onSuccess: () => {
                setModalVisible({ ...modalVisible, description: false });
                setGroupDescription("");
              },
            }
          );
        }}
        isUpdating={isUpdatingGroupChat}
      />

      {/* edit group preferred skill modal */}
      <EditModal
        type="skill"
        label="Edit group preferred skill"
        placeholder="Select your group preferred skill"
        visible={modalVisible.preferredSkill}
        onDismiss={() => {
          setModalVisible({ ...modalVisible, preferredSkill: false });
          setPreferredSkill("Select group preferred skill");
        }}
        value={preferredSkill}
        onChangeText={(value) => {
          setPreferredSkill(value);
        }}
        onButtonPress={async () => {
          if (
            !["casual", "beginner", "intermediate", "advanced"].includes(
              preferredSkill
            )
          ) {
            return toast.error("Group preferred skill is required", {
              position: ToastPosition.BOTTOM,
            });
          }

          updateGroupChat(
            {
              groupChatId: groupChatId as string,
              data: { preferredSkill },
            },
            {
              onSuccess: () => {
                setModalVisible({ ...modalVisible, preferredSkill: false });
                setPreferredSkill("Select group preferred skill");
              },
            }
          );
        }}
        isUpdating={isUpdatingGroupChat}
      />

      {/* edit group max members modal */}
      <EditModal
        type="number"
        label="Edit group max members"
        placeholder="Enter your group max members"
        visible={modalVisible.maxMembers}
        onDismiss={() => {
          setModalVisible({ ...modalVisible, maxMembers: false });
          setMaxMembers("");
        }}
        value={maxMembers}
        onChangeText={(value) => {
          setMaxMembers(value);
        }}
        onButtonPress={async () => {
          if (!maxMembers) {
            return toast.error("Group max members is required", {
              position: ToastPosition.BOTTOM,
            });
          }

          const regex = /^\d+$/;
          if (!regex.test(maxMembers)) {
            return toast.error("Group max members must be a number", {
              position: ToastPosition.BOTTOM,
            });
          }

          updateGroupChat(
            {
              groupChatId: groupChatId as string,
              data: { maxMembers: +maxMembers },
            },
            {
              onSuccess: () => {
                setModalVisible({ ...modalVisible, maxMembers: false });
                setMaxMembers("");
              },
            }
          );
        }}
        isUpdating={isUpdatingGroupChat}
      />

      <ReportModal
        type="groupChat"
        form={reportForm}
        modalVisible={reportModalVisible}
        setModalVisible={setReportModalVisible}
        setForm={setReportForm}
        reasonOptions={GROUP_REPORT_OPTIONS}
        reportedGroupChat={groupChatId as string}
      />

      {/* Leave group modal */}
      <Modal
        visible={leaveGroupModal}
        onDismiss={() => setLeaveGroupModal(false)}
      >
        <View className="bg-slate-50 px-4 py-8 mx-4 rounded-md gap-y-8">
          {isGroupAdmin && groupChat?.members.length === 1 ? (
            <View className="gap-y-4">
              <Text className="text-red-500 font-poppins-medium text-center text-lg">
                Confirm leave and delete group chat
              </Text>
              <Text className="text-black font-poppins-regular text-center">
                You are the only one in this group chat. The group will be
                deleted after you leave
              </Text>
            </View>
          ) : (
            <View className="gap-y-4">
              <Text className="text-red-500 font-poppins-bold text-center text-lg">
                Confirm leave group chat
              </Text>
              <Text className="text-black font-poppins-regular text-center">
                This action will remove you from the group chat
              </Text>
            </View>
          )}

          <View className="flex-row justify-evenly items-center">
            <TouchableOpacity
              className="bg-red-500 px-4 py-2 rounded-lg "
              onPress={async () => {
                await leaveGroupChat(groupChatId as string);
              }}
              disabled={isLeavingGroupChat}
            >
              {isLeavingGroupChat ? (
                <View className="w-20">
                  <ActivityIndicator size={"small"} color={"#f0f9ff"} />
                </View>
              ) : (
                <Text className="text-white font-poppins-regular text-center">
                  Confirm
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-slate-100 border border-slate-300 px-4 py-2 rounded-lg"
              onPress={() => {
                setLeaveGroupModal(false);
              }}
              disabled={isLeavingGroupChat}
            >
              <Text className="text-black font-poppins-regular text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
