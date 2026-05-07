"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectDetails } from "@/features/project";
import { PROJECT_EPICS_PAGE_SIZE, useProjectEpicsInfiniteQuery, useProjectEpicsPageQuery } from "../hooks/use-project-epics";
import EpicsBreadcrumb from "./epics-breadcrumb";
import ProjectEpicsListContent from "./project-epics-list-content";

interface ProjectEpicsPageClientProps {
  projectId: string;
}

export default function ProjectEpicsPageClient({ projectId }: ProjectEpicsPageClientProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = PROJECT_EPICS_PAGE_SIZE;
  const isMobile = useIsMobile();
  const { data: project, isPending: isProjectLoading } = useProjectDetails(projectId);
  const {
    data: pagedResult,
    isPending: isPagedPending,
    isFetching: isPagedFetching,
    isError: isPagedError,
    error: pagedError,
    refetch: refetchPaged,
  } = useProjectEpicsPageQuery({
    projectId,
    page: currentPage,
    searchTerm: debouncedSearchValue,
    limit: pageSize,
    enabled: !isMobile,
  });
  const {
    data: infiniteResult,
    isPending: isInfinitePending,
    isFetching: isInfiniteFetching,
    isError: isInfiniteError,
    error: infiniteError,
    refetch: refetchInfinite,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProjectEpicsInfiniteQuery({
    projectId,
    searchTerm: debouncedSearchValue,
    limit: pageSize,
    enabled: isMobile,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [projectId]);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  const projectTitle = project?.name?.trim() ? project.name : isProjectLoading ? "Loading project..." : projectId;
  const epics = useMemo(() => (isMobile ? infiniteResult?.pages.flatMap((page) => page.data) ?? [] : pagedResult?.data ?? []), [infiniteResult?.pages, isMobile, pagedResult?.data]);
  const totalCount = isMobile ? (infiniteResult?.pages[0]?.totalCount ?? epics.length) : (pagedResult?.totalCount ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const isPending = isMobile ? isInfinitePending : isPagedPending;
  const isError = isMobile ? isInfiniteError : isPagedError;
  const isFetching = isMobile ? isInfiniteFetching : isPagedFetching;
  const errorMessage = useMemo(() => {
    const activeError = isMobile ? infiniteError : pagedError;
    return activeError instanceof Error ? activeError.message : "Failed to load epics";
  }, [infiniteError, isMobile, pagedError]);
  const isSearchDebouncing = searchValue.trim() !== debouncedSearchValue;
  const refetch = isMobile ? refetchInfinite : refetchPaged;

  useEffect(() => {
    if (!isError) return;
    const normalized = errorMessage.toLowerCase();
    const isAuthError = normalized.includes("jwt expired") || normalized.includes("unauthorized");
    if (!isAuthError) return;
    const callback = encodeURIComponent(`/project/${projectId}/epics`);
    router.replace(`/login?callbackUrl=${callback}`);
  }, [errorMessage, isError, projectId, router]);

  return (
    <section className="-mx-6 -mt-6 flex min-h-[calc(100svh-8rem)] flex-col overflow-x-hidden bg-[#F4F7FA] px-6 pb-16 pt-0">
      <div className="mt-2 w-full text-left sm:mt-3">
        <EpicsBreadcrumb projectId={projectId} projectTitle={projectTitle} />
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold leading-none tracking-tight text-[#11284d]">Project Epics</h1>
        <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto sm:flex-nowrap">
          <div className="flex w-full min-w-0 items-center gap-2 rounded-lg bg-[#E8EEF8] px-3 py-2 sm:w-[340px]">
            <Search className="size-4 text-slate-500" />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search epics..."
              className="h-8 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-500"
              aria-label="Search epics"
            />
            {isSearchDebouncing || (debouncedSearchValue && isFetching) ? (
              <span className="text-xs text-slate-500">Loading...</span>
            ) : null}
          </div>
          <Button
            type="button"
            variant="brand"
            size="default"
            className="h-10 rounded-md bg-[#003380]! px-4 text-sm font-semibold text-white hover:bg-[#002d6e]! hover:opacity-100!"
            asChild
          >
            <Link href={`/project/${projectId}/epics/new`}>
              <Plus className="mr-2 size-4" />
              New Epic
            </Link>
          </Button>
        </div>
      </div>

      <ProjectEpicsListContent
        projectId={projectId}
        epics={epics}
        searchValue={debouncedSearchValue}
        errorMessage={errorMessage}
        isPending={isPending}
        isError={isError}
        isMobile={isMobile}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={Math.min(currentPage, totalPages)}
        pageSize={pageSize}
        onRetry={() => void refetch()}
        onPageChange={(page) => {
          if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
          }
        }}
        hasNextPage={Boolean(hasNextPage)}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => {
          if (!isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
      />
    </section>
  );
}
