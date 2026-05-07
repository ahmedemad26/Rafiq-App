import type { Metadata } from "next";
import { SignUpPageContent } from "@/features/auth";

export const metadata: Metadata = {
  title: { absolute: "Rafiq- SignUp" },
  description: "Create a new Taskly account and start managing your workspace.",
};

export default function SignUpPage() {
  return <SignUpPageContent />;
}
