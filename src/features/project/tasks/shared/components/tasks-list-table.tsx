"use client";

import { useMemo } from "react";
import { buildMembersByAssigneeId } from "../utils/tasks-list-table.helpers";
import { TasksListTableDesktop } from "./tasks-list-table-desktop";
import { TasksListTableMobile } from "./tasks-list-table-mobile";
import { TasksListTablePagination } from "./tasks-list-table-pagination";
import type { TasksListTableProps } from "@/features/project/types/project-card-item";

export default function TasksListTable({
  data,
  totalItems,
  isPending,
  isError,
  errorMessage,
  hasSearch,
  currentPage,
  pageSize,
  members = [],
  onPageChange,
  onOpenTask,
}: TasksListTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const membersByAssigneeId = useMemo(() => buildMembersByAssigneeId(members), [members]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <TasksListTableMobile
        data={data}
        membersByAssigneeId={membersByAssigneeId}
        isPending={isPending}
        isError={isError}
        errorMessage={errorMessage}
        hasSearch={hasSearch}
        onOpenTask={onOpenTask}
      />
      <TasksListTableDesktop
        data={data}
        membersByAssigneeId={membersByAssigneeId}
        isPending={isPending}
        isError={isError}
        errorMessage={errorMessage}
        hasSearch={hasSearch}
        onOpenTask={onOpenTask}
      />
      <TasksListTablePagination
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        isPending={isPending}
        onPageChange={onPageChange}
      />
    </div>
  );
}