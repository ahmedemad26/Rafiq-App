"use client";

import Link from "next/link";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import type { NavItemWithActive } from "../types/navigation";

interface SidebarNavListProps {
  navItems: NavItemWithActive[];
  onItemClick?: () => void;
}

export function SidebarNavList({ navItems, onItemClick }: SidebarNavListProps) {
  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.title} className="mb-1">
          <SidebarMenuButton
            asChild
            isActive={item.isActive}
            tooltip={item.title}
            className={`h-12 rounded-lg px-4 transition-all duration-200 ${
              item.isActive
                ? "bg-white text-[#2B59C3] shadow-sm hover:bg-white hover:text-[#2B59C3]"
                : "text-[#475569] hover:bg-[#E0E7FF] hover:text-[#1E293B]"
            }`}
          >
            <Link
              href={item.href}
              className="flex items-center gap-3"
              onClick={() => {
                onItemClick?.();
              }}
            >
              <item.icon className={`size-5 ${item.isActive ? "text-[#2B59C3]" : "text-[#64748B]"}`} />
              <span className="text-[14px] font-semibold">{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
