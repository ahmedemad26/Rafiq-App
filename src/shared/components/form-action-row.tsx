import { Button } from "@/components/ui/button";

interface FormActionRowProps {
  onCancel: () => void;
  onSubmit?: () => void;
  cancelLabel?: string;
  submitLabel: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
}

export function FormActionRow({
  onCancel,
  onSubmit,
  cancelLabel = "Cancel",
  submitLabel,
  submittingLabel,
  isSubmitting,
  submitDisabled,
}: FormActionRowProps) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-0 sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="ghost"
        size="default"
        className="h-9 justify-center px-0 text-sm font-semibold text-slate-600 hover:bg-transparent hover:text-[#082456]"
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
      <Button
        type={onSubmit ? "button" : "submit"}
        variant="brand"
        size="default"
        disabled={submitDisabled}
        onClick={onSubmit}
        className="h-9 min-w-[140px] rounded-lg bg-[#003380]! px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,51,128,0.28)] hover:bg-[#002d6e]! hover:opacity-100!"
      >
        {isSubmitting ? (submittingLabel ?? submitLabel) : submitLabel}
      </Button>
    </div>
  );
}
