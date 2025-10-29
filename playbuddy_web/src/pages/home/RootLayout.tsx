import { Navigate, Outlet } from "react-router";

import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useGetAuthUser } from "@/lib/React Query/auth";

export default function RootLayout() {
  const { data: user } = useGetAuthUser();

  if (!user) return <Navigate to={"/signin"} replace />;

  return (
    <SidebarProvider>
      {/* sidebar */}
      <AppSidebar />

      {/* content */}
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
