"use client"

import {
  Users,
  Info,
  ChevronLeft,
  LogOut,
  FolderOpen,
  ListChecks,
  Workflow,
  LayoutGrid,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { signOut } from "next-auth/react"

const navItems = [
  { title: "Projects", shortTitle: "Projects", icon: FolderOpen, href: "/projects" },
  { title: "Project Epics", shortTitle: "Epics", icon: Workflow, href: "#" },
  { title: "Project Tasks", shortTitle: "Tasks", icon: ListChecks, href: "#" },
  { title: "Project Members", shortTitle: "Members", icon: Users, href: "#" },
  { title: "Project Details", shortTitle: "Details", icon: Info, href: "#" },
]

export function AppSidebar() {
  const { toggleSidebar, state, setOpenMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="top-16 h-[calc(100svh-4rem)] border-r-0 **:data-[sidebar=sidebar]:bg-[#F1F5FF]"
      >
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 md:hidden">
          <div className="rounded-md bg-blue-600 p-1">
            <LayoutGrid className="size-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900">TASKLY</span>
        </div>
        <SidebarContent className="px-3 py-4">
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              return (
                <SidebarMenuItem key={item.title} className="mb-1">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={`h-12 rounded-lg px-4 transition-all duration-200 ${
                      isActive
                        ? "bg-white text-[#2B59C3] shadow-sm hover:bg-white hover:text-[#2B59C3]"
                        : "text-[#475569] hover:bg-[#E0E7FF] hover:text-[#1E293B]"
                    }`}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3"
                      onClick={() => setOpenMobile(false)}
                    >
                      <item.icon
                        className={`size-5 ${isActive ? "text-[#2B59C3]" : "text-[#64748B]"}`}
                      />
                      <span className="text-[14px] font-semibold">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-[#DDE4FF] p-3">
          <SidebarMenu>
            <SidebarMenuItem className="hidden md:block">
              <SidebarMenuButton
                onClick={toggleSidebar}
                className="h-12 rounded-lg px-4 text-[#64748B] transition-all hover:bg-[#E0E7FF] hover:text-[#1E293B]"
                tooltip={state === "collapsed" ? "Expand" : "Collapse"}
              >
                <ChevronLeft
                  className={`size-5 transition-transform ${state === "collapsed" ? "rotate-180" : ""}`}
                />
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

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-[#F6F8FC] px-2 py-1 md:hidden">
        <ul className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <li key={`mobile-${item.title}`}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center rounded-md py-1 text-[10px] ${
                    isActive ? "text-[#2563EB]" : "text-slate-500"
                  }`}
                >
                  <item.icon className="mb-0.5 size-4" />
                  <span>{item.shortTitle}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
