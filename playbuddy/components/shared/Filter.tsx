import { ISkill, ISportType } from "@/types";
import React, { Dispatch, SetStateAction } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

type FilterProps = {
  data: ISportType[] | ISkill[];
  selectedFilter: string;
  setSelectedFilter: Dispatch<SetStateAction<string>>;
  label?: string;
  labelStyle?: string;
  defaultSelector: string;
  filterItemTextStyle?: string;
  type?: string;
};

export default function Filter({
  type,
  label,
  labelStyle,
  data,
  defaultSelector,
  selectedFilter,
  setSelectedFilter,
  filterItemTextStyle,
}: FilterProps) {
  return (
    <View className="gap-y-1">
      {label ? (
        <Text className={`font-poppins-medium ${labelStyle}`}>{label}</Text>
      ) : null}

      <FlatList
        horizontal
        contentContainerStyle={{
          columnGap: 12,
        }}
        keyExtractor={(item) => item._id}
        data={data}
        renderItem={({ item }) => {
          function handleFilterChange() {
            if (item._id === selectedFilter) {
              setSelectedFilter(defaultSelector);
              return;
            }

            setSelectedFilter(item._id);
          }

          return (
            <TouchableOpacity
              className={`bg-blue-50 px-4 py-1 rounded-lg border border-slate-300 ${
                selectedFilter === item._id && "bg-primary"
              }`}
              style={{ elevation: 2 }}
              onPress={handleFilterChange}
            >
              <Text
                className={`font-poppins-regular ${filterItemTextStyle} ${
                  selectedFilter === item._id && "text-white"
                }`}
              >
                {item.name[0].toUpperCase() + item.name.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
