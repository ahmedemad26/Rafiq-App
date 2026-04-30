import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add new project",
  description: "Create a new project in your Taskly workspace.",
};

export default function AddProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
