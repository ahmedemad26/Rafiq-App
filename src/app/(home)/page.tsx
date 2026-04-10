import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Rafiq - Home" },
  description: "Taskly workspace home.",
};

export default function HomePage() {
  redirect("/projects");
}
