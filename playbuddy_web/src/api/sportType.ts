import axiosInstance from "@/lib/axios";

export async function getAllSportTypes() {
  const res = await axiosInstance.get("/api/sportTypes");

  return res.data.data;
}

export async function createSportType({ name }: { name: string }) {
  const res = await axiosInstance.post("/api/sportTypes", { name });

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

export async function updateSportType({
  sportTypeId,
  name,
}: {
  sportTypeId: string;
  name: string;
}) {
  const res = await axiosInstance.put(`/api/sportTypes/${sportTypeId}`, {
    name,
  });

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}

export async function deleteSportType({
  sportTypeId,
}: {
  sportTypeId: string;
}) {
  const res = await axiosInstance.delete(`/api/sportTypes/${sportTypeId}`);

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data;
}
