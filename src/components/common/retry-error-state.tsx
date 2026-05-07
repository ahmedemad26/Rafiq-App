import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RetryErrorStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onRetry: () => void;
  containerClassName?: string;
  iconWrapperClassName?: string;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  buttonClassName?: string;
}

export function RetryErrorState({
  icon: Icon,
  title,
  description,
  onRetry,
  containerClassName,
  iconWrapperClassName,
  iconClassName,
  titleClassName,
  descriptionClassName,
  buttonClassName,
}: RetryErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl px-6 text-center ${containerClassName ?? ""}`}
    >
      <div
        className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-500 ${iconWrapperClassName ?? ""}`}
      >
        <Icon className={`h-7 w-7 ${iconClassName ?? ""}`} />
      </div>

      <h2 className={`text-2xl font-bold tracking-tight text-[#11284d] ${titleClassName ?? ""}`}>
        {title}
      </h2>

      <p className={`mt-3 max-w-sm text-sm leading-relaxed text-slate-600 ${descriptionClassName ?? ""}`}>
        {description}
      </p>

      <Button
        type="button"
        variant="brand"
        size="default"
        onClick={onRetry}
        className={`mt-6 h-10 rounded-md bg-[#003380]! px-5 text-sm font-semibold text-white hover:bg-[#002d6e]! hover:opacity-100! ${buttonClassName ?? ""}`}
      >
        Retry Connection
      </Button>
    </div>
  );
}
