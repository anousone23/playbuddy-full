import Camera from "@/components/Camera";
import DirectChatHeader from "@/components/DirectChatHeader";
import DirectMessageItem from "@/components/DirectMessageItem";
import {
  CLOUDINARY_DIRECT_MESSAGE_FOLDER,
  IMAGE_MODAL_MAX_HEIGHT,
  IMAGE_MODAL_MAX_WIDTH,
  READ_DIRECT_MESSAGES,
} from "@/constants";
import { useAuthUser } from "@/contexts/AuthUserContext";
import { useGetDirectChatById } from "@/libs/React Query/directChat";
import {
  useGetAllUserDirectMessages,
  useSendDirectMessage,
} from "@/libs/React Query/directMessage";
import { useUploadImage } from "@/libs/React Query/user";
import { socket } from "@/libs/socket";
import { ImageModalType, IUser, UploadImageType } from "@/types";
import { compressImage, getScaledSize, openImagePicker } from "@/utils/helper";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useCameraPermissions } from "expo-camera";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import { Modal } from "react-native-paper";

export default function Chat() {
  const { directChatId } = useLocalSearchParams();
  const messageListRef = useRef<FlatList>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [message, setMessage] = useState("");
  const [image, setImage] = useState<UploadImageType | null>(null);
  const [messagesRefreshing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [imageModal, setImageModal] = useState<ImageModalType>({
    visible: false,
    imageUri: null,
    imageWidth: null,
    imageHeight: null,
  });

  const { authUser } = useAuthUser();
  const {
    data: messages,
    isLoading: isGettingMessages,
    refetch: refetchMessages,
  } = useGetAllUserDirectMessages({ directChatId: directChatId as string });
  const { data: directChat } = useGetDirectChatById(directChatId as string);
  const { mutateAsync: sendMessage, isPending: isSendingMessage } =
    useSendDirectMessage();
  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadImage();
  const queryClient = useQueryClient();

  // auto scroll
  useFocusEffect(
    useCallback(() => {
      if (!isGettingMessages && messages?.length) {
        const scrollTimeout = setTimeout(() => {
          scrollToEnd();
        }, 500);

        return () => clearTimeout(scrollTimeout);
      }
    }, [messages?.length, isGettingMessages])
  );

  // mark message as read
  useFocusEffect(
    useCallback(() => {
      const unreadMessages =
        messages?.filter(
          (message) =>
            !message.isRead && (message.sender as IUser)._id !== authUser?._id
        ) || [];

      if (unreadMessages.length === 0) return;

      const unreadMessageIds = unreadMessages.map((m) => m._id);
      const senderId = (unreadMessages[0].sender as IUser)._id;
      const receiverId = (unreadMessages[0].receiver as IUser)._id;

      socket.emit(READ_DIRECT_MESSAGES, {
        directChatId,
        senderId,
        receiverId,
        unreadMessageIds,
      });
    }, [directChatId, authUser?._id, messages])
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (directChatId) {
          queryClient.removeQueries({
            queryKey: ["directMessages", directChatId],
          });
        }
      };
    }, [queryClient, directChatId])
  );

  function scrollToEnd() {
    messageListRef.current?.scrollToEnd({ animated: true });
  }

  async function handleSendMessage() {
    if (!message && !image) return;

    const receiverId =
      (directChat?.user1 as IUser)._id === authUser?._id
        ? (directChat?.user2 as IUser)._id
        : (directChat?.user1 as IUser)._id;

    // upload image
    let secureUrl;

    if (image) {
      const compressedImage = await compressImage(image.uri);

      const source = {
        uri: compressedImage,
        name: image.name,
        type: "image/jpeg",
      };

      secureUrl = await new Promise<string>((resolve, reject) => {
        uploadImage(
          {
            image: source,
            folder: `${CLOUDINARY_DIRECT_MESSAGE_FOLDER}/${directChatId}`,
          },
          {
            onSuccess: (data) => resolve(data),
            onError: (err) => reject(err),
          }
        );
      });
    }

    const data = {
      receiverId,
      text: message.trim(),
      image: secureUrl,
    };

    setMessage("");
    setImage(null);

    await sendMessage(
      { directChatId: directChatId as string, data },
      {
        onSettled: () => {
          scrollToEnd();
        },
      }
    );
  }

  async function handleSelectImage() {
    const result = await openImagePicker();

    if (!result || result.canceled) return;

    setImage({
      uri: result.assets[0].uri,
      name: result.assets[0].fileName!,
      type: "image/jpeg",
    });
  }

  async function handleCameraPress() {
    const { granted, canAskAgain } = await requestPermission();

    if (granted) {
      setShowCamera(true);
    } else if (!granted && canAskAgain) {
      const tryAgain = await requestPermission();
      if (tryAgain.granted) {
        setShowCamera(true);
      }
    } else {
      toast.error(
        "We need camera access to use this feature. Please enable it in settings.",
        {
          position: ToastPosition.BOTTOM,
        }
      );
    }
  }

  const lastMessage = messages && messages.at(-1);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {showCamera && permission?.granted ? (
        <Camera
          type="directChat"
          setShowCamera={setShowCamera}
          directChat={directChat}
          scrollToEnd={scrollToEnd}
        />
      ) : (
        <>
          <DirectChatHeader directChatId={directChatId as string} />

          {/* content */}
          {isGettingMessages ? (
            <View className="flex-1 items-center justify-center ">
              <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
          ) : (
            <FlatList
              data={messages}
              keyExtractor={(item) => item._id}
              ListHeaderComponent={() => <View />}
              contentContainerStyle={{
                rowGap: 44,
                paddingHorizontal: 20,
              }}
              ListFooterComponent={() => <View className="h-28"></View>}
              renderItem={({ item }) => (
                <DirectMessageItem
                  message={item}
                  lastMessage={lastMessage}
                  isSendingMessage={isSendingMessage}
                  setImageModal={setImageModal}
                />
              )}
              ref={messageListRef}
              refreshControl={
                <RefreshControl
                  refreshing={messagesRefreshing}
                  onRefresh={async () => {
                    await refetchMessages();

                    if (!isGettingMessages) {
                      scrollToEnd();
                    }
                  }}
                  colors={["#0ea5e9"]}
                />
              }
            />
          )}

          {/* footer */}
          <View className=" bg-slate-100 mx-5 rounded-lg mb-8 items-center justify-center  border border-slate-300 flex-row">
            {/* camera icon */}
            {!message && !image && (
              <TouchableOpacity className="pl-3" onPress={handleCameraPress}>
                <Feather name="camera" size={20} color="#17255490" />
              </TouchableOpacity>
            )}

            {/* input */}
            <View className="flex-1 py-2 px-4 gap-y-2">
              {image && (
                <View className="h-16 w-16 rounded-lg">
                  <FastImage
                    source={{ uri: image.uri }}
                    resizeMode={FastImage.resizeMode.cover}
                    style={{ width: "100%", height: "100%", borderRadius: 6 }}
                  />
                  <TouchableOpacity
                    className="bg-slate-100 absolute rounded-full -right-2"
                    style={{ elevation: 3 }}
                    onPress={() => setImage(null)}
                  >
                    <Entypo name="cross" size={20} color="black" />
                  </TouchableOpacity>
                </View>
              )}
              <View className="flex-row">
                <TextInput
                  multiline
                  maxLength={300}
                  placeholder="Type something..."
                  className="rounded-xl font-poppins-regular w-full flex-1 pr-4"
                  textAlignVertical="center"
                  value={message}
                  onChangeText={setMessage}
                  onPress={scrollToEnd}
                />

                {(message || image) && (
                  <View className="bg-primary items-center justify-center rounded-md px-3 py-1 self-center">
                    <TouchableOpacity
                      onPress={handleSendMessage}
                      disabled={isUploadingImage || isSendingMessage}
                    >
                      {isUploadingImage || isSendingMessage ? (
                        <ActivityIndicator size="small" color="#f0f9ff" />
                      ) : (
                        <Ionicons name="send" size={18} color="#f0f9ff" />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* gallary icon */}
            {!message && !image && (
              <View className="flex-row items-center h-full pr-4">
                <TouchableOpacity onPress={handleSelectImage}>
                  <Feather name="image" size={20} color="#17255490" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </>
      )}

      {/* image modal */}
      <Modal
        visible={imageModal.visible}
        onDismiss={() =>
          setImageModal({
            imageUri: null,
            visible: false,
            imageWidth: null,
            imageHeight: null,
          })
        }
      >
        <View
          className="items-center justify-center mx-auto rounded-md gap-y-2"
          style={{
            width: getScaledSize({
              imageWidth: imageModal.imageWidth!,
              imageHeight: imageModal.imageHeight!,
              maxWidth: IMAGE_MODAL_MAX_WIDTH,
              maxHeight: IMAGE_MODAL_MAX_HEIGHT,
            }).width,
            height: getScaledSize({
              imageWidth: imageModal.imageWidth!,
              imageHeight: imageModal.imageHeight!,
              maxWidth: IMAGE_MODAL_MAX_WIDTH,
              maxHeight: IMAGE_MODAL_MAX_HEIGHT,
            }).height,
          }}
        >
          <FastImage
            source={{
              uri: imageModal.imageUri!,
              priority: FastImage.priority.high,
            }}
            resizeMode={FastImage.resizeMode.contain}
            style={{
              borderRadius: 6,
              width: "100%",
              height: "100%",
            }}
          />
        </View>
      </Modal>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
