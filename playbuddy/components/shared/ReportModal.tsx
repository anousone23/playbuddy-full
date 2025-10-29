import {
  CLOUDINARY_GROUPCHAT_REPORT_FOLDER,
  CLOUDINARY_USER_REPORT_FOLDER,
} from "@/constants";
import { useReportGroupChat } from "@/libs/React Query/groupChat";
import { useReportUser, useUploadImage } from "@/libs/React Query/user";
import { ReportFormType } from "@/types";
import { compressImage, openImagePicker } from "@/utils/helper";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { AntDesign } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import { Menu, Modal } from "react-native-paper";

type ReportModalType = {
  type: "groupChat" | "user";
  reasonOptions: string[];
  form: ReportFormType;
  setForm: Dispatch<SetStateAction<ReportFormType>>;
  modalVisible: boolean;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  reportedUser?: string | null;
  reportedGroupChat?: string | null;
};

export default function ReportModal({
  type,
  reasonOptions,
  form,
  setForm,
  modalVisible,
  setModalVisible,
  reportedUser,
  reportedGroupChat,
}: ReportModalType) {
  const [reasonOptionsVisible, setReasonOptionVisible] = useState(false);

  const { mutateAsync: reportUser, isPending: isReportingUser } =
    useReportUser();
  const { mutateAsync: reportGroupChat, isPending: isReportingGroupChat } =
    useReportGroupChat();
  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadImage();

  function handleReasonOptionChange(option: string) {
    setForm({ ...form, reason: option });

    setReasonOptionVisible(false);
  }

  async function handleSubmitForm() {
    if (!form.reason) {
      return toast.error("Report reason is required", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    }

    if (type === "user") {
      if (!reportedUser) return;

      let secureUrl;

      if (form.image?.uri) {
        const compressedImage = await compressImage(form.image.uri);

        const source = {
          uri: compressedImage,
          name: form.image.name,
          type: "image/jpeg",
        };

        secureUrl = await new Promise<string>((resolve, reject) => {
          uploadImage(
            {
              image: source,
              folder: `${CLOUDINARY_USER_REPORT_FOLDER}/${reportedUser}`,
            },
            {
              onSuccess: (data) => resolve(data),
              onError: (err) => reject(err),
            }
          );
        });
      }

      const data = {
        reason: form.reason,
        description: form.description,
        image: secureUrl,
      };

      await reportUser(
        {
          userToReportId: reportedUser as string,
          reportData: data,
        },
        {
          onSuccess: () => {
            setModalVisible(false);
            setForm({
              reason: "",
              description: "",
              image: { name: "", type: "", uri: "" },
            });
          },
        }
      );
    } else if (type === "groupChat") {
      if (!reportedGroupChat) return;

      let secureUrl;

      if (form.image?.uri) {
        const compressedImage = await compressImage(form.image.uri);

        const source = {
          uri: compressedImage,
          name: form.image.name,
          type: "image/jpeg",
        };

        secureUrl = await new Promise<string>((resolve, reject) => {
          uploadImage(
            {
              image: source,
              folder: `${CLOUDINARY_GROUPCHAT_REPORT_FOLDER}/${reportedGroupChat}`,
            },
            {
              onSuccess: (data) => resolve(data),
              onError: (err) => reject(err),
            }
          );
        });
      }

      const data = {
        reason: form.reason,
        description: form.description,
        image: secureUrl,
      };

      await reportGroupChat(
        {
          groupChatId: reportedGroupChat as string,
          reportData: data,
        },
        {
          onSuccess: () => {
            setForm({
              reason: "",
              description: "",
              image: {
                name: "",
                uri: "",
                type: "",
              },
            });
            setModalVisible(false);
          },
        }
      );
    }
  }

  async function handleSelectImage() {
    const result = await openImagePicker();

    if (!result || result.canceled) return;

    setForm((prev) => ({
      ...prev,
      image: {
        uri: result.assets[0].uri,
        name: result.assets[0].fileName!,
        type: "image/jpeg",
      },
    }));
  }

  return (
    <Modal
      visible={modalVisible}
      onDismiss={() => {
        setForm({
          reason: "",
          description: "",
          image: { name: "", type: "", uri: "" },
        });
        setModalVisible(false);
      }}
      contentContainerStyle={{ padding: 16 }}
    >
      <View className="bg-slate-100 px-6 py-6 rounded-md gap-y-4">
        {/* reson for report */}
        <View className="gap-y-2">
          <Text className="font-poppins-semiBold text-black">
            Reason for reporting
          </Text>

          {/* reason option modal */}
          <Menu
            style={{
              width: "82%",
            }}
            contentStyle={{ backgroundColor: "#f1f5f9" }}
            visible={reasonOptionsVisible}
            onDismiss={() => setReasonOptionVisible(false)}
            anchorPosition="bottom"
            anchor={
              <TouchableOpacity
                className="border border-slate-300 bg-slate-100 px-2 py-2 rounded-md"
                onPress={() => setReasonOptionVisible(true)}
              >
                {form.reason ? (
                  <Text className="font-poppins-medium text-black text-sm">
                    {form.reason}
                  </Text>
                ) : (
                  <Text className="font-poppins-medium text-[#08334480] text-sm">
                    Select a reason for report
                  </Text>
                )}

                <View className="absolute right-2 bottom-2">
                  <AntDesign name="down" size={16} color="#083344" />
                </View>
              </TouchableOpacity>
            }
          >
            {reasonOptions.map((option) => (
              <Menu.Item
                key={option}
                onPress={() => handleReasonOptionChange(option)}
                title={option}
                titleStyle={{
                  fontFamily: "Poppins-Regular",
                  fontSize: 14,
                  color: "#083344",
                }}
              />
            ))}
          </Menu>
        </View>

        {/* description  */}
        <View className="gap-y-2">
          <Text className={`font-poppins-semiBold text-black`}>
            Description (optional)
          </Text>

          <TextInput
            style={{ textAlignVertical: "top" }}
            className="bg-slate-100 font-poppins-medium border border-slate-300  text-black rounded-md px-2  text-sm py-4 pb-10"
            placeholder="Enter your group chat description"
            placeholderTextColor={"#08334480"}
            multiline={true}
            value={form.description}
            numberOfLines={10}
            onChangeText={(text) => setForm({ ...form, description: text })}
            maxLength={300}
          />

          <View className="absolute right-2 bottom-2">
            <Text className="font-poppins-regular text-sm text-black opacity-70">
              {form.description?.length}/300
            </Text>
          </View>
        </View>

        {/* evidence */}
        <View className="gap-y-2">
          <Text className={`font-poppins-medium text-black`}>Evidence</Text>

          {form.image?.uri ? (
            <View className="bg-slate-100 border border-slate-300 py-2 px-2 rounded-md flex-row gap-x-2 items-center">
              <View className="flex-1 flex-row items-center gap-x-2">
                <FastImage
                  source={{ uri: form.image.uri }}
                  resizeMode={FastImage.resizeMode.contain}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                  }}
                />
                <Text className="flex-1">{form.image.name}</Text>
              </View>

              <Pressable
                onPress={() =>
                  setForm((prev) => ({
                    ...prev,
                    image: { name: "", type: "", uri: "" },
                  }))
                }
              >
                <Entypo name="cross" size={24} color="#334155" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              className="bg-slate-100 border border-slate-300 py-2 rounded-md px-2"
              onPress={handleSelectImage}
            >
              <Text className="font-poppins-regular text-sm opacity-70">
                Select an image
              </Text>
            </Pressable>
          )}
        </View>

        <TouchableOpacity
          className="bg-red-500 rounde-md items-center justify-center py-4 rounded-md mt-8 disabled:bg-slate-400"
          disabled={isReportingGroupChat || isReportingUser || isUploadingImage}
          onPress={handleSubmitForm}
        >
          <Text className="text-white font-poppins-medium">Report</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
