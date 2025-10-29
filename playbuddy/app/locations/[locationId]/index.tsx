import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LocationGroupChatItem from "@/components/LocationGroupChatItem";
import Filter from "@/components/shared/Filter";
import HeaderNavigation from "@/components/shared/HeaderNavigation";
import { useGetAllGroupChatsInLocation } from "@/libs/React Query/groupChat";
import { useGetLocationById } from "@/libs/React Query/location";
import { skills } from "@/utils/data";

export default function LocationDetails() {
  const navigation = useNavigation();
  const { locationId } = useLocalSearchParams();

  const [selectedSkill, setSelectedSkill] = useState<string>("1");
  const [selectedSportType, setSelectedSportType] = useState<string>("1");
  const [refreshing] = useState<boolean>(false);

  const { data: location, isLoading: isGettingLocation } = useGetLocationById(
    locationId as string
  );
  const {
    data: groupChats,
    isLoading: isGettingGroupChatsInLocation,
    refetch: refetchGroupChats,
  } = useGetAllGroupChatsInLocation(locationId as string);

  useEffect(() => {
    navigation.setOptions({
      header: () => <HeaderNavigation title={location?.name} />,
    });
  }, [navigation, location]);

  // filter by skill
  const skillMapping: Record<string, string> = {
    "2": "casual",
    "3": "beginner",
    "4": "intermediate",
    "5": "advanced",
  };

  if (isGettingLocation || isGettingGroupChatsInLocation)
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size={"large"} color={"#0ea5e9"} />
      </SafeAreaView>
    );

  // filter by sport type
  let displayedGroupChats =
    selectedSportType !== "1"
      ? groupChats?.filter(
          (groupChat) => groupChat.sportType._id === selectedSportType
        )
      : groupChats;

  displayedGroupChats =
    selectedSkill !== "1"
      ? displayedGroupChats?.filter(
          (groupChat) =>
            groupChat.preferredSkill === skillMapping[selectedSkill]
        )
      : displayedGroupChats;

  const availableSportTypes = location?.sportTypes
    ? [
        { _id: "1", name: "all" },
        ...location.sportTypes.sort((a, b) => a.name.localeCompare(b.name)),
      ]
    : [];

  const hasMoreThanOneSportTypes = location
    ? location?.sportTypes.length! > 2
    : false;
  const hasMoreThanOneGroupChats = groupChats ? groupChats.length > 1 : false;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5 relative">
      {/* sport filter */}
      {hasMoreThanOneSportTypes && hasMoreThanOneGroupChats && (
        <View className="-mt-8">
          <Filter
            data={availableSportTypes}
            selectedFilter={selectedSportType}
            defaultSelector="1"
            setSelectedFilter={setSelectedSportType}
            label="Filter by sport"
          />
        </View>
      )}

      {/* skill filter */}
      {hasMoreThanOneGroupChats && (
        <View className={`${hasMoreThanOneSportTypes ? "mt-8" : "-mt-4"}`}>
          <Filter
            type="skill"
            data={skills}
            selectedFilter={selectedSkill}
            defaultSelector="1"
            setSelectedFilter={setSelectedSkill}
            label="Filter by skill"
          />
        </View>
      )}

      {/* group chat list */}
      {groupChats && groupChats.length > 0 ? (
        <Text
          className={`font-poppins-medium text-black ${
            (hasMoreThanOneGroupChats || hasMoreThanOneSportTypes) && "mt-8"
          }`}
        >
          {displayedGroupChats?.length} Group chats
        </Text>
      ) : (
        <View className="flex-1 items-center justify-center">
          <View className="items-center gap-2 w-full">
            <Text className="text-black font-poppins-semiBold text-xl text-center w-full">
              No group chat in this location
            </Text>
            <Text className="text-black font-poppins-semiBold text-lg text-center w-full">
              Create some and bring people together
            </Text>
          </View>
        </View>
      )}

      {isGettingGroupChatsInLocation ? (
        <ActivityIndicator size={"large"} color={"#0ea5e9"} />
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => refetchGroupChats()}
              colors={["#0ea5e9"]}
            />
          }
          style={{ marginTop: 8, marginBottom: 60 }}
          data={displayedGroupChats}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            return <LocationGroupChatItem groupChat={item} />;
          }}
        />
      )}

      {/* create new group chat button */}
      <TouchableOpacity
        className="absolute z-10 rounded-full px-2 py-2"
        style={{
          elevation: 5,
          bottom: 16,
          right: 164,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#f1f5f9",
        }}
        onPress={() =>
          router.push({
            pathname: `groupChats/createGroupChat` as "/",
            params: { locationId },
          })
        }
      >
        <Feather name="plus" size={32} color="#3b82f6" />
      </TouchableOpacity>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
