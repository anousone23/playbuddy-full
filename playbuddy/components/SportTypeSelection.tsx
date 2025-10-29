import { ISportType } from "@/types";
import { caseFirstLetterToUpperCase } from "@/utils/helper";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { Dispatch, SetStateAction, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

type SportTypeSelectionType = {
  sportTypes: ISportType[];
  selectedSportType: ISportType | null;
  setSelectedSportType: Dispatch<SetStateAction<ISportType | null>>;
};

export default function SportTypeSelection({
  sportTypes,
  selectedSportType,
  setSelectedSportType,
}: SportTypeSelectionType) {
  const [isSportTypeModalVisible, setIsSportTypeModalVisible] = useState(false);

  const availableSportTypes = sportTypes.filter(
    (locationSportType) => selectedSportType?._id !== locationSportType._id
  );

  function handleSportTypeChange(sportType: ISportType) {
    setSelectedSportType(sportType);
    setIsSportTypeModalVisible(false);
  }

  return (
    <View className="gap-y-2">
      <Text className={`font-poppins-medium text-black`}>Sport type</Text>
      <TouchableOpacity
        className="border border-slate-300 rounded-lg bg-slate-100 px-2 py-3 relative"
        onPress={() => setIsSportTypeModalVisible(true)}
      >
        {selectedSportType ? (
          <Text className="text-black font-poppins-regular text-sm">
            {caseFirstLetterToUpperCase(selectedSportType.name)}
          </Text>
        ) : (
          <Text className="text-[#08334480] font-poppins-regular text-sm">
            Add a sport type
          </Text>
        )}

        <View className="absolute right-3 bottom-3">
          <AntDesign name="down" size={16} color="#083344" />
        </View>
      </TouchableOpacity>

      {/* Modal for selecting sport types */}
      <Modal
        isVisible={isSportTypeModalVisible}
        onBackdropPress={() => setIsSportTypeModalVisible(false)}
      >
        <View className="bg-slate-50 rounded-lg">
          <FlatList
            data={availableSportTypes}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ rowGap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-slate-100 px-4 py-4 rounded-lg"
                onPress={() => handleSportTypeChange(item)}
              >
                <Text className="font-poppins-regular text-black">
                  {caseFirstLetterToUpperCase(item.name)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
