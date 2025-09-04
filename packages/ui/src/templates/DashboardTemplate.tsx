import React from "react";
import { Sidebar, SidebarItem } from "../organisms/layout/Sidebar";
import { cn } from "../lib/utils";

interface DashboardTemplateProps {
  children: React.ReactNode;
  activeRoute?: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

export function DashboardTemplate({
  children,
  activeRoute,
  onNavigate,
  className,
}: DashboardTemplateProps) {
  const handleSidebarItemClick = (item: SidebarItem) => {
    onNavigate?.(item.path);
  };

  return (
    <div className={cn("flex h-screen bg-gray-50", className)}>
      <Sidebar activeItem={activeRoute} onItemClick={handleSidebarItemClick} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
