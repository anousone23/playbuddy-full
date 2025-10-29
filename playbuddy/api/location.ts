// src/libs/locations.ts
import axiosInstance from "@/libs/axios";
import { ILocation, ISportType } from "@/types";

export async function getAllLocations(): Promise<ILocation[]> {
  const res = await axiosInstance.get("/api/locations");
  if (res.data.status === "error") {
    console.log("Error from getAllLocations", res.data.message);
    throw new Error(res.data.message);
  }
  return res.data.data;
}

export async function getLocationById(locationId: string): Promise<ILocation> {
  const res = await axiosInstance.get(`/api/locations/${locationId}`);
  if (res.data.status === "error") {
    throw new Error(res.data.message);
  }
  return res.data.data;
}

export async function GetLocationSportTypes(
  locationId: string
): Promise<ISportType[]> {
  const res = await axiosInstance.get(
    `/api/locations/${locationId}/sportTypes`
  );
  if (res.data.status === "error") {
    throw new Error(res.data.message);
  }
  return res.data.data;
}
