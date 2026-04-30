"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label"; // تأكد من استيرادها كـ primitive كامل

import { cn } from "@/lib/utils/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-[11px] font-bold uppercase tracking-[0.55px] leading-[16.5px]",

        "text-slate-mid",

        // التموضع والخصائص التشغيلية:
        "flex items-center select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",

        className,
      )}
      {...props}
    />
  );
}

export { Label };
