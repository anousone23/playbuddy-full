import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type AccountInformationItemProps = {
  type?: string;
  label: string;
  value: string;

  onOpenEditModal?: () => void;
};

export default function AccontInformationItem({
  type,
  label,
  value,
  onOpenEditModal,
}: AccountInformationItemProps) {
  return (
    <View
      className="flex-row bg-slate-100 px-2 py-2 rounded-lg"
      style={{ elevation: 3 }}
    >
      <View className="flex-1">
        <Text className="font-poppins-semiBold text-black">{label}</Text>
        <Text className="font-poppins-regular text-black">{value}</Text>
      </View>

      {type === "text" && (
        <TouchableOpacity className="self-end" onPress={onOpenEditModal}>
          <Feather name="edit" size={20} color="#0ea5e9" />
        </TouchableOpacity>
      )}

      {type === "password" && (
        <TouchableOpacity className="self-end" onPress={onOpenEditModal}>
          <Feather name="edit" size={20} color="#0ea5e9" />
        </TouchableOpacity>
      )}
    </View>
  );
}
