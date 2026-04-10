import AddProject from "./add-project";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// props for create project sheet
type CreateProjectSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateProjectSheet({ open, onOpenChange }: CreateProjectSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1.25rem)] max-w-3xl rounded-2xl p-6 sm:p-10 space-y-5">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create project
          </DialogTitle>

          <DialogDescription className="text-sm text-slate-500">
            Add a new project to your workspace.
          </DialogDescription>
        </DialogHeader>

        {/* Add Project */}

        <AddProject onSuccess={() => onOpenChange(false)} />

      </DialogContent>
    </Dialog>
  );
}
