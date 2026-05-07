"use client";

import { useEffect } from "react";

export default function RecoveryRedirect() {
  useEffect(() => {
    const { pathname, hash, search } = window.location;
    if (pathname !== "/login" || !hash) {
      return;
    }

    const hashParams = new URLSearchParams(hash.replace("#", ""));
    const isRecoveryFlow = hashParams.get("type") === "recovery";
    const errorCode = hashParams.get("error_code");

    if (errorCode === "otp_expired" || errorCode === "access_denied") {
      window.location.replace("/forgot-password?reason=expired");
      return;
    }

    if (!isRecoveryFlow) {
      return;
    }

    window.location.replace(`/reset-password${search}${hash}`);
  }, []);

  return null;
}
