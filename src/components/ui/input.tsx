import * as React from "react";
import { cn } from "@/lib/utils/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-[48px] w-full max-w-[480px] px-4 py-[14px]",

        
        "rounded-[4px] border-none bg-surface-highest",

        "text-base text-slate-dark placeholder:text-slate-mid/70",

        "transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",

        className,
      )}
      {...props}
    />
  );
}

export { Input };