import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { SafeAreaView } from "react-native-safe-area-context";

import AppName from "@/components/shared/AppName";
import CustomButton from "@/components/shared/CustomButton";
import { useResendOtp, useVerifyOtp } from "@/libs/React Query/auth";
import { useEffect, useState } from "react";
import FastImage from "react-native-fast-image";
import images from "../../constants/images";

export default function OtpScreen() {
  const { email } = useLocalSearchParams();

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);

  const { mutateAsync: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtp();
  const { mutateAsync: resendCode } = useResendOtp();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  async function handleResendOtp() {
    if (timer > 0) return;

    // resendCode(email as string);
    await resendCode(email as string);
    setOtp("");

    setTimer(60);
  }

  async function handleVerifyOtp() {
    if (isVerifyingOtp) return;

    await verifyOtp({ otp, email: email as string });
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 relative">
      <FastImage
        source={images.auth}
        resizeMode={FastImage.resizeMode.cover}
        style={{ width: "100%", height: 500 }}
      />

      <View className="bg-slate-50 absolute w-full bottom-0 py-8 rounded-t-3xl flex flex-col h-[520px] px-4">
        <View className="flex flex-row items-center justify-center text-black gap-2">
          <AppName />
        </View>

        <View className="mt-8 flex flex-col gap-y-2">
          <Text className="font-poppins-medium text-center text-lg text-black ">
            Enter a verification code
          </Text>

          <Text className="font-poppins-regular text-center  text-black ">
            We have sent a verfication code to {email}
          </Text>
        </View>

        <View className="mx-8 mt-12 flex flex-col gap-8">
          <OtpInput
            autoFocus={false}
            theme={{
              pinCodeContainerStyle: {
                height: 56,
                width: 56,
                borderWidth: 2,
              },
              pinCodeTextStyle: {
                color: "#3b82f6",
              },
            }}
            numberOfDigits={4}
            focusColor="#3b82f6"
            focusStickBlinkingDuration={500}
            onTextChange={(text) => setOtp(text)}
            // onFilled={(text) => console.log(`OTP is ${text}`)}
            textInputProps={{
              accessibilityLabel: "One-Time Password",
            }}
          />

          <Text className="font-poppins-regular">
            Didn't get a verification code?{" "}
            {timer > 0 ? (
              <Text className={`underline text-[#08334470]`}>
                Resend code {timer > 0 && `(${timer})`}
              </Text>
            ) : (
              <Text
                className={`underline text-primary`}
                onPress={handleResendOtp}
              >
                Resend code
              </Text>
            )}
          </Text>

          <CustomButton
            //   isLoading={isVerifyingOtp}
            //   disabled={isVerifyingOtp}
            title="Verify"
            onPress={handleVerifyOtp}
            containerStyles="mt-4"
            disabled={isVerifyingOtp}
            isLoading={isVerifyingOtp}
          />

          <CustomButton
            title="Cancel"
            onPress={() => {
              // if (isVerifyingOtp) return;
              router.back();
            }}
            containerStyles="!bg-slate-100 border !border-slate-300"
            titleStyles="!text-black"
          />
        </View>
      </View>

      <StatusBar hidden={true} />
    </SafeAreaView>
  );
}
