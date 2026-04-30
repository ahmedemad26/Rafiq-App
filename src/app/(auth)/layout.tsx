import Link from "next/link";
import { Box } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in to Taskly or create a new account.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-app-background">
      <header className="p-4 shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <Box
            size={20}
            className="text-primary-container transition-transform group-hover:scale-110"
            strokeWidth={2.5}
          />

          <span className="text-[18px] font-black tracking-tight uppercase text-slate-dark">
            TASKLY
          </span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
