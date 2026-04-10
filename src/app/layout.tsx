import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils/utils";
import Provider from "@/components/providers/shared";
import { Metadata } from "next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "Taskly",
    template: "%s | Taskly",
  },
  description: "Taskly helps teams manage projects and tasks with a clean, focused workspace.",
  applicationName: "Taskly",
  keywords: ["Taskly", "project management", "tasks", "workspace", "productivity"],
  openGraph: {
    title: "Taskly",
    description: "Taskly helps teams manage projects and tasks with a clean, focused workspace.",
    siteName: "Taskly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taskly",
    description: "Taskly helps teams manage projects and tasks with a clean, focused workspace.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
