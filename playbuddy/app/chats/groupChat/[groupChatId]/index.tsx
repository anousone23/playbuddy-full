import Camera from "@/components/Camera";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { AntDesign, Entypo } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCameraPermissions } from "expo-camera";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import FastImage from "react-native-fast-image";

import GroupMessageItem from "@/components/GroupMessageItem";
import {
  CLOUDINARY_GROUP_MESSAGE_FOLDER,
  IMAGE_MODAL_MAX_HEIGHT,
  IMAGE_MODAL_MAX_WIDTH,
  LEAVE_GROUP_EVENT,
  READ_GROUP_MESSAGES,
} from "@/constants";
import images from "@/constants/images";
import { useGetGroupChatById } from "@/libs/React Query/groupChat";
import {
  useGetAllUserGroupMessages,
  useSendGroupMessage,
} from "@/libs/React Query/groupMessage";
import { useUploadImage } from "@/libs/React Query/user";
import { socket } from "@/libs/socket";
import { ImageModalType, IUser, ReadModalType, UploadImageType } from "@/types";
import { compressImage, getScaledSize, openImagePicker } from "@/utils/helper";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Modal } from "react-native-paper";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthUser } from "@/contexts/AuthUserContext";

export default function GroupChat() {
  const { groupChatId, locationName } = useLocalSearchParams();
  const messageListRef = useRef<FlatList>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [message, setMessage] = useState("");
  const [messagesRefreshing] = useState(false);
  const [image, setImage] = useState<UploadImageType | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [imageModal, setImageModal] = useState<ImageModalType>({
    visible: false,
    imageUri: null,
    imageWidth: null,
    imageHeight: null,
  });
  const [readModal, setReadModal] = useState<ReadModalType>({
    data: [],
    visible: false,
  });

  const { data: groupChat } = useGetGroupChatById(groupChatId as string);
  const {
    data: messages,
    isLoading: isGettingMessages,
    refetch: refetchMessages,
  } = useGetAllUserGroupMessages({ groupChatId: groupChatId as string });
  const { authUser } = useAuthUser();
  const { mutateAsync: sendMessage, isPending: isSendingMessage } =
    useSendGroupMessage();
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
            !(message.readBy as IUser[]).some((u) => u._id === authUser?._id) &&
            (message.sender as IUser)._id !== authUser?._id
        ) || [];

      if (unreadMessages.length === 0) return;

      const unreadMessageIds = unreadMessages.map((message) => message._id);

      socket.emit(READ_GROUP_MESSAGES, {
        groupChatId,
        unreadMessageIds,
      });
    }, [groupChatId, authUser?._id, messages])
  );

  // emit join/leave group event
  useFocusEffect(
    useCallback(() => {
      // On focus (when user navigates to this screen)
      if (groupChatId) {
        socket.emit("join-group", groupChatId);
      }

      return () => {
        // On blur (when user leaves this screen)
        if (groupChatId) {
          socket.emit(LEAVE_GROUP_EVENT, groupChatId);
          queryClient.removeQueries({
            queryKey: ["groupMessages", groupChatId],
          });
        }
      };
    }, [groupChatId, queryClient])
  );

  function scrollToEnd() {
    messageListRef.current?.scrollToEnd({ animated: true });
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

  async function handleSendMessage() {
    if (!message && !image) return;

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
            folder: `${CLOUDINARY_GROUP_MESSAGE_FOLDER}/${groupChatId}`,
          },
          {
            onSuccess: (data) => resolve(data),
            onError: (err) => reject(err),
          }
        );
      });
    }

    const data = {
      text: message.trim(),
      image: secureUrl,
    };

    setMessage("");
    setImage(null);

    await sendMessage(
      { groupChatId: groupChatId as string, data },
      {
        onSuccess: () => {
          scrollToEnd();
        },
        onSettled: () => {},
      }
    );
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
    <SafeAreaView className="flex-1 w-full h-full bg-slate-50">
      {showCamera && permission?.granted ? (
        <Camera
          type="groupChat"
          setShowCamera={setShowCamera}
          groupChat={groupChat}
          scrollToEnd={scrollToEnd}
        />
      ) : (
        <>
          {/* header */}
          <View
            className="flex-row items-center bg-slate-50 px-5 pt-16 absolute z-10 top-0"
            style={{ paddingVertical: 20, elevation: 1 }}
          >
            <TouchableOpacity
              onPress={() => {
                router.back();
              }}
            >
              <AntDesign name="left" size={20} color="#172554" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-center flex-1 gap-x-2"
              onPress={() =>
                router.push(`/chats/groupChat/${groupChatId}/details` as Href)
              }
            >
              <View className="h-12 w-12 rounded-full bg-slate-400">
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
              </View>

              <View className="">
                <Text className="font-poppins-semiBold text-black text-xl">
                  {groupChat?.name}
                </Text>

                <Text className="font-poppins-semiBold text-black text-sm opacity-50">
                  {locationName}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* content */}
          <View className={`flex-1 mt-36`}>
            {isGettingMessages ? (
              <View className="items-center justify-center flex-1">
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
                  <GroupMessageItem
                    isSendingMessage={isSendingMessage}
                    message={item}
                    key={item._id}
                    lastMessage={lastMessage}
                    setImageModal={setImageModal}
                    setReadModal={setReadModal}
                  />
                )}
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
                ref={messageListRef}
              />
            )}
          </View>

          {/* input */}
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

      {/* read users modal */}
      <Modal
        visible={readModal.visible}
        onDismiss={() =>
          setReadModal({
            visible: false,
            data: null,
          })
        }
      >
        <View className="bg-slate-50 items-center justify-center py-4 mx-4 rounded-md">
          <FlatList
            data={readModal.data}
            keyExtractor={(item) => item._id}
            ItemSeparatorComponent={() => (
              <View className="h-[1px] bg-slate-200" />
            )}
            renderItem={({ item }) => (
              <View className="flex-row items-center gap-x-4 py-4">
                <FastImage
                  source={{ uri: item.image }}
                  resizeMode={FastImage.resizeMode.cover}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                  }}
                />

                <Text>{item.name}</Text>
              </View>
            )}
          />
        </View>
      </Modal>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

// function ChatBubble({ message }: { message: IGroupMessage }) {
//   if (message.sender === "1") {
//     return (
//       <View className="bg-primary border border-primary rounded-xl self-end px-4 py-1">
//         <Text className="font-poppins-medium text-white text-center">
//           {message.text}
//         </Text>
//       </View>
//     );
//   } else {
//     return (
//       <View className="flex-row items-center gap-x-4">
//         <View className="w-16 h-16 rounded-full bg-slate-300 "></View>

//         <View>
//           <Text className="font-poppins-semiBold text-black text-start">
//             เค็มเบะ
//           </Text>
//           <View className="bg-slate-200 border border-slate-300 rounded-xl px-4 py-1">
//             <Text className="font-poppins-medium text-black text-center">
//               {message.text}
//             </Text>
//           </View>
//         </View>

//         {/* timestamp */}
//         <Text className="font-poppins-regular text-sm text-[#08334490] self-end">
//           15min
//         </Text>

//         {/* list of read users */}
//         <View className="absolute -bottom-5 left-20">
//           <FlatList
//             horizontal
//             contentContainerStyle={{ columnGap: 4 }}
//             data={["1", "2", "3"]}
//             keyExtractor={(item) => item}
//             renderItem={() => (
//               <View className="w-4 h-4 rounded-full bg-green-500"></View>
//             )}
//           />
//         </View>
//       </View>
//     );
//   }
// }
