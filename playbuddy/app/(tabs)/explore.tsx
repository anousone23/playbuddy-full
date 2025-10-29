import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import LocationBottomSheet from "@/components/LocationBottomSheet";
import LocationMarker from "@/components/LocationMarker";
import SearchBar from "@/components/SearchBar";

import Filter from "@/components/shared/Filter";
import images from "@/constants/images";
import { useUserLocation } from "@/contexts/UserLocationContext";
import { useGetAllLocations } from "@/libs/React Query/location";
import { useGetAllSportTypes } from "@/libs/React Query/sportType";
import { ILocation, ISportType } from "@/types";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator } from "react-native-paper";
import CustomMapStyle from "../../map-wizard.json";

const INITIAL_REGION = {
  latitude: 17.291800574389484,
  longitude: 104.11292419614878,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function ExploreScreen() {
  const mapRef = useRef<MapView | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [forceReload, setForceReload] = useState(0);

  // get user current location
  const {
    userLocation,
    isLoading: isGettingUserLocation,
    errorLocation,
  } = useUserLocation();

  // Location data
  const { data: locations, isLoading: isGettingLocations } =
    useGetAllLocations();
  const [selectedLocation, setSelectedLocation] = useState<ILocation | null>(
    null
  );

  // Sport types
  const { data: sportTypes, isLoading: isGettingSportTypes } =
    useGetAllSportTypes();

  // Filtering
  const allSportTypeFilter = "67737f62bc3378d9a9d996d3";
  const [selectedFilter, setSelectedFilter] = useState(allSportTypeFilter);
  const displayedLocations =
    selectedFilter === allSportTypeFilter
      ? locations
      : locations?.filter((location) =>
          location.sportTypes.some((t) => t._id === selectedFilter)
        );
  const [isSearchActive, setIsSearchActive] = useState(false);

  const isLoading =
    isGettingUserLocation || isGettingLocations || isGettingSportTypes;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapReady) {
        console.warn("Map was not ready within 2 second. Forcing re-render.");
        setForceReload((prev) => prev + 1);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [mapReady]);

  if (errorLocation) {
    console.log(errorLocation);
  }

  function scrollToUserLocation() {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      toast.error("Unable to locate user position.", {
        position: ToastPosition.BOTTOM,
      });
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#3b82f6" size={"large"} />
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1 relative">
      <View className="absolute top-6 z-10 w-full px-5 gap-y-4 mt-8">
        <SearchBar setIsSearchActive={setIsSearchActive} />

        <Filter
          data={sportTypes as ISportType[]}
          selectedFilter={selectedFilter}
          defaultSelector={allSportTypeFilter}
          setSelectedFilter={setSelectedFilter}
        />
      </View>

      <MapView
        onMapReady={() => {
          if (!isLoading) {
            setMapReady(true);
            console.log("Map loaded");
          }
        }}
        ref={mapRef}
        key={forceReload}
        style={styles.map}
        mapType={"standard"}
        showsPointsOfInterest={false}
        initialRegion={INITIAL_REGION}
        customMapStyle={CustomMapStyle}
        scrollEnabled={!isSearchActive}
        showsCompass={false}
        provider={PROVIDER_GOOGLE}
      >
        {/* User marker */}
        {userLocation && (
          <Marker
            icon={images.userMarker}
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
          />
        )}

        {/* Location markers */}
        {displayedLocations?.map((location) => (
          <LocationMarker
            key={location._id}
            location={location}
            onPress={() => setSelectedLocation(location)}
          />
        ))}
      </MapView>

      {/* Button to scroll to user's location */}
      <TouchableOpacity
        className="absolute bottom-4 right-4 p-3 bg-white rounded-full"
        style={{ elevation: 3 }}
        onPress={scrollToUserLocation}
      >
        <MaterialIcons name="my-location" size={28} color="#3b82f6" />
      </TouchableOpacity>

      {/* Location details bottom sheet */}
      <LocationBottomSheet
        showBottomSheet={Boolean(selectedLocation)}
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
        setSelectedLocation={setSelectedLocation}
      />
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
