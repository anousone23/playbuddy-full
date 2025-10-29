import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { Dispatch, SetStateAction, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import Modal from "react-native-modal";

type SkillSelectionType = {
  selectedSkill: string;
  setSelectedSkill: Dispatch<SetStateAction<string>>;
};

const INITIAL_SKILLS = ["casual", "beginner", "intermediate", "advanced"];

export default function SkillSelection({
  selectedSkill,
  setSelectedSkill,
}: SkillSelectionType) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  function handleSkillChange(skill: string) {
    setSelectedSkill(skill);

    setIsModalVisible(false);
  }

  return (
    <View className="gap-y-2">
      <Text className={`font-poppins-medium text-black`}>Preferred skill</Text>
      <TouchableOpacity
        className="border border-slate-300 rounded-lg bg-slate-100 px-2 py-3 relative"
        onPress={() => setIsModalVisible(true)}
      >
        <Text className="text-[#08334480] font-poppins-regular text-sm">
          {selectedSkill ? (
            <Text className="text-black">
              {selectedSkill[0].toUpperCase() + selectedSkill.slice(1)}
            </Text>
          ) : (
            "Select a skill"
          )}
        </Text>

        <View className="absolute right-3 bottom-3">
          <AntDesign name="down" size={16} color="#083344" />
        </View>
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
      >
        <View className="bg-slate-50 rounded-lg">
          <FlatList
            data={INITIAL_SKILLS}
            keyExtractor={(item) => item}
            contentContainerStyle={{ rowGap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-slate-100 px-4 py-4 rounded-lg"
                onPress={() => handleSkillChange(item)}
              >
                <Text className="font-poppins-regular text-black">
                  {item[0].toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
