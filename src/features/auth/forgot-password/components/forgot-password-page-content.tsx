import Link from "next/link";
import { MoveLeft, RefreshCcw } from "lucide-react";
import ForgotPasswordFlow from "./forgot-password-flow";

export default function ForgotPasswordPageContent() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-surface-highest p-4 rounded-xl">
              <RefreshCcw size={24} className="text-brand-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-3 text-slate-dark">Forgot password?</h1>
          <p className="text-base text-slate-mid">No worries, we&apos;ll send you reset instructions.</p>
        </div>

        <ForgotPasswordFlow>
          <div className="mt-4 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 font-semibold text-brand-primary hover:underline">
              <MoveLeft size={20} /> Back to log in
            </Link>
          </div>
        </ForgotPasswordFlow>
      </div>
    </div>
  );
}
