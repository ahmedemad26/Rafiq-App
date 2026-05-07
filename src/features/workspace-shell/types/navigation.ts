import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  shortTitle: string;
  icon: LucideIcon;
  href: string;
  disabled?: boolean;
}

export interface NavItemWithActive extends NavItem {
  isActive: boolean;
}
