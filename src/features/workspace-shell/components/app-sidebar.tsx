"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { buildNavItems, getActiveProjectId, navItemIsActive } from "../utils/navigation";
import { DesktopSidebar } from "./desktop-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const activeProjectId = useMemo(() => getActiveProjectId(pathname), [pathname]);
  const navItems = useMemo(
    () =>
      buildNavItems(activeProjectId).map((item) => ({
        ...item,
        isActive: navItemIsActive(pathname, item.href),
      })),
    [activeProjectId, pathname],
  );

  return (
    <>
      <DesktopSidebar navItems={navItems} onCloseMobile={() => setOpenMobile(false)} />
      <MobileBottomNav navItems={navItems} />
    </>
  );
}
