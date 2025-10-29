// src/hooks/useLocationsQuery.ts
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";

import { ILocation, ISportType } from "@/types";
import {
  getAllLocations,
  getLocationById,
  GetLocationSportTypes,
} from "@/api/location";

export function useGetAllLocations() {
  const query = useQuery<ILocation[], Error>({
    queryKey: ["locations"],
    queryFn: getAllLocations,
  });

  useEffect(() => {
    if (query.isError) {
      console.log("Error from useGetAllLocations", query.error?.message);
    }
  }, [query.error, query.isError]);

  return query;
}

export function useGetLocationById(locationId: string) {
  const query = useQuery<ILocation, Error>({
    queryKey: ["location", locationId],
    queryFn: () => getLocationById(locationId),
    enabled: Boolean(locationId),
  });

  useEffect(() => {
    if (query.isError) {
      toast.error(query.error?.message || "Failed to fetch location", {
        position: ToastPosition.BOTTOM,
      });
    }
  }, [query.status, query.error, query.isError]);

  return query;
}

export function useGetLocationSportTypes(locationId: string) {
  const query = useQuery<ISportType[], Error>({
    queryKey: ["locationSportTypes", locationId],
    queryFn: () => GetLocationSportTypes(locationId),
    enabled: Boolean(locationId),
  });

  useEffect(() => {
    if (query.isError) {
      toast.error(
        query.error?.message || "Failed to fetch location sport types",
        { position: ToastPosition.BOTTOM }
      );
    }
  }, [query.status, query.error, query.isError]);

  return query;
}
