import { useSidebar } from "./ui/sidebar";
import { Menu } from "lucide-react";

export default function CustomSidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <button onClick={toggleSidebar}>
      <Menu className="text-black" />
    </button>
  );
}
