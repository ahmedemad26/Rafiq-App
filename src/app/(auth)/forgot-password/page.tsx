"use client";

import { Check, MoveLeft, RefreshCcw } from "lucide-react";
import ResendCode from "./_components/resend-code";
import Link from "next/link";
import ForgotForm from "./_components/forgot-form";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [lastSentEmail, setLastSentEmail] = useState<string>("");

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-[var(--color-surface-highest)] p-4 rounded-xl">
              <RefreshCcw size={24} className="text-[var(--color-primary)]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-3 text-[var(--color-slate-dark)]">
            Forgot password?
          </h1>
          <p className="text-base text-[var(--color-slate-mid)]">
            No worries, we&apos;ll send you reset instructions.
          </p>
        </div>

        {/* Form */}
        <ForgotForm onSent={setLastSentEmail} />

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 font-semibold text-[var(--color-primary)] hover:underline"
          >
            <MoveLeft size={20} /> Back to log in
          </Link>
        </div>

        {/* Success Section (inside card) */}
        {lastSentEmail && (
          <>
            <hr className="my-5 border-gray-100" />
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100">
                <div className="bg-emerald-600 rounded-full p-0.5 mt-0.5">
                  <Check size={14} className="text-white" />
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  If an account exists with this email, we&apos;ve sent a password reset link.
                </p>
              </div>
              <ResendCode email={lastSentEmail} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}