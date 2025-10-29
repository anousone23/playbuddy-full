import React from "react";
import { Marker } from "react-native-maps";

import images from "@/constants/images";
import { ILocation } from "@/types";

type LocationMarkerProps = {
  location: ILocation;
  onPress: () => void;
};

export default function LocationMarker({
  location,
  onPress,
}: LocationMarkerProps) {
  return (
    <Marker
      key={location.name}
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      onPress={onPress}
      icon={images.locationMarker}
    />
  );
}
