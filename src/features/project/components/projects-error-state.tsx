import { EyeOff } from "lucide-react";
import { RetryErrorState } from "@/components/common/retry-error-state";

export interface ProjectsErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export default function ProjectsErrorState({ onRetry, message }: ProjectsErrorStateProps) {
  return (
    <RetryErrorState
      icon={EyeOff}
      title="Something went wrong"
      description={
        message ?? "We're having trouble retrieving your projects right now. Please try again in a moment."
      }
      onRetry={onRetry}
      containerClassName="min-h-[calc(100svh-16rem)]"
      titleClassName="text-3xl"
      descriptionClassName="text-base"
      buttonClassName="mt-7 h-11 px-6"
    />
  );
}
