import { uploadImage, uploadImages } from "@/api/cloudinary";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useUploadImage() {
  return useMutation({
    mutationFn: uploadImage,
    onError: (error: AxiosError | any) => {
      console.log(error);
      toast.error("Failed to upload image");
    },
  });
}

export function useUploadImages() {
  return useMutation({
    mutationFn: uploadImages,
    onError: (error: AxiosError | any) => {
      console.error(error);
      toast.error("Failed to upload images");
    },
  });
}
