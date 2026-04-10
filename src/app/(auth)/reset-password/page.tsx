import Link from "next/link";
import ResetPasswordForm from "./_components/reset-passowrd-form";
import { MoveLeft } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Create a new password for your Taskly account.",
};

export default function CreateNewPassword() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
        {/* Header */}
        <div className="text-left mb-6">
          <h1 className="text-3xl font-bold mb-3 text-[var(--color-slate-dark)]">
            Create a New Password{" "}
          </h1>
          <p className="text-left text-[var(--color-slate-mid)]">
            Create a new, strong password to secure your workstation
            access.{" "}
          </p>
        </div>


        {/* Form  */}
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 font-semibold text-[var(--color-primary)] hover:underline"
          >
            <MoveLeft size={20} /> Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
}
