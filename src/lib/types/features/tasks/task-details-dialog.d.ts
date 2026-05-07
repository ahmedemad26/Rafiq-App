export type TaskDetailsDialogProps = {
  projectId: string;
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
