import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import FastImage from "react-native-fast-image";

import { MESSAGE_IMAGE_MAX_HIEGHT, MESSAGE_IMAGE_MAX_WIDTH } from "@/constants";
import { IDirectMessage, ImageModalType, IUser } from "@/types";
import { formatMessageTime, getScaledSize } from "@/utils/helper";
import { useAuthUser } from "@/contexts/AuthUserContext";

export default function DirectMessageItem({
  message,
  lastMessage,
  isSendingMessage,
  setImageModal,
}: {
  message: IDirectMessage;
  lastMessage: IDirectMessage | undefined;
  isSendingMessage: boolean;
  setImageModal: Dispatch<SetStateAction<ImageModalType>>;
}) {
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const { authUser } = useAuthUser();

  // get image size
  useEffect(() => {
    if (message.image) {
      Image.getSize(
        message.image,
        (width, height) => {
          setImageSize({ width, height });
        },
        (error) => {
          console.error("Failed to get image size", error?.message || "");
        }
      );
    }
  }, [message.image]);

  const isMyMessage = (message.sender as IUser)._id === authUser?._id;
  const sender = message.sender as IUser;
  const islastMessage = lastMessage?._id === message._id;
  const isLastMessageMine =
    (lastMessage?.sender as IUser)._id === authUser?._id;

  // status
  const shouldShowStatus =
    islastMessage && (lastMessage?.sender as IUser)._id === authUser?._id;
  const isSending = islastMessage && isLastMessageMine && isSendingMessage; // is this last message and this last message is mine
  const shouldShowOtherUserTimestamp = islastMessage && !isLastMessageMine; // is this last message and this last message is not mine

  return (
    <>
      {/* my message  */}
      {isMyMessage && (
        <View className="items-end gap-y-2 ">
          {/* image */}
          {message.image && (
            <Pressable
              onPress={() => {
                setImageModal(() => ({
                  imageUri: message.image!,
                  visible: true,
                  imageWidth: imageSize?.width!,
                  imageHeight: imageSize?.height!,
                }));
              }}
            >
              <FastImage
                source={{ uri: message.image }}
                resizeMode={FastImage.resizeMode.contain}
                style={{
                  width: getScaledSize({
                    imageWidth: imageSize?.width!,
                    imageHeight: imageSize?.height!,
                    maxWidth: MESSAGE_IMAGE_MAX_WIDTH,
                    maxHeight: MESSAGE_IMAGE_MAX_HIEGHT,
                  }).width,
                  height: getScaledSize({
                    imageWidth: imageSize?.width!,
                    imageHeight: imageSize?.height!,
                    maxWidth: MESSAGE_IMAGE_MAX_WIDTH,
                    maxHeight: MESSAGE_IMAGE_MAX_HIEGHT,
                  }).height,
                  borderRadius: 6,
                }}
              />
            </Pressable>
          )}

          {/* text */}
          {message.text && (
            <View className="bg-primary border border-primary rounded-xl max-w-64">
              <View className="px-3 py-1">
                <Text className="font-poppins-medium text-white text-start">
                  {message.text}
                </Text>
              </View>
            </View>
          )}

          {/* read status */}
          <View className="absolute -bottom-6 right-0">
            {shouldShowStatus && !isSending && (
              <Text className="text-black font-poppins-regular text-xs">
                {message.isRead ? "read" : "delivered"}
              </Text>
            )}
            {isSending && (
              <Text className="text-black font-poppins-regular text-xs">
                sending
              </Text>
            )}
          </View>
        </View>
      )}

      {/* other user message */}
      {!isMyMessage && (
        <View className="flex-row items-start gap-x-4">
          {/* profile image */}

          <FastImage
            source={{ uri: sender.image }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
            }}
          />

          {/* name */}
          <View className="gap-y-2 items-start">
            <Text className="font-poppins-medium text-black text-start">
              {sender.name}
            </Text>

            {/* image */}
            {message.image && (
              <>
                <Pressable
                  onPress={() => {
                    setImageModal(() => ({
                      imageUri: message.image!,
                      visible: true,
                      imageWidth: imageSize?.width!,
                      imageHeight: imageSize?.height!,
                    }));
                  }}
                >
                  <FastImage
                    source={{ uri: message.image }}
                    resizeMode={FastImage.resizeMode.contain}
                    style={{
                      width: getScaledSize({
                        imageWidth: imageSize?.width!,
                        imageHeight: imageSize?.height!,
                        maxWidth: MESSAGE_IMAGE_MAX_WIDTH,
                        maxHeight: MESSAGE_IMAGE_MAX_HIEGHT,
                      }).width,
                      height: getScaledSize({
                        imageWidth: imageSize?.width!,
                        imageHeight: imageSize?.height!,
                        maxWidth: MESSAGE_IMAGE_MAX_WIDTH,
                        maxHeight: MESSAGE_IMAGE_MAX_HIEGHT,
                      }).height,
                      borderRadius: 6,
                    }}
                  />
                </Pressable>
              </>
            )}

            {/* text */}
            {message.text && (
              <View className="bg-slate-200 border border-slate-300 rounded-xl px-4 py-1 max-w-64">
                <Text className="font-poppins-medium text-black text-start">
                  {message.text}
                </Text>
              </View>
            )}
          </View>

          {/* timestamp */}
          {shouldShowOtherUserTimestamp && (
            <Text className="font-poppins-regular text-sm text-[#08334490] self-end">
              {formatMessageTime(message.createdAt)}
            </Text>
          )}
        </View>
      )}
    </>
  );
}
