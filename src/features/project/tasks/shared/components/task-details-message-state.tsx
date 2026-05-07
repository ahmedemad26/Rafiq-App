type TaskDetailsMessageStateProps = {
  message: string;
};

export function TaskDetailsMessageState({ message }: TaskDetailsMessageStateProps) {
  return <p className="px-6 py-8 text-sm text-slate-600">{message}</p>;
}

