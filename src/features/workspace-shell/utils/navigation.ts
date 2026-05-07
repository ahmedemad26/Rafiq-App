import { BarChart3, CircleHelp, FolderOpen, ListChecks, Users, Workflow } from "lucide-react";
import type { NavItem } from "../types/navigation";

export function getActiveProjectId(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "project" || !segments[1] || segments[1] === "add-project") {
    return null;
  }
  return segments[1];
}

export function buildNavItems(projectId: string | null): NavItem[] {
  const projectBasePath = projectId ? `/project/${projectId}` : "/project";
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
    { title: "Project Details", shortTitle: "Details", icon: CircleHelp, href: `${projectBasePath}/edit` },
  ];
}

export function navItemIsActive(pathname: string, itemHref: string): boolean {
  if (itemHref === "/project") {
    return pathname === "/project" || pathname.startsWith("/project/add-project");
  }
  const normalizedHref = itemHref.split("?")[0] ?? itemHref;
  return pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`);
}
