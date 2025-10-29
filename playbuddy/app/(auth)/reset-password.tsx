import { Href, router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppName from "@/components/shared/AppName";
import CustomButton from "@/components/shared/CustomButton";
import { useResetPassword } from "@/libs/React Query/auth";
import { Feather } from "@expo/vector-icons";
import FastImage from "react-native-fast-image";
import images from "../../constants/images";

type ResetPasswordType = {
  newPassword: string;
  confirmNewPassword: string;
};

export default function ForgotPasswordScreen() {
  const { email } = useLocalSearchParams();
  const confirmNewPasswordInputRef = useRef<TextInput>(null);

  const [form, setForm] = useState<ResetPasswordType>({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutateAsync: resetPassword, isPending: isResettingPassword } =
    useResetPassword();

  async function handleResetPassword() {
    await resetPassword({
      email: email as string,
      newPassword: form.newPassword,
      confirmNewPassword: form.confirmNewPassword,
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 relative">
      <FastImage
        source={images.auth}
        resizeMode={FastImage.resizeMode.cover}
        style={{ width: "100%", height: 500 }}
      />

      <View className="bg-slate-50 absolute w-full bottom-0 py-8 rounded-t-3xl flex h-[600px] flex-col">
        <View className="flex flex-row items-center justify-center text-black gap-2">
          <AppName />
        </View>

        <View className="mt-4 flex flex-col gap-y-2">
          <Text className="font-poppins-medium text-center text-lg text-black">
            Reset password
          </Text>

          <Text className="font-poppins-regular text-center text-black">
            Your new password must be different from previous password
          </Text>
        </View>

        <ScrollView>
          <View className="mx-8 mt-12 flex flex-col gap-8">
            {/* password */}
            <View className={`flex flex-col gap-2`}>
              <Text className={`font-poppins-medium text-black text-lg`}>
                New password
              </Text>

              <View className="relative">
                <TextInput
                  value={form.newPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={"#08334480"}
                  secureTextEntry={!showPassword}
                  onChangeText={(value) =>
                    setForm({ ...form, newPassword: value })
                  }
                  className={`bg-slate-100 font-poppins-medium  text-black rounded-md px-2 py-2`}
                  style={{ borderWidth: 1, borderColor: "#cbd5e1" }}
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    confirmNewPasswordInputRef.current?.focus()
                  }
                  blurOnSubmit={false}
                />

                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#083344"
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-3 bottom-[12px]"
                />
              </View>
            </View>

            {/* confirm password */}
            <View className={`flex flex-col gap-2`}>
              <Text className={`font-poppins-medium text-black text-lg`}>
                Confirm password
              </Text>

              <View className="relative">
                <TextInput
                  value={form.confirmNewPassword}
                  placeholder="Enter your confirm password"
                  placeholderTextColor={"#08334480"}
                  secureTextEntry={!showConfirmPassword}
                  onChangeText={(value) =>
                    setForm({ ...form, confirmNewPassword: value })
                  }
                  className={`bg-slate-100 font-poppins-medium text-black rounded-md px-2 py-2`}
                  style={{ borderWidth: 1, borderColor: "#cbd5e1" }}
                  returnKeyType="go"
                  ref={confirmNewPasswordInputRef}
                  onSubmitEditing={handleResetPassword}
                  blurOnSubmit={false}
                />

                <Feather
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#083344"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 bottom-[12px]"
                />
              </View>
            </View>

            <CustomButton
              isLoading={isResettingPassword}
              disabled={isResettingPassword}
              title="Continue"
              onPress={handleResetPassword}
              containerStyles="mt-12"
            />

            <CustomButton
              title="Cancel"
              onPress={() => {
                router.replace("(auth)/sign-in" as Href);
              }}
              containerStyles="!bg-slate-100 border !border-slate-300"
              titleStyles="!text-black"
            />
          </View>
        </ScrollView>
      </View>

      <StatusBar hidden={true} />
    </SafeAreaView>
  );
}
