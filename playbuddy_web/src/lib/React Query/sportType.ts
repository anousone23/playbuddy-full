import {
  createSportType,
  deleteSportType,
  getAllSportTypes,
  updateSportType,
} from "@/api/sportType";
import { ISportType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useGetAllSportTypes() {
  return useQuery<ISportType[]>({
    queryKey: ["sportTypes"],
    queryFn: getAllSportTypes,
  });
}

export function useCreateSportType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSportType,
    onSuccess: () => {
      toast.success("Sport type created successfully");
      queryClient.invalidateQueries({ queryKey: ["sportTypes"] });
    },
    onError: (error: AxiosError | any) => {
      console.log("Error from useCreateSportType", error);
      toast.error(error.response.data.message || "Failed to create sport type");
    },
  });
}

export function useUpdateSportType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSportType,
    onSuccess: () => {
      toast.success("Sport type updated successfully");
      queryClient.invalidateQueries({ queryKey: ["sportTypes"] });
    },
    onError: (error: AxiosError | any) => {
      console.log("Error from useUpdateSportType", error);
      toast.error(error.response.data.message || "Failed to update sport type");
    },
  });
}

export function useDeleteSportType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSportType,
    onSuccess: () => {
      toast.success("Sport type deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sportTypes"] });
    },
    onError: (error: AxiosError | any) => {
      console.log("Error from useDeleteSportType", error);
      toast.error(error.response.data.message || "Failed to delete sport type");
    },
  });
}
