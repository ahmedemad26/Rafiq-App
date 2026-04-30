"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useProjectTasks } from "../_hooks/use-project-tasks";
import { useProjectMembers } from "../../members/_hooks/use-project-members";
import TaskDetailsDialog from "./task-details-dialog";
import TasksListHeader from "./tasks-list-header";
import TasksListTable from "./tasks-list-table";

export default function TasksListView({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const PAGE_SIZE = 10;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchValue]);

  const { data, isPending, isError, error } = useProjectTasks(projectId, {
    page: currentPage,
    pageSize: PAGE_SIZE,
    searchTerm: debouncedSearchValue,
  });
  const { data: members = [] } = useProjectMembers(projectId);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const tasks = data?.data ?? [];
  const totalItems = data?.total ?? 0;
  const errorMessage = useMemo(
    () => (error instanceof Error ? error.message : "Failed to load tasks"),
    [error],
  );

  useEffect(() => {
    if (!isError) return;
    const normalized = errorMessage.toLowerCase();
    if (!normalized.includes("jwt expired") && !normalized.includes("unauthorized")) return;
    const callback = encodeURIComponent(`/project/${projectId}/tasks?view=list`);
    router.replace(`/login?callbackUrl=${callback}`);
  }, [errorMessage, isError, projectId, router]);

  return (
    <section className="space-y-5">
      <TaskDetailsDialog
        projectId={projectId}
        taskId={selectedTaskId}
        open={Boolean(selectedTaskId)}
        onOpenChange={(next) => {
          if (!next) setSelectedTaskId(null);
        }}
      />
      <TasksListHeader
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        isSearching={searchValue.trim() !== debouncedSearchValue}
        onViewChange={(nextView) => router.push(`/project/${projectId}/tasks?view=${nextView}`)}
      />
      <TasksListTable
        data={tasks}
        members={members}
        totalItems={totalItems}
        isPending={isPending}
        isError={isError}
        errorMessage={errorMessage}
        hasSearch={Boolean(debouncedSearchValue)}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={(nextPage) => setCurrentPage(nextPage)}
        onOpenTask={(taskId) => setSelectedTaskId(taskId)}
      />
    </section>
  );
}

