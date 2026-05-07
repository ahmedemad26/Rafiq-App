import { AlertCircle } from "lucide-react";
import { RetryErrorState } from "@/components/common/retry-error-state";

type MembersErrorStateProps = {
  onRetry: () => void;
  message?: string;
};

export function MembersErrorState({ onRetry, message }: MembersErrorStateProps) {
  return (
    <RetryErrorState
      icon={AlertCircle}
      title="Something went wrong"
      description={message ?? "Failed to load project members. Please try again."}
      onRetry={onRetry}
      containerClassName="min-h-[420px] border border-slate-200/70 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]"
      iconWrapperClassName="mb-4 h-10 w-10 rounded-lg"
      iconClassName="h-5 w-5"
    />
  );
}
