"use client";

import { cn } from "@/lib/utils/utils";

function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "NA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function TaskDetailsPersonRow({
  label,
  name,
  avatar,
}: {
  label: string;
  name: string;
  avatar: string | null;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.08em] text-slate-400 uppercase">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold",
            avatar ? "bg-slate-200 text-transparent" : "bg-[#E8EEF8] text-[#003380]",
          )}
        >
          {avatar ? (
            <span
              className="size-full bg-cover bg-center"
              style={{ backgroundImage: `url(${avatar})` }}
              aria-hidden
            />
          ) : (
            initialsFromName(name)
          )}
        </span>
        <p className="truncate text-sm font-medium text-[#11284d]">{name}</p>
      </div>
    </div>
  );
}

