import { AlertCircle } from "lucide-react";
import { RetryErrorState } from "@/components/common/retry-error-state";

export function EpicsErrorState({ onRetry, message }: { onRetry: () => void; message?: string }) {
  return (
    <RetryErrorState
      icon={AlertCircle}
      title={message ?? "Failed to load epics"}
      description="We're having trouble retrieving your project epics right now. Please try again."
      onRetry={onRetry}
      containerClassName="mx-auto mt-6 min-h-[420px] w-full max-w-2xl bg-white px-8 shadow-[0_4px_24px_rgba(15,23,42,0.05)]"
    />
  );
}
