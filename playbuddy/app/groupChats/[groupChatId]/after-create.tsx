import { useUploadImage } from "@/libs/React Query/user";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CustomButton from "@/components/shared/CustomButton";
import { CLOUDINARY_GROUP_CHAT_IMAGE_FOLDER } from "@/constants";
import { useUpdateGroupChat } from "@/libs/React Query/groupChat";
import { compressImage, openImagePicker } from "@/utils/helper";
import { useQueryClient } from "@tanstack/react-query";
import FastImage from "react-native-fast-image";

type ImageSourceType = {
  uri: string;
  type: string;
  name: string;
};

export default function AfterCreateGroupScreen() {
  const { groupChatId } = useLocalSearchParams();
  const queryClient = useQueryClient();

  const [imageSource, setImageSource] = useState<ImageSourceType | null>(null);

  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();
  const { mutateAsync: updateGroupChat, isPending: isUpdating } =
    useUpdateGroupChat();

  async function handlePickImage() {
    const result = await openImagePicker();

    if (!result || result.canceled) return;

    const compressedImage = await compressImage(result.assets[0].uri);

    setImageSource({
      uri: compressedImage,
      type: "image/jpeg",
      name: result.assets[0].fileName!,
    });
  }

  async function handleUploadImage() {
    await uploadImage(
      { image: imageSource!, folder: CLOUDINARY_GROUP_CHAT_IMAGE_FOLDER },
      {
        onSuccess: async (data) => {
          await updateGroupChat(
            {
              groupChatId: groupChatId.toString(),
              data: { image: data },
            },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({
                  queryKey: ["groupChat", groupChatId],
                });
                queryClient.invalidateQueries({
                  queryKey: ["userGroupChats"],
                });
                return router.push("/(tabs)/chat");
              },
            }
          );
        },
      }
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="mt-12">
        <View className="flex items-center justify-center gap-y-4">
          <Text className="font-poppins-medium text-2xl text-center mt-16">
            Add group image
          </Text>
          <View className="bg-slate-300 h-72 w-72 rounded-full items-center justify-center">
            {imageSource?.uri && (
              <FastImage
                source={{ uri: imageSource?.uri }}
                resizeMode={FastImage.resizeMode.cover}
                style={{ width: "100%", height: "100%", borderRadius: 999 }}
              />
            )}

            <TouchableOpacity
              disabled={isUpdating || isUploading}
              className="absolute right-12 bottom-0 bg-primary p-3 rounded-full"
              onPress={handlePickImage}
              style={{ elevation: 3 }}
            >
              <Feather name="camera" size={24} color="#f0f9ff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mx-8 mt-24 flex flex-col gap-8">
          {imageSource?.uri && (
            <CustomButton
              isLoading={isUpdating || isUpdating}
              disabled={isUpdating || isUploading}
              title="Finish"
              titleStyles="text-lg"
              containerStyles="mt-16"
              onPress={handleUploadImage}
            />
          )}

          {!imageSource?.uri && (
            <CustomButton
              title="Skip"
              titleStyles="text-lg !text-black"
              containerStyles="bg-slate-100 border !border-slate-300"
              onPress={() => {
                router.push("/(tabs)/chat");
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
