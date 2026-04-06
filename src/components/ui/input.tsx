import * as React from "react";
import { cn } from "@/lib/utils/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-[48px] w-full max-w-[480px] px-4 py-[14px]",

        // الشكل والألوان:
        // Background: #D7E2FF (var(--color-surface-highest))
        // Border-radius: 4px
        "rounded-[4px] border-none bg-[var(--color-surface-highest)]",

        // النصوص:
        "text-base text-[var(--color-slate-dark)] placeholder:text-[var(--color-slate-mid)]/70",

        // التأثيرات:
        "transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",

        className,
      )}
      {...props}
    />
  );
}

export { Input };
