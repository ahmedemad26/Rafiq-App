import type { ProjectMember } from "@/lib/types/member";
import type { ProjectTask } from "@/lib/types/project-tasks";
import { getTasksStateMessage } from "../utils/tasks-list-table.helpers";
import { MemoTaskRow } from "./tasks-list-table-row";

type TasksListTableDesktopProps = {
  data: ProjectTask[];
  membersByAssigneeId: Map<string, ProjectMember>;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  hasSearch: boolean;
  onOpenTask: (taskId: string) => void;
};

export function TasksListTableDesktop({
  data,
  membersByAssigneeId,
  isPending,
  isError,
  errorMessage,
  hasSearch,
  onOpenTask,
}: TasksListTableDesktopProps) {
  const stateMessage = getTasksStateMessage({
    isPending,
    isError,
    errorMessage,
    hasSearch,
    count: data.length,
  });

  return (
    <div className="hidden overflow-x-auto sm:block">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-100 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            <th className="px-4 py-3">Task</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Assignee</th>
            <th className="px-4 py-3 text-right">Settings</th>
          </tr>
        </thead>
        <tbody>
          {stateMessage ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                {stateMessage}
              </td>
            </tr>
          ) : (
            data.map((task) => (
              <MemoTaskRow key={task.id} task={task} membersByAssigneeId={membersByAssigneeId} onOpenTask={onOpenTask} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
