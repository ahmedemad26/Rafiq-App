import type { Metadata } from "next";
import { ForgotPasswordPageContent } from "@/features/auth";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset link for your Taskly account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageContent />;
}