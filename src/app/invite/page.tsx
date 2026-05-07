"use client";

import { Suspense } from "react";
import { InvitePageClient, InviteStateCard } from "@/features/invite";

function InvitePageFallback() {
  return <InviteStateCard title="Loading invitation..." message="Please wait." />;
}

export default function InvitePage() {
  return (
    <Suspense fallback={<InvitePageFallback />}>
      <InvitePageClient />
    </Suspense>
  );
}

