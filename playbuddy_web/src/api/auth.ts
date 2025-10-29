import axiosInstance from "@/lib/axios";

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const res = await axiosInstance.post("/api/auth/admin/login", {
    email,
    password,
  });

  if (res.data.status === "error") throw new Error(res.data.message);

  return res.data.data;
}

export async function getAuthUser() {
  const res = await axiosInstance.get("/api/auth/user");

  if (res.data.status === "error") return null;

  return res.data.data;
}

export async function logout() {
  localStorage.clear();

  return { message: "Logout successfully" };
}
