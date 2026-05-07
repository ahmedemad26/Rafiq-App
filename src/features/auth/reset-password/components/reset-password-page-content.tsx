import Link from "next/link";
import { Suspense } from "react";
import { MoveLeft } from "lucide-react";
import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPageContent() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
        <div className="text-left mb-6">
          <h1 className="text-3xl font-bold mb-3 text-slate-dark">Create a New Password</h1>
          <p className="text-left text-slate-mid">Create a new, strong password to secure your workstation access.</p>
        </div>

        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-4 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 font-semibold text-brand-primary hover:underline">
            <MoveLeft size={20} /> Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
}
