import type { ReactNode } from "react";
import { cn } from "@/lib/utils/utils";

interface FormSurfaceCardProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  containerClassName?: string;
  bodyClassName?: string;
}

export function FormSurfaceCard({
  header,
  footer,
  children,
  containerClassName,
  bodyClassName,
}: FormSurfaceCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]",
        containerClassName,
      )}
    >
      <div className={cn("px-6 pb-1 pt-6 sm:px-8 sm:pt-7", bodyClassName)}>
        {header}
        {children}
      </div>
      {footer}
    </div>
  );
}
