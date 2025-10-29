import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useGetAllLocations } from "@/libs/React Query/location";
import { ILocation, ISportType } from "@/types";
import FastImage from "react-native-fast-image";

type SearchBarProps = {
  setIsSearchActive: (isActive: boolean) => void;
};

export default function SearchBar({ setIsSearchActive }: SearchBarProps) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ILocation[] | []>([]);

  const { data: locations, isLoading: isGettingAllLocations } =
    useGetAllLocations();

  function handleChangeText(value: string) {
    if (isGettingAllLocations) return;

    setSearch(value);

    // disable map scroll
    if (search.trim().length > 0) setIsSearchActive(true);

    // display location base on search
    if (value.trim() === "") {
      setSearchResults([]);
      setIsSearchActive(false);
    } else {
      const filtered = locations?.filter((l) =>
        l.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered!);
    }
  }

  return (
    <View className="relative">
      <TextInput
        className="border border-slate-300 bg-slate-50 rounded-xl px-4 py-1.5"
        style={{ elevation: 3 }}
        placeholder="Search for location or sport"
        value={search}
        onChangeText={handleChangeText}
      />

      <View className="absolute top-[9px] right-4">
        {!search && <AntDesign name="search1" size={20} color="#17255490" />}

        {search && (
          <Entypo
            name="cross"
            size={24}
            color="#17255490"
            onPress={() => {
              setSearch("");
              setSearchResults([]);
              setIsSearchActive(false);
            }}
          />
        )}
      </View>

      {/* Search list */}
      {searchResults.length > 0 && (
        <FlatList
          ListHeaderComponent={() => (
            <Text className="px-2 text-black font-poppins-regular text-sm">
              Search results ({searchResults.length})
            </Text>
          )}
          style={{
            backgroundColor: "#f8fafc",
            elevation: 5,
            maxHeight: 360,
            borderBottomRightRadius: 10,
            borderBottomLeftRadius: 10,
            overflow: "hidden",
          }}
          data={searchResults}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => <LocationItem location={item} />}
          contentContainerStyle={{ rowGap: 12, paddingVertical: 8 }}
        />
      )}
    </View>
  );
}

function LocationItem({ location }: { location: ILocation }) {
  const [isScrolling, setIsScrolling] = useState(false);

  return (
    <TouchableOpacity
      className="flex-row items-center  gap-x-4 bg-slate-50 px-2 py-2"
      onPress={() =>
        router.push({
          pathname: `/locations/[locationId]` as "/",
          params: { locationId: location._id },
        })
      }
      disabled={isScrolling}
    >
      <View className="items-center justify-center">
        {/* image */}
        <View className="w-14 h-14 bg-slate-400 rounded-lg">
          <FastImage
            source={{ uri: location.images[0] }}
            resizeMode={FastImage.resizeMode.cover}
            style={{ width: "100%", height: "100%", borderRadius: 6 }}
          />
        </View>
      </View>

      <View className="items-start justify-center gap-y-1">
        <Text className="font-poppins-regular text-md">{location.name}</Text>

        <FlatList
          horizontal
          data={location.sportTypes}
          keyExtractor={(item: ISportType) => item._id}
          renderItem={({ item }) => (
            <View className="bg-primary px-2 py-1 rounded-md items-center justify-center">
              <Text className="font-poppins-regular text-xs text-white w-fit">
                {item.name}
              </Text>
            </View>
          )}
          contentContainerStyle={{ columnGap: 4, paddingRight: 60 }}
          onScrollBeginDrag={() => setIsScrolling(true)}
          onScrollEndDrag={() => setIsScrolling(false)}
        />
      </View>
    </TouchableOpacity>
  );
}
