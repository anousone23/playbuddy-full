import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Menu, Modal } from "react-native-paper";
import { PREFERRED_SKILL_OPTIONS } from "../../constants";

type EditModalType = {
  type: string;
  label: string;
  secondLabel?: string;
  placeholder: string;
  secondPlaceholder?: string;
  visible: boolean;
  onDismiss: () => void;
  value: string;
  secondValue?: string;
  onChangeText: (value: string) => void;
  onChangeSecondText?: (value: string) => void;
  onButtonPress?: () => void;
  isUpdating?: boolean;
  onSubmitEditing?: () => void;
};

export default function EditModal({
  type,
  label,
  secondLabel,
  placeholder,
  secondPlaceholder,
  visible,
  onDismiss,
  value,
  secondValue,
  onChangeText,
  onChangeSecondText,
  onButtonPress,
  isUpdating,
  onSubmitEditing,
}: EditModalType) {
  const [skillOptionsVisible, setSkillOptionsVisible] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const confirmNewPasswordInputRef = useRef<TextInput>(null);

  return (
    <Modal visible={visible} onDismiss={onDismiss}>
      <View className="bg-slate-50 mx-4 px-6 py-8 rounded-md gap-y-6">
        {/* group name */}
        {type === "text" && (
          <View className="gap-y-4">
            <Text className="text-black font-poppins-semiBold">{label}</Text>

            <TextInput
              className="border border-slate-300 bg-slate-100 rounded-md px-2 py-2 font-poppins-medium text-sm"
              placeholder={placeholder}
              value={value}
              onChangeText={onChangeText}
            />
          </View>
        )}

        {/* group max member */}
        {type === "number" && (
          <View className="gap-y-4">
            <Text className="text-black font-poppins-semiBold">{label}</Text>

            <TextInput
              className="border border-slate-300 bg-slate-100 rounded-md px-2 py-2 font-poppins-medium text-sm"
              placeholder={placeholder}
              value={value}
              onChangeText={onChangeText}
              keyboardType="numeric"
            />
          </View>
        )}

        {/* group description */}
        {type === "description" && (
          <View className="gap-y-2">
            <Text className={`font-poppins-medium text-black`}>
              Group description
            </Text>

            <TextInput
              style={{ textAlignVertical: "top" }}
              className="bg-slate-100 font-poppins-medium border border-slate-300  text-black rounded-md px-2  text-sm py-2 pb-8"
              placeholder="Enter your group chat description"
              placeholderTextColor={"#08334480"}
              multiline={true}
              value={value}
              onChangeText={onChangeText}
              numberOfLines={10}
              maxLength={300}
            />

            <View className="absolute right-2 bottom-2">
              <Text className="font-poppins-regular text-sm text-black opacity-70">
                {value.length}/300
              </Text>
            </View>
          </View>
        )}

        {/* preferred skill */}
        {type === "skill" && (
          <View className="gap-y-2">
            <Text className="text-black font-poppins-semiBold">{label}</Text>

            <Menu
              style={{
                width: "82%",
              }}
              visible={skillOptionsVisible}
              contentStyle={{ backgroundColor: "#f1f5f9" }}
              anchorPosition="bottom"
              onDismiss={() => setSkillOptionsVisible(false)}
              anchor={
                <TouchableOpacity
                  className="border border-slate-300 bg-slate-100 rounded-md px-2 py-2 font-poppins-medium text-sm"
                  onPress={() => setSkillOptionsVisible(true)}
                >
                  <Text className="font-poppins-medium text-black text-sm">
                    {value}
                  </Text>

                  <View className="absolute right-2 bottom-2">
                    <AntDesign name="down" size={16} color="#083344" />
                  </View>
                </TouchableOpacity>
              }
            >
              {PREFERRED_SKILL_OPTIONS.map((skill) => (
                <Menu.Item
                  key={skill}
                  title={skill[0].toUpperCase() + skill.slice(1)}
                  titleStyle={{
                    fontFamily: "Poppins-Regular",
                    fontSize: 14,
                    color: "#083344",
                  }}
                  onPress={() => {
                    onChangeText(skill);

                    setSkillOptionsVisible(false);
                  }}
                />
              ))}
            </Menu>
          </View>
        )}

        {/* password */}
        {type === "password" && (
          <View className="gap-y-4">
            <View className="gap-y-2 relative">
              <Text className="text-black font-poppins-medium">{label}</Text>

              <TextInput
                className="border border-slate-300 bg-slate-100 rounded-md px-2 py-2 font-poppins-medium text-sm"
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={!showNewPassword}
                returnKeyType="next"
                onSubmitEditing={() =>
                  confirmNewPasswordInputRef.current?.focus()
                }
              />

              <Feather
                name={showNewPassword ? "eye-off" : "eye"}
                size={20}
                color="#083344"
                onPress={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 bottom-[9px]"
              />
            </View>

            <View className="gap-y-2">
              <Text className="text-black font-poppins-medium">
                {secondLabel}
              </Text>

              <TextInput
                className="border border-slate-300 bg-slate-100 rounded-md px-2 py-2 font-poppins-medium text-sm"
                placeholder={secondPlaceholder}
                value={secondValue}
                onChangeText={onChangeSecondText}
                secureTextEntry={!showConfirmPassword}
                ref={confirmNewPasswordInputRef}
                onSubmitEditing={onSubmitEditing}
              />

              <Feather
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color="#083344"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 bottom-[9px]"
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          className="bg-primary rounded-md py-2"
          onPress={onButtonPress}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size={"small"} color={"#f0f9ff"} />
          ) : (
            <Text className="text-center font-poppins-medium text-white">
              Update
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
