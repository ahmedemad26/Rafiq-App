import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppNavbar } from "./_components/app-navbar"
import { AppSidebar } from "./_components/app-sidebar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Workspace",
  description: "Manage your projects and tasks in your Taskly workspace.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="relative flex min-h-screen w-full flex-col bg-[#F8FAFC]">
          {/* Navbar Fixed */}
          <AppNavbar />

          <div className="flex flex-1 pt-16">
            {/* Sidebar */}
            <AppSidebar />

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-6 pb-20 transition-all duration-300 md:pb-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}