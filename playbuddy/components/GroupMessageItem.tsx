import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import FastImage from "react-native-fast-image";

import { MESSAGE_IMAGE_MAX_HIEGHT, MESSAGE_IMAGE_MAX_WIDTH } from "@/constants";
import { IGroupMessage, ImageModalType, IUser, ReadModalType } from "@/types";
import { formatMessageTime, getScaledSize } from "@/utils/helper";
import { useAuthUser } from "@/contexts/AuthUserContext";

export default function GroupMessageItem({
  message,
  lastMessage,
  isSendingMessage,
  setImageModal,
  setReadModal,
}: {
  message: IGroupMessage;
  lastMessage: IGroupMessage | undefined;
  isSendingMessage: boolean;
  setImageModal: Dispatch<SetStateAction<ImageModalType>>;
  setReadModal: Dispatch<SetStateAction<ReadModalType>>;
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
  const sender = message.sender as IUser; // temp
  const islastMessage = lastMessage?._id === message._id;
  const isLastMessageMine =
    (lastMessage?.sender as IUser)._id === authUser?._id;

  // status
  const shouldShowStatus =
    islastMessage && (lastMessage?.sender as IUser)._id === authUser?._id;
  const isSending = islastMessage && isLastMessageMine && isSendingMessage;
  const shouldShowOtherUserTimestamp = islastMessage && !isLastMessageMine;
  const otherMessageReadby = (message.readBy as IUser[]).filter(
    (user) => user._id !== authUser?._id
  );

  return (
    <>
      {/* my message  */}
      {isMyMessage && (
        <View className="items-end gap-y-2">
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
          <View
            className={`absolute -bottom-6 right-0 ${
              message.readBy.length > 0 && "-bottom-8"
            }`}
          >
            {isSending && (
              <Text className="text-black font-poppins-regular text-xs">
                sending
              </Text>
            )}

            {shouldShowStatus && !isSending && (
              <>
                {/* sent but no one has read */}
                {message.readBy.length === 0 && (
                  <Text className="text-black font-poppins-regular text-xs">
                    delivered
                  </Text>
                )}

                {/* sent and other user has read */}
                {message.readBy.length > 0 && (
                  <Pressable
                    onPress={() => {
                      setReadModal({
                        data: message.readBy as IUser[],
                        visible: true,
                      });
                    }}
                  >
                    <FlatList
                      data={(message.readBy as IUser[]).slice(0, 5)}
                      horizontal
                      keyExtractor={(item) => item._id}
                      contentContainerStyle={{ columnGap: 4 }}
                      renderItem={({ item }) => (
                        <View className="w-6 h-6 rounded-full bg-slate-200 border border-primary">
                          <FastImage
                            source={{ uri: item.image }}
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: 999,
                            }}
                            resizeMode={FastImage.resizeMode.cover}
                          />
                        </View>
                      )}
                      ListFooterComponent={() =>
                        (message.readBy as IUser[]).length > 5 && (
                          <View className="pl-1">
                            <Text className="font-poppins-regular">
                              +{lastMessage.readBy.length - 5}
                            </Text>
                          </View>
                        )
                      }
                    />
                  </Pressable>
                )}
              </>
            )}
          </View>
        </View>
      )}

      {/* other user message */}
      {!isMyMessage && (
        <View className="flex-row items-start gap-x-4">
          <View className="items-center justify-center ">
            {/* profile image */}
            <FastImage
              source={{ uri: sender.image }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
              }}
            />
          </View>

          <View className="gap-y-2">
            <View className="gap-y-2 items-start">
              {/* name */}
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

                  {/* timestamp */}
                  {shouldShowOtherUserTimestamp && (
                    <View className=" absolute bottom-0 -right-24 w-20">
                      <Text className="font-poppins-regular text-sm text-[#08334490]">
                        {formatMessageTime(message.createdAt)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* read status */}
            {islastMessage && (
              <Pressable
                className="items-end"
                onPress={() => {
                  setReadModal({
                    visible: true,
                    data: otherMessageReadby,
                  });
                }}
              >
                <FlatList
                  data={otherMessageReadby.slice(0, 5)}
                  horizontal
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={{ columnGap: 4 }}
                  renderItem={({ item }) => (
                    <View className="w-6 h-6 rounded-full bg-slate-200 border border-primary">
                      <FastImage
                        source={{ uri: item.image }}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 999,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </View>
                  )}
                  ListFooterComponent={() =>
                    otherMessageReadby.length > 5 && (
                      <View className="pl-1">
                        <Text className="font-poppins-regular">
                          +{lastMessage.readBy.length - 5}
                        </Text>
                      </View>
                    )
                  }
                />
              </Pressable>
            )}
          </View>
        </View>
      )}
    </>
  );
}
