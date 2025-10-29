import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/shared/CustomButton";
import { useSignup } from "@/libs/React Query/auth";
import { SignupFormType } from "@/types";
import { Feather } from "@expo/vector-icons";
import { Href, Link } from "expo-router";
import { useRef, useState } from "react";

export default function SignUpScreen() {
  const [form, setForm] = useState<SignupFormType>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPassowordInputRef = useRef<TextInput>(null);

  const { mutateAsync: signup, isPending: isSigningUp } = useSignup();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Text className="font-poppins-bold text-2xl text-center mt-16">
        Create an account
      </Text>
      <ScrollView>
        <View className="py-4">
          <View className="mx-8 mt-12 flex flex-col gap-8">
            {/* name */}
            <View className={`flex flex-col gap-2`}>
              <Text className={`font-poppins-medium text-black text-lg`}>
                Name
              </Text>

              <View className="relative">
                <TextInput
                  value={form.name}
                  placeholder="Enter your name"
                  placeholderTextColor={"#08334480"}
                  onChangeText={(value) => setForm({ ...form, name: value })}
                  className={`bg-slate-100 font-poppins-medium  text-black rounded-md px-2 py-2`}
                  style={{ borderWidth: 1, borderColor: "#cbd5e1" }}
                  returnKeyType="next"
                  ref={nameInputRef}
                  onSubmitEditing={() => emailInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
            </View>

            {/* email */}
            <View className={`flex flex-col gap-2`}>
              <Text className={`font-poppins-medium text-black text-lg`}>
                Email
              </Text>

              <View className="relative">
                <TextInput
                  value={form.email}
                  placeholder="Enter your email"
                  placeholderTextColor={"#08334480"}
                  onChangeText={(value) => setForm({ ...form, email: value })}
                  className={`bg-slate-100 font-poppins-medium  text-black rounded-md px-2 py-2`}
                  style={{ borderWidth: 1, borderColor: "#cbd5e1" }}
                  returnKeyType="next"
                  ref={emailInputRef}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
            </View>

            {/* password */}
            <View className={`flex flex-col gap-2`}>
              <Text className={`font-poppins-medium text-black text-lg`}>
                Password
              </Text>

              <View className="relative">
                <TextInput
                  value={form.password}
                  placeholder="Enter your password"
                  placeholderTextColor={"#08334480"}
                  secureTextEntry={!showPassword}
                  onChangeText={(value) =>
                    setForm({ ...form, password: value })
                  }
                  className={`bg-slate-100 font-poppins-medium  text-black rounded-md px-2 py-2`}
                  style={{ borderWidth: 1, borderColor: "#cbd5e1" }}
                  returnKeyType="go"
                  ref={passwordInputRef}
                  onSubmitEditing={() =>
                    confirmPassowordInputRef.current?.focus()
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
                  value={form.confirmPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={"#08334480"}
                  secureTextEntry={!showConfirmPassword}
                  onChangeText={(value) =>
                    setForm({ ...form, confirmPassword: value })
                  }
                  className={`bg-slate-100 font-poppins-medium  text-black rounded-md px-2 py-2`}
                  style={{ borderWidth: 1, borderColor: "#cbd5e1" }}
                  returnKeyType="go"
                  ref={confirmPassowordInputRef}
                  onSubmitEditing={() => {
                    signup(form);
                  }}
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
              isLoading={isSigningUp}
              disabled={isSigningUp}
              title="Sign Up"
              titleStyles="text-lg"
              containerStyles="mt-8"
              onPress={async () => {
                await signup(form);
              }}
            />

            <Text className="font-poppins-regular text-black text-center">
              Already have an account?{" "}
              <Link
                href={"/(auth)/sign-in" as Href}
                className="underline text-primary"
              >
                Sign In
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}
