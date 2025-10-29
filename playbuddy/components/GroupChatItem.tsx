import { router } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";

import images from "@/constants/images";
import { useAuthUser } from "@/contexts/AuthUserContext";
import { useGetLocationById } from "@/libs/React Query/location";
import { IGroupChat, IGroupMessage } from "@/types";
import { formatMessageTime } from "@/utils/helper";

export default function GroupChatItem({
  groupChat,
}: {
  groupChat: IGroupChat;
}) {
  const { authUser } = useAuthUser();
  const { data: location, isLoading: isGettingLocation } = useGetLocationById(
    groupChat.locationId
  );

  const lastMessage = groupChat.lastMessage as IGroupMessage | null;
  const isMyMessage = lastMessage?.sender === authUser?._id;
  const isReadByMe = lastMessage?.readBy.some(
    (memberId) => memberId === authUser?._id
  );

  if (isGettingLocation)
    return (
      <View
        className="flex-1 items-center justify-center py-8 px-2 rounded-lg flex-row gap-x-4 w-full bg-slate-100"
        style={{ elevation: 3 }}
      >
        <ActivityIndicator size={"small"} color={"#0ea5e9"} />
      </View>
    );

  return (
    <>
      <TouchableOpacity
        className="py-4 px-2 rounded-lg flex-row items-center gap-x-4 bg-slate-100"
        style={{ elevation: 3 }}
        onPress={() => {
          router.push({
            pathname: `chats/groupChat/${groupChat._id}` as "/",
            params: { locationName: location?.name },
          });
        }}
      >
        {/* image */}
        <View>
          <View className="h-16 w-16 rounded-full bg-slate-300">
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
        </View>

        <View className="flex-1 gap-y-3">
          <View className="flex-col items-start justify-between">
            <Text className="font-poppins-medium text-black">
              {groupChat.name}
            </Text>

            <Text className="font-poppins-medium text-black text-xs opacity-50">
              {location?.name}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            {/* last message */}
            {lastMessage && (
              <Text
                className={`flex-1 font-poppins-medium  ${
                  !isMyMessage && !isReadByMe
                    ? "text-black"
                    : " text-[#17255480]"
                } text-sm`}
              >
                {isMyMessage
                  ? `You: ${lastMessage?.text || " photo"}`
                  : lastMessage?.text || " photo"}
              </Text>
            )}

            <View className="flex-row items-center gap-x-4 ">
              {/* unread status */}
              {lastMessage && !isMyMessage && !isReadByMe && (
                <View className="w-3 h-3 bg-primary rounded-full justify-self-end" />
              )}

              {/* timestamp */}
              <Text className="font-poppins-medium text-[#17255480] text-sm ">
                {lastMessage?.createdAt &&
                  formatMessageTime(lastMessage.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
}
