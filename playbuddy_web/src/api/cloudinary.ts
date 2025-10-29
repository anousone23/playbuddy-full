import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_URL,
} from "@/constants";
import axios from "axios";

export async function uploadImage({
  file,
  folder,
}: {
  file: File;
  folder: string;
}) {
  const data = new FormData();

  data.append("file", file);
  data.append("cloud_name", CLOUDINARY_CLOUD_NAME);
  data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  data.append("folder", folder);

  const res = await axios.post(CLOUDINARY_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.secure_url;
}

export async function uploadImages({
  images,
  folder,
}: {
  images: File[];
  folder: string;
}) {
  const uploadPromises = images.map((file) => {
    const data = new FormData();

    data.append("file", file);
    data.append("cloud_name", CLOUDINARY_CLOUD_NAME);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    data.append("folder", folder);

    return axios
      .post(CLOUDINARY_URL, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data.secure_url);
  });

  return Promise.all(uploadPromises);
}
