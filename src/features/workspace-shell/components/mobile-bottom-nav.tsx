"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { NavItemWithActive } from "../types/navigation";

interface MobileBottomNavProps {
  navItems: NavItemWithActive[];
}

export function MobileBottomNav({ navItems }: MobileBottomNavProps) {
  const gridStyle = useMemo(
    () => ({ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }),
    [navItems.length],
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-[#F6F8FC] px-2 py-1 md:hidden">
      <ul className="grid gap-1" style={gridStyle}>
        {navItems.map((item) => (
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
        ))}
      </ul>
    </nav>
  );
}
