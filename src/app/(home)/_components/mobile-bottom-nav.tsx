"use client"

import Link from "next/link"

import type { NavItemWithActive } from "./app-sidebar"

type MobileBottomNavProps = {
  navItems: NavItemWithActive[]
}

export function MobileBottomNav({ navItems }: MobileBottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-[#F6F8FC] px-2 py-1 md:hidden">
      <ul className="grid gap-1" style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}>
        {navItems.map((item) => {
          return (
            <li key={`mobile-${item.title}`}>
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-md py-1 text-[10px] ${
                  item.isActive ? "text-[#2563EB]" : "text-slate-500"
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
  )
}
