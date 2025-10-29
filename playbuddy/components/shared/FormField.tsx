import { View, Text, TextInput } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";

type FormFieldProps = {
  labelStyles?: string;
  inputStyles?: string;
  containerStyles?: string;
  label: string;
  placeholder: string;
  value: any;
  onChangeText: (value: string) => void;
  type?: string;
};

export default function FormField({
  value,
  label,
  placeholder,
  inputStyles,
  labelStyles,
  containerStyles,
  onChangeText,
  type,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`flex flex-col gap-2 ${containerStyles}`}>
      <Text className={`font-poppins-medium text-black ${labelStyles}`}>
        {label}
      </Text>

      <View className="relative">
        <TextInput
          value={value}
          placeholder={placeholder}
          keyboardType={type === "number" ? "numeric" : "default"}
          placeholderTextColor={"#08334480"}
          secureTextEntry={type === "password" && !showPassword}
          onChangeText={onChangeText}
          className={`bg-slate-100 font-poppins-medium  text-black rounded-md px-2 py-2 ${inputStyles}`}
          style={{ borderWidth: 1, borderColor: "#cbd5e1" }}
          returnKeyType="next"
        />

        {type === "password" && (
          <Feather
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#083344"
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-3 bottom-[12px]"
          />
        )}
      </View>
    </View>
  );
}
