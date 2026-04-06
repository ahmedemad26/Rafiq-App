import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils/utils";
import Provider from "@/components/providers/shared";
import { Metadata } from "next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Taskly",
  description: "The editorial approach to task management.",
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
