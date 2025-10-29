import axiosInstance from "@/lib/axios";
import { CreateLocationType, UpdateLocationType } from "@/types";

export async function getAllLocations() {
  const res = await axiosInstance.get("/api/locations/admin");

  return res.data.data;
}

export async function createLocation(data: CreateLocationType) {
  const res = await axiosInstance.post("/api/locations", data);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

export async function getLocationById({ locationId }: { locationId: string }) {
  const res = await axiosInstance.get(`/api/locations/${locationId}`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function updateLocation({
  locationId,
  data,
}: {
  locationId: string;
  data: UpdateLocationType;
}) {
  const res = await axiosInstance.put(`/api/locations/${locationId}`, data);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

export async function deleteLocation({ locationId }: { locationId: string }) {
  const res = await axiosInstance.delete(`/api/locations/${locationId}`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}
