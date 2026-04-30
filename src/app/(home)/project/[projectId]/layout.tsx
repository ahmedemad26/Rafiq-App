import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project",
  description: "Project workspace pages for tasks, members, epics, and details.",
};

export default function ActiveProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
