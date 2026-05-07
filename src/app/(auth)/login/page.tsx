import type { Metadata } from "next";
import { LoginPageContent } from "@/features/auth";

export const metadata: Metadata = {
  title: { absolute: "Rafiq - Login" },
  description: "Log in to your Taskly workspace.",
};

export default function LoginPage() {
  return <LoginPageContent />;
}
