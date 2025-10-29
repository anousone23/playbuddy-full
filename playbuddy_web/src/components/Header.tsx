import React from "react";
import CustomSidebarTrigger from "./CustomSidebarTrigger";

export default function Header({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center px-8 md:px-16 py-6 border-b border-slate-200">
      <CustomSidebarTrigger />

      <p className="flex flex-1 justify-center">{children}</p>
    </div>
  );
}
