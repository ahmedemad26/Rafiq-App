import Link from "next/link";
import { Box } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="h-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <header className="p-4 shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <Box
            size={20}
            className="text-[var(--color-primary-container)] transition-transform group-hover:scale-110"
            strokeWidth={2.5}
          />

          <span
            className="text-[18px] font-black tracking-tight uppercase"
            style={{ color: "var(--color-slate-dark)" }}
          >
            TASKLY
          </span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        {children}
        <Toaster />
      </main>
    </div>
  );
}
