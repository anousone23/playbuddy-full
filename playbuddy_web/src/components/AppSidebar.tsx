import {
  CircleUser,
  LayoutDashboard,
  LogOut,
  MapPin,
  User,
  Users,
  Volleyball,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation, useNavigate } from "react-router";
import AppLogo from "./AppLogo";
import { useLogout } from "@/lib/React Query/auth";

// Menu items.
const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/users",
    icon: User,
  },
  {
    title: "Locations",
    url: "/locations",
    icon: MapPin,
  },
  {
    title: "Sport types",
    url: "/sportTypes",
    icon: Volleyball,
  },
  {
    title: "Group chats",
    url: "/groupChats",
    icon: Users,
  },
];

const settingItems = [
  {
    title: "Account",
    url: "/account",
    icon: CircleUser,
  },
  {
    title: "Logout",
    url: "/signin",
    icon: LogOut,
  },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { mutate: logout } = useLogout();

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      <SidebarContent>
        <SidebarHeader className="py-4">
          <AppLogo logoStyles="w-12! h-12!" textStyles="text-base" />
        </SidebarHeader>

        <div className="flex flex-col justify-between h-full">
          {/* menus */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm md:text-base text-black">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title} className="">
                    <SidebarMenuButton
                      asChild
                      isActive={
                        item.url === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.url)
                      }
                      className="hover:bg-sky-500 hover:text-white transition-all duration-300 text-black py-5 data-[active=true]:bg-sky-500 data-[active=true]:text-white"
                    >
                      <Link to={item.url}>
                        <item.icon className="text-inherit" />
                        <span className="text-inherit text-sm md:text-base">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* settings */}
          <SidebarGroup className="mb-8">
            <SidebarGroupLabel className="text-sm md:text-base text-black">
              Setting
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {settingItems.map((item) => {
                  if (item.title === "Logout") {
                    return (
                      <SidebarMenuItem key={item.title} className="">
                        <SidebarMenuButton
                          asChild
                          className="hover:bg-red-500 hover:text-white transition-all duration-300 text-black py-5"
                        >
                          <button onClick={() => logout()}>
                            <item.icon className="text-inherit" />
                            <span className="text-inherit text-sm md:text-base">
                              {item.title}
                            </span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  } else {
                    return (
                      <SidebarMenuItem key={item.title} className="">
                        <SidebarMenuButton
                          asChild
                          isActive={
                            item.url === "/"
                              ? pathname === "/"
                              : pathname.startsWith(item.url)
                          }
                          className="hover:bg-sky-500 hover:text-white transition-all duration-300 text-black py-5 data-[active=true]:bg-sky-500 data-[active=true]:text-white"
                        >
                          <Link to={item.url}>
                            <item.icon className="text-inherit" />
                            <span className="text-inherit text-sm md:text-base">
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
