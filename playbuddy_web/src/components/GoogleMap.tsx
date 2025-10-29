import { LocationFormValues } from "@/types";
import {
  GoogleMap as Map,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { CSSProperties, useCallback, useState } from "react";
import { UseFormReturn } from "react-hook-form";

const containerStyle: CSSProperties = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 17.289916,
  lng: 104.112444,
};

const zoom = 18;

type Props = {
  form: UseFormReturn<LocationFormValues>;
};

export default function GoogleMap({ form }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLngLiteral | null>(() => {
      const lat = Number(form.getValues("coordinates.latitude"));
      const lng = Number(form.getValues("coordinates.longitude"));

      // Check if valid numbers before setting
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
      return null;
    });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setMarkerPosition({ lat, lng });
    form.setValue("coordinates", {
      latitude: lat,
      longitude: lng,
    });
  };

  return isLoaded ? (
    <Map
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
    >
      {markerPosition && <Marker position={markerPosition} />}
    </Map>
  ) : (
    <></>
  );
}
