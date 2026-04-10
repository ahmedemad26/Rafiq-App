import { Button } from "@/components/ui/button";
import { Loader2, Timer } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import useForgotPassword from "../_hooks/use-forgot";
import { toast } from "sonner";

// Props
type ResendCodeProps = {
  email?: string;
  initialSeconds?: number;
};

// Function
const pad = (value: number) => value.toString().padStart(2, "0");

export default function ResendCode({
  email,
  initialSeconds = 60,
}: ResendCodeProps) {

  // State
  const [secondsLeft, setSecondsLeft] = useState(0);
  const { mutate: resend, isPending } = useForgotPassword();
  const hadEmailRef = useRef(false);

  // Function
  const hasSentAtLeastOnce = Boolean(email);
  const canResend = hasSentAtLeastOnce && secondsLeft === 0 && !isPending;

  // Effect
  useEffect(() => {
    const hasEmailNow = Boolean(email);
    if (!hadEmailRef.current && hasEmailNow) {
      setSecondsLeft(initialSeconds);
    }

    hadEmailRef.current = hasEmailNow;
  }, [email, initialSeconds]);

  // Effect
  useEffect(() => {
    if (secondsLeft === 0) return;
    const timeout = setTimeout(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [secondsLeft]);

  // Function
  const timeLabel = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${pad(minutes)}:${pad(seconds)}`;
  }, [secondsLeft]);

  const handleResend = () => {
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }

    resend(
      { email },
      {
        onSuccess: () => {
          toast.success("Reset link sent again");
          setSecondsLeft(initialSeconds);
        },
        onError: (err) => {
          toast.error(err.message);
        },
      },
    );
  };

  return (
    <div className="text-center">
      <p className="text-xs font-bold text-[var(--color-slate-mid)] uppercase tracking-wider mb-3">
        Didn&apos;t receive the email?
      </p>
      <Button
        type="button"
        onClick={handleResend}
        disabled={!canResend}
        className="w-full flex items-center justify-center gap-2 bg-slate-50 text-white py-3 rounded-lg font-semibold disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        {isPending ? (
          <>
            Sending...
            <Loader2 size={20} className="animate-spin" />
          </>
        ) : (
          <>
            <Timer size={20} />
            {secondsLeft === 0 ? "Resend now" : `Resend in ${timeLabel}`}
          </>
        )}
      </Button>
    </div>
  );
}
