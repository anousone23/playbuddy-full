import { useGetAuthUser } from "@/lib/React Query/auth";
import { Navigate, Outlet } from "react-router";

export default function AuthLayout() {
  const { data: user, isLoading } = useGetAuthUser();

  if (!isLoading && user) return <Navigate to={"/"} />;

  return (
    <div className="bg-slate-50 w-full h-screen">
      <Outlet />
    </div>
  );
}
