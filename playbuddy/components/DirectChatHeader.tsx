import { AntDesign } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { useGetDirectChatById } from "@/libs/React Query/directChat";
import { IUser } from "@/types";
import FastImage from "react-native-fast-image";
import { useAuthUser } from "@/contexts/AuthUserContext";

export default function DirectChatHeader({
  directChatId,
}: {
  directChatId: string;
}) {
  const { data: directChat, isLoading: isGettingDirectChat } =
    useGetDirectChatById(directChatId as string);
  const { authUser, isLoadingAuthUser } = useAuthUser();

  if (isGettingDirectChat || isLoadingAuthUser) {
    return (
      <View
        className="flex-row items-center justify-center bg-slate-50 px-5 pt-16"
        style={{ paddingVertical: 20, elevation: 1 }}
      >
        <ActivityIndicator size={"small"} color={"#0ea5e9"} />
      </View>
    );
  }

  const friend =
    (directChat?.user1 as IUser)._id === authUser?._id
      ? (directChat?.user2 as IUser)
      : (directChat?.user1 as IUser);

  return (
    <View
      className="flex-row items-center bg-slate-50 px-5 pt-16"
      style={{ paddingVertical: 20, elevation: 1 }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <AntDesign name="left" size={20} color="#172554" />
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 flex-row items-center justify-center gap-x-4"
        onPress={() =>
          router.push(`/chats/directChat/${directChatId}/details` as Href)
        }
      >
        <View className="h-12 w-12 rounded-full bg-slate-400">
          <FastImage
            source={{ uri: friend.image }}
            resizeMode={FastImage.resizeMode.cover}
            style={{ width: "100%", height: "100%", borderRadius: 999 }}
          />
        </View>
        <Text className="font-poppins-semiBold text-black text-xl">
          {friend.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
