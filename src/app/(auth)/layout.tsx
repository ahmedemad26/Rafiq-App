import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <header className="p-4 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="text-lg font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            ✦ TASKLY
          </span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
