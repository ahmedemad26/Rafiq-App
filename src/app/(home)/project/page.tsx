"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ProjectRow } from "@/lib/types/project";
import {
  PROJECTS_PAGE_SIZE,
  useProjectsInfiniteQuery,
  useProjectsPageQuery,
} from "./_hooks/use-projects-query";
import ProjectsHeader from "./_components/projects-header";
import ProjectsGrid from "./_components/projects-grid";
import ProjectsInfiniteSentinel from "./_components/projects-infinite-sentinel";
import ProjectsPagination from "./_components/projects-pagination";

type ProjectWithDate = {
  id: string;
  name: string;
  description: string;
  createdAtLabel: string;
};

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const isMobile = useIsMobile();
  const limit = PROJECTS_PAGE_SIZE;

  const pageQuery = useProjectsPageQuery({
    page,
    limit,
    enabled: !isMobile,
  });

  const infiniteQuery = useProjectsInfiniteQuery({
    limit,
    enabled: isMobile,
  });

  const pagePayload = pageQuery.data;
  const infinitePayload = infiniteQuery.data;

  const projectsRaw = useMemo((): ProjectRow[] => {
    if (isMobile) {
      if (!infinitePayload?.pages.length) return [];
      return infinitePayload.pages.flatMap((p) => p.data);
    }
    return pagePayload?.data ?? [];
  }, [isMobile, infinitePayload, pagePayload]);

  const totalCount = useMemo(() => {
    if (isMobile) {
      return infinitePayload?.pages[0]?.totalCount ?? 0;
    }
    return pagePayload?.totalCount ?? 0;
  }, [isMobile, infinitePayload, pagePayload]);

  const isLoading = isMobile
    ? infiniteQuery.isPending
    : pageQuery.isPending;

  const isError = isMobile ? infiniteQuery.isError : pageQuery.isError;
  const errorMessage = useMemo(() => {
    const err = isMobile ? infiniteQuery.error : pageQuery.error;
    return err instanceof Error ? err.message : "Failed to load projects";
  }, [isMobile, infiniteQuery.error, pageQuery.error]);

  useEffect(() => {
    if (!isError) return;
    const normalized = errorMessage.toLowerCase();
    const isAuthError =
      normalized.includes("jwt expired") ||
      normalized.includes("unauthorized");

    if (!isAuthError) return;

    const callback = encodeURIComponent("/project");
    router.replace(`/login?callbackUrl=${callback}`);
  }, [errorMessage, isError, router]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit) || 1);

  useEffect(() => {
    if (isMobile || totalPages < 1) return;
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [isMobile, page, totalPages]);

  const projectsWithDate = useMemo<ProjectWithDate[]>(
    () =>
      projectsRaw.map((project) => ({
        ...project,
        createdAtLabel: project.created_at
          ? new Date(project.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
      })),
    [projectsRaw],
  );

  const isFetchingPage = !isMobile && pageQuery.isFetching;

  const loadMore = useCallback(() => {
    void infiniteQuery.fetchNextPage();
  }, [infiniteQuery]);

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd =
    totalCount === 0 ? 0 : (page - 1) * limit + projectsWithDate.length;

  return (
    <section className="flex min-h-[calc(100svh-8rem)] w-full flex-col overflow-x-hidden">
      <ProjectsHeader />

      {isError ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <ProjectsGrid isLoading={isLoading} projects={projectsWithDate} />

      {isMobile ? (
        <ProjectsInfiniteSentinel
          hasNextPage={infiniteQuery.hasNextPage}
          isFetchingNextPage={infiniteQuery.isFetchingNextPage}
          onLoadMore={loadMore}
        />
      ) : null}

      <Button
        type="button"
        variant="brand"
        size="icon"
        className="fixed right-4 bottom-20 z-30 rounded-xl shadow-md md:hidden"
        aria-label="Create new project"
        asChild
      >
        <Link href="/project/add-project">
          <CirclePlus className="size-5" />
        </Link>
      </Button>

      {!isLoading && !isError && totalCount === 0 ? (
        <div className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
          No projects found
        </div>
      ) : null}

      {!isMobile && !isLoading && !isError && totalCount > 0 ? (
        <ProjectsPagination
          page={page}
          totalPages={totalPages}
          totalProjects={totalCount}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onPageChange={setPage}
          isFetching={isFetchingPage}
        />
      ) : null}
    </section>
  );
}
