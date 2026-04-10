"use client"

import { LayoutGrid, Menu } from "lucide-react"
import { useSession } from "next-auth/react"
import { useSidebar } from "@/components/ui/sidebar"

export function AppNavbar() {
  const { data: session } = useSession()
  const { toggleSidebar } = useSidebar()
  const userName = session?.user?.user_metadata?.name || "User"
  const userRole =
    session?.user?.user_metadata?.department || session?.user?.role || "Member"
  const userInitials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-[#F6F8FC]">
      <div className="flex h-full w-full items-center px-4 md:w-64 md:border-r md:border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="rounded-lg bg-blue-600 p-1.5">
            <LayoutGrid className="size-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-slate-900">TASKLY</span>
        </div>
      </div>
      <div className="flex h-full flex-1 items-center justify-end px-4">
        <div className="flex items-center gap-3">
          <div className="hidden text-right leading-tight md:block">
            <p className="text-sm font-semibold text-slate-900">{userName}</p>
            <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#1D4ED8]">
              {userRole}
            </p>
          </div>
          <div className="flex size-8 items-center justify-center rounded-md bg-[#2563EB] text-sm font-bold text-white">
            {userInitials || "U"}
          </div>
        </div>
      </div>
    </header>
  )
}
