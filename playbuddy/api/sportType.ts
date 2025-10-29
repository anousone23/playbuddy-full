import axiosInstance from "@/libs/axios";
import { ISportType } from "@/types";

export async function getAllSportTypes(): Promise<ISportType[]> {
  const res = await axiosInstance.get("/api/sportTypes");

  if (res.data.status === "error") {
    console.log("Error from getAllSportTypes", res.data.message);
    throw new Error(res.data.message);
  }

  return res.data.data;
}
