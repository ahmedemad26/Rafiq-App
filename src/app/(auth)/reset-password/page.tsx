import type { Metadata } from "next";
import { ResetPasswordPageContent } from "@/features/auth";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Create a new password for your Taskly account.",
};

export default function CreateNewPassword() {
  return <ResetPasswordPageContent />;
}
