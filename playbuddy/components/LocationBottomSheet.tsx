import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-swiper";

import { useGetGroupChatNumberInLocation } from "@/libs/React Query/groupChat";
import { ILocation } from "@/types";
import { caseFirstLetterToUpperCase } from "@/utils/helper";
import FastImage from "react-native-fast-image";

interface LocationBottomSheetProps {
  showBottomSheet: boolean;
  location: ILocation | null;
  onClose: () => void;
  setSelectedLocation: Dispatch<SetStateAction<ILocation | null>>;
}

export default function LocationBottomSheet({
  showBottomSheet,
  location,
  onClose,
  setSelectedLocation,
}: LocationBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [enablePanGesture, setEnablePanGesture] = useState(true);

  const { data: groupChatNumberInLocation, isLoading } =
    useGetGroupChatNumberInLocation(location?._id as string);

  if (!showBottomSheet || !location) return null;

  if (isLoading)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size={"small"} color={"#0ea5e9"} />
      </View>
    );

  return (
    <BottomSheet
      enableContentPanningGesture={enablePanGesture}
      ref={bottomSheetRef}
      snapPoints={["20%", "40%", "60%"]}
      index={3}
      enablePanDownToClose={true}
      onClose={onClose}
      maxDynamicContentSize={500}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
          opacity={0.2}
        />
      )}
    >
      <BottomSheetScrollView className="px-5 flex-1 flex flex-col">
        <View className="flex-row items-center justify-between">
          <Text className="font-poppins-medium text-black text-lg">
            {location.name}
          </Text>
          <Text className="font-poppins-medium text-black text-lg">
            {groupChatNumberInLocation ? groupChatNumberInLocation : 0} groups
          </Text>
        </View>

        {/* image */}
        <View
          className="w-full h-48 bg-slate-200  rounded-md mt-4"
          onTouchStart={() => setEnablePanGesture(false)}
          onTouchEnd={() => setEnablePanGesture(true)}
        >
          <Swiper
            showsPagination={true}
            dot={<Dot />}
            activeDot={<ActiveDot />}
          >
            {location.images.map((image, index) => (
              <View key={index} className="w-full h-full  rounded-md">
                <FastImage
                  source={{ uri: image }}
                  resizeMode={FastImage.resizeMode.cover}
                  style={{ width: "100%", height: "100%", borderRadius: 6 }}
                />
              </View>
            ))}
          </Swiper>
        </View>

        <View className="gap-y-4 mt-4">
          <View>
            <Text className="font-poppins-semiBold text-black">
              Description
            </Text>
            <Text className="font-poppins-regular text-black">
              {location.description}
            </Text>
          </View>

          <View className="justify-between items-start pb-4">
            <View>
              <Text className="font-poppins-semiBold text-black">
                Sport types
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-poppins-regular text-black text-start">
                  {location.sportTypes.map((sportType) => {
                    if (location.sportTypes.length === 1)
                      return caseFirstLetterToUpperCase(sportType.name);

                    return sportType.name === location.sportTypes.at(-1)!.name
                      ? `${caseFirstLetterToUpperCase(sportType.name)}.`
                      : `${caseFirstLetterToUpperCase(sportType.name)},   `;
                  })}
                </Text>
              </View>

              <View className="self-end">
                <TouchableOpacity
                  className="bg-primary items-center justify-center px-4 py-1 rounded-md"
                  onPress={() => {
                    router.push({
                      pathname: `locations/[locationId]` as "/",
                      params: { locationId: location._id },
                    });

                    setSelectedLocation(null);
                  }}
                >
                  <Text className="font-poppins-medium text-white">
                    Explore
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

function Dot() {
  return (
    <View
      style={{
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3,
      }}
      className="bg-slate-100 border border-primary h-[10px] w-[10px] rounded-full"
    />
  );
}

function ActiveDot() {
  return (
    <View
      style={{
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3,
      }}
      className="bg-primary border border-primary h-[10px] w-[10px] rounded-full"
    />
  );
}
