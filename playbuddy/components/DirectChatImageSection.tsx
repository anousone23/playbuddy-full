import { View, Text, FlatList } from "react-native";
import React from "react";

const images = [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }];

export default function DirectChatImageSection() {
  return (
    <FlatList
      className="flex-1"
      data={images}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="w-1/2 h-56 bg-slate-400">
          <Text>image</Text>
        </View>
      )}
      numColumns={2}
    />
  );
}
