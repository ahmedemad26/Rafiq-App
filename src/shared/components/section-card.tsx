import type { ReactNode } from "react";
import { cn } from "@/lib/utils/utils";

interface SectionCardProps {
  title?: string;
  titleClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  className?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function SectionCard({
  title,
  titleClassName,
  headerClassName,
  bodyClassName,
  className,
  headerRight,
  children,
}: SectionCardProps) {
  return (
    <section className={cn("rounded-lg border border-[#E6ECF8] bg-white", className)}>
      {title || headerRight ? (
        <div className={cn("mb-3 flex items-center justify-between", headerClassName)}>
          {title ? <h2 className={cn("text-[30px] leading-none font-bold text-[#10294D]", titleClassName)}>{title}</h2> : <span />}
          {headerRight}
        </div>
      ) : null}
      <div className={cn("", bodyClassName)}>{children}</div>
    </section>
  );
}
