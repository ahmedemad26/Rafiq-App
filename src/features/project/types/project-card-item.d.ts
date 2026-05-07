import type { ProjectMember } from "@/lib/types/member";
import type { ProjectRow } from "@/lib/types/project";
import type { ProjectTask } from "@/lib/types/project-tasks";

export interface ProjectCardItem {
  id: string;
  name: string;
  description: string;
  createdAtLabel: string;
}

export interface ProjectsPageQueryOptions {
  page: number;
  limit?: number;
  enabled?: boolean;
}

export interface ProjectsInfiniteQueryOptions {
  limit?: number;
  enabled?: boolean;
}

export type ProjectListItem = ProjectRow;

export type TasksListTableProps = {
  data: ProjectTask[];
  totalItems: number;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  hasSearch: boolean;
  currentPage: number;
  pageSize: number;
  members?: ProjectMember[];
  onPageChange: (page: number) => void;
  onOpenTask: (taskId: string) => void;
};
