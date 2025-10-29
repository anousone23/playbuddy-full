import {
  createLocation,
  deleteLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
} from "@/api/location";
import { ILocation } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Axios } from "axios";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function useGetAllLocations() {
  return useQuery<ILocation[]>({
    queryKey: ["locations"],
    queryFn: getAllLocations,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createLocation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success(data.message || "Location created successfully");
      navigate("/locations");
    },
    onError: (error: Axios | any) => {
      console.log(error);
      toast.error(error.response.data.message || "Failed to create location");
    },
  });
}

export function useGetLocationById({ locationId }: { locationId: string }) {
  return useQuery<ILocation>({
    queryKey: ["location", locationId],
    queryFn: () => getLocationById({ locationId }),
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLocation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["location", data.data._id] });
      toast.success(data.message || "Location updated successfully");
    },
    onError: (error: Axios | any) => {
      console.log(error);
      toast.error(error.response.data.message || "Failed to update location");
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLocation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success(data.message || "Location deleted successfully");
    },
    onError: (error: Axios | any) => {
      console.log(error);
      toast.error(error.response.data.message || "Failed to delete location");
    },
  });
}
