import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return "NA";
  
  if (name.trim().toLowerCase() === "unknown" || name.trim().toLowerCase() === "unassigned") {
    return "U";
  }

  let baseName = name.trim();
  if (baseName.includes("@")) {
    baseName = baseName.split("@")[0] ?? "";
  }

  baseName = baseName.replace(/([a-z])([A-Z])/g, "$1 $2");
  
  const parts = baseName.split(/[\s._-]+/).filter(Boolean);
  
  if (parts.length === 0) return "NA";
  
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
