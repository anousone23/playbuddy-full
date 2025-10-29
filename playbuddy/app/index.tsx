import { Href, Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

import AppName from "@/components/shared/AppName";
import CustomButton from "@/components/shared/CustomButton";
import { useAuthUser } from "@/contexts/AuthUserContext";
import FastImage from "react-native-fast-image";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import images from "../constants/images";

export default function Index() {
  const { authUser, isLoadingAuthUser } = useAuthUser();

  if (!isLoadingAuthUser && authUser) {
    return <Redirect href={"/(tabs)/explore"} />;
  }

  return (
    <View className="flex-1 bg-slate-50 relative">
      <GestureHandlerRootView>
        <FastImage
          source={images.welcome}
          resizeMode={FastImage.resizeMode.cover}
          style={{ width: "100%", height: 500 }}
        />

        <View className="bg-slate-50 absolute w-full bottom-4 py-8 rounded-t-3xl flex flex-col">
          <AppName textStyles="mt-8" />

          <Text className="font-poppins-medium text-lg text-black text-center mt-8">
            Where sports meet community
          </Text>

          <CustomButton
            title="Get Started"
            titleStyles="text-lg"
            containerStyles="mt-20 mx-8 mb-12"
            onPress={() => {
              router.push("(auth)/sign-in" as Href);
            }}
          />
        </View>

        <StatusBar />
      </GestureHandlerRootView>
    </View>
  );
}
