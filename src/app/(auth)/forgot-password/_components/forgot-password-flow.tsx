"use client";

import React from "react";
import { Check, Timer } from "lucide-react";
import ForgotForm from "./forgot-form";

type ForgotPasswordSectionProps = {
  children: React.ReactNode;
};

const RESEND_COOLDOWN_SEC = 5 * 60;

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ForgotPasswordFlow({
  children,
}: ForgotPasswordSectionProps) {
  const [cooldownLeft, setCooldownLeft] = React.useState(0);
  const [showSuccessBanner, setShowSuccessBanner] = React.useState(false);

  React.useEffect(() => {
    if (cooldownLeft <= 0) return;
    const id = window.setInterval(() => {
      setCooldownLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldownLeft]);

  const onResetLinkSent = () => {
    setCooldownLeft(RESEND_COOLDOWN_SEC);
    setShowSuccessBanner(true);
  };

  return (
    <>
      <ForgotForm cooldownLeft={cooldownLeft} onResetLinkSent={onResetLinkSent} />

      {children}

      {showSuccessBanner && (
        <div className="mt-6 space-y-5 border-t border-gray-200 pt-6">
          <div className="flex gap-3 rounded-lg bg-[#E8F5E9] px-4 py-3 text-left">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#15803d]"
              aria-hidden
            >
              <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <p className="text-sm font-medium leading-snug text-[#166534]">
              If an account exists with this email, we&apos;ve sent a password
              reset link.
            </p>
          </div>

          {cooldownLeft > 0 && (
            <div className="space-y-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-mid">
                Didn&apos;t receive the email?
              </p>
              <div
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#eef1f6] py-3.5 text-sm font-medium text-slate-mid"
                role="status"
                aria-live="polite"
              >
                <Timer
                  className="h-[18px] w-[18px] shrink-0 text-slate-mid"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span>Resend in {formatCountdown(cooldownLeft)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
