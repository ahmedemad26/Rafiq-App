"use client";

import { useEffect } from "react";

export default function RecoveryRedirect() {
  useEffect(() => {
    const { pathname, hash, search } = window.location;

    if (pathname !== "/login" || !hash) return;

    const hashParams = new URLSearchParams(hash.replace("#", ""));
    const isRecoveryFlow = hashParams.get("type") === "recovery";

    if (!isRecoveryFlow) return;

    window.location.replace(`/reset-password${search}${hash}`);
  }, []);

  return null;
}
