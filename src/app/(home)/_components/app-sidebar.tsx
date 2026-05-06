"use client"

import { BarChart3, CheckCheck, CircleHelp, FolderOpen, ListChecks, Users, Workflow } from "lucide-react"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import type { LucideIcon } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { DesktopSidebar } from "./desktop-sidebar"
import { MobileBottomNav } from "./mobile-bottom-nav"

export type NavItem = {
  title: string
  shortTitle: string
  icon: LucideIcon
  href: string
  disabled?: boolean
}

export type NavItemWithActive = NavItem & {
  isActive: boolean
}

function getActiveProjectId(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean)
  if (segments[0] !== "project" || !segments[1] || segments[1] === "add-project") {
    return null
  }
  return segments[1]
}

function buildNavItems(projectId: string | null): NavItem[] {
  const projectBasePath = projectId ? `/project/${projectId}` : "/project"

  return [
    { title: "Projects", shortTitle: "Projects", icon: FolderOpen, href: "/project" },
    { title: "My Statistics", shortTitle: "Stats", icon: BarChart3, href: "/my-statistics" },
    {
      title: "Project Epics",
      shortTitle: "Epics",
      icon: Workflow,
      href: `${projectBasePath}/epics`,
    },
    {
      title: "Project Tasks",
      shortTitle: "Tasks",
      icon: ListChecks,
      href: `${projectBasePath}/tasks?view=list`,
    },
    {
      title: "Project Members",
      shortTitle: "Members",
      icon: Users,
      href: `${projectBasePath}/members`,
    },
    {
      title: "Project Details",
      shortTitle: "Details",
      icon: CircleHelp,
      href: `${projectBasePath}/edit`,
    },
  ]
}

function navItemIsActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/project") {
    return pathname === "/project" || pathname.startsWith("/project/add-project")
  }
  const normalizedHref = item.href.split("?")[0] ?? item.href
  return pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`)
}

export function AppSidebar() {
  const { setOpenMobile } = useSidebar()
  const pathname = usePathname()
  const activeProjectId = useMemo(() => getActiveProjectId(pathname), [pathname])
  const navItems = useMemo(
    () =>
      buildNavItems(activeProjectId).map((item) => ({
        ...item,
        isActive: navItemIsActive(pathname, item),
      })),
    [activeProjectId, pathname]
  )

  return (
    <>
      <DesktopSidebar
        navItems={navItems}
        onCloseMobile={() => setOpenMobile(false)}
      />
      <MobileBottomNav navItems={navItems} />
    </>
  )
}
