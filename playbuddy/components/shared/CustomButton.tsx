import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { ActivityIndicator } from "react-native-paper";

type CustomButtonProps = {
  title: string;
  containerStyles?: string;
  titleStyles?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onPress: () => void;
};

export default function CustomButton({
  title,
  containerStyles,
  titleStyles,
  onPress,
  disabled,
  isLoading,
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      className={`bg-primary rounded-md py-4 ${containerStyles} ${
        disabled && "bg-sky-700"
      }`}
      onPress={onPress}
      disabled={disabled}
    >
      {isLoading ? (
        <ActivityIndicator color="#f0f9ff" />
      ) : (
        <Text
          className={`text-white font-poppins-semiBold text-center ${titleStyles}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
