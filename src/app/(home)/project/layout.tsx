import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "View, create, and manage projects in your Taskly workspace.",
};

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
