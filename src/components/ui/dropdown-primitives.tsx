"use client";

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils/utils";

type DropdownPanelProps = PropsWithChildren<{
  className?: string;
}>;

export function DropdownPanel({ className, children }: DropdownPanelProps) {
  return (
    <div
      className={cn(
        "absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}

type DropdownOptionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function DropdownOptionButton({
  className,
  active = false,
  children,
  ...props
}: DropdownOptionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "w-full px-3 py-2 text-left text-sm hover:bg-slate-50",
        active ? "bg-slate-50 font-semibold text-[#003380]" : "text-slate-700",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
