"use client";

import { ChevronLeft, LayoutGrid, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { NavItemWithActive } from "../types/navigation";
import { SidebarNavList } from "./sidebar-nav-list";

interface DesktopSidebarProps {
  navItems: NavItemWithActive[];
  onCloseMobile: () => void;
}

export function DesktopSidebar({ navItems, onCloseMobile }: DesktopSidebarProps) {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="top-16 h-[calc(100svh-4rem)] border-r-0 **:data-[sidebar=sidebar]:bg-[#F1F5FF]">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2 md:hidden">
        <div className="rounded-md bg-blue-600 p-1">
          <LayoutGrid className="size-4 text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight text-slate-900">TASKLY</span>
      </div>
      <SidebarContent className="px-3 py-4">
        <SidebarNavList navItems={navItems} onItemClick={onCloseMobile} />
      </SidebarContent>

      <SidebarFooter className="border-t border-[#DDE4FF] p-3">
        <SidebarMenu>
          <SidebarMenuItem className="hidden md:block">
            <SidebarMenuButton
              onClick={toggleSidebar}
              className="h-12 rounded-lg px-4 text-[#64748B] transition-all hover:bg-[#E0E7FF] hover:text-[#1E293B]"
              tooltip={state === "collapsed" ? "Expand" : "Collapse"}
            >
              <ChevronLeft className={`size-5 transition-transform ${state === "collapsed" ? "rotate-180" : ""}`} />
              <span className="text-[14px] font-semibold">Collapse</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="h-12 rounded-lg px-4 text-[#EF4444] transition-all hover:bg-red-50 hover:text-red-700"
              tooltip="Logout"
            >
              <LogOut className="size-5" />
              <span className="text-[14px] font-semibold">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
