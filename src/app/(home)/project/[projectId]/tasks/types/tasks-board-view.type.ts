import type { Dispatch, SetStateAction } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import type { TaskStatus } from "@/lib/constants/task-status";
import type { ProjectTask } from "@/lib/types/project-tasks";

export type TasksPage = {
  data: ProjectTask[];
  total: number;
  page: number;
};

export type TasksInfiniteData = {
  pages: TasksPage[];
  pageParams: number[];
};

export type StatusColumnProps = {
  projectId: string;
  status: TaskStatus;
  onOpenTask: (taskId: string) => void;
  searchTerm: string;
};

export type TaskCardProps = {
  task: ProjectTask;
  status: TaskStatus;
  onOpenTask: (taskId: string) => void;
};

export type TasksBoardHeaderProps = {
  projectId: string;
  view: "list" | "board";
  searchValue: string;
  debouncedSearchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
};

export type DragTaskData = {
  taskId?: string;
  status?: TaskStatus;
};

export type DropStatusData = {
  status?: TaskStatus;
};

export type ResolveDropStatus = (event: DragEndEvent) => TaskStatus | null;
