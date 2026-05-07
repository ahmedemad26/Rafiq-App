import type { ProjectEpic } from "@/lib/types/epics";

export type ProjectEpicsListContentProps = {
  projectId: string;
  epics: ProjectEpic[];
  searchValue: string;
  errorMessage?: string;
  isPending: boolean;
  isError: boolean;
  isMobile: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};
