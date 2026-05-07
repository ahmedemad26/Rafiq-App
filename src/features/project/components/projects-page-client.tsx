"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ProjectCardItem, ProjectListItem } from "../types/project-card-item";
import { formatProjectCreatedAt } from "../utils/format-project-created-at";
import { PROJECTS_PAGE_SIZE, useProjectsInfiniteQuery, useProjectsPageQuery } from "../hooks/use-projects-query";
import ProjectsGrid, { ProjectsErrorState } from "./projects-grid";
import ProjectsHeader from "./projects-header";
import ProjectsInfiniteSentinel from "./projects-infinite-sentinel";
import ProjectsPagination from "./projects-pagination";

export default function ProjectsPageClient() {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const isMobile = useIsMobile();
  const limit = PROJECTS_PAGE_SIZE;

  const pageQuery = useProjectsPageQuery({ page, limit, enabled: !isMobile });
  const infiniteQuery = useProjectsInfiniteQuery({ limit, enabled: isMobile });

  const pagePayload = pageQuery.data;
  const infinitePayload = infiniteQuery.data;

  const projectsRaw = useMemo((): ProjectListItem[] => {
    if (isMobile) {
      if (!infinitePayload?.pages.length) {
        return [];
      }

      return infinitePayload.pages.flatMap((payloadPage) => payloadPage.data);
    }

    return pagePayload?.data ?? [];
  }, [infinitePayload, isMobile, pagePayload]);

  const totalCount = useMemo(() => {
    if (isMobile) {
      return infinitePayload?.pages[0]?.totalCount ?? 0;
    }

    return pagePayload?.totalCount ?? 0;
  }, [infinitePayload, isMobile, pagePayload]);

  const isLoading = isMobile ? infiniteQuery.isPending : pageQuery.isPending;
  const isError = isMobile ? infiniteQuery.isError : pageQuery.isError;

  const errorMessage = useMemo(() => {
    const error = isMobile ? infiniteQuery.error : pageQuery.error;
    return error instanceof Error ? error.message : "Failed to load projects";
  }, [infiniteQuery.error, isMobile, pageQuery.error]);

  const isAuthError = useMemo(() => {
    const normalizedMessage = errorMessage.toLowerCase();
    return (
      normalizedMessage.includes("jwt expired") ||
      normalizedMessage.includes("unauthorized") ||
      normalizedMessage.includes("status 401")
    );
  }, [errorMessage]);

  useEffect(() => {
    if (!isError || !isAuthError) {
      return;
    }

    const callback = encodeURIComponent("/project");
    router.replace(`/login?callbackUrl=${callback}`);
  }, [isAuthError, isError, router]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit) || 1);

  useEffect(() => {
    if (isMobile || totalPages < 1) {
      return;
    }

    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [isMobile, page, totalPages]);

  const projectsWithDate = useMemo<ProjectCardItem[]>(
    () =>
      projectsRaw.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        createdAtLabel: formatProjectCreatedAt(project.created_at),
      })),
    [projectsRaw],
  );

  const isFetchingPage = !isMobile && pageQuery.isFetching;

  const loadMore = useCallback(() => {
    void infiniteQuery.fetchNextPage();
  }, [infiniteQuery]);

  const retryConnection = useCallback(() => {
    if (isMobile) {
      void infiniteQuery.refetch();
      return;
    }

    void pageQuery.refetch();
  }, [infiniteQuery, isMobile, pageQuery]);

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = totalCount === 0 ? 0 : (page - 1) * limit + projectsWithDate.length;

  return (
    <section className="flex min-h-[calc(100svh-8rem)] w-full flex-col overflow-x-hidden">
      <ProjectsHeader />

      {isError && !isAuthError ? (
        <ProjectsErrorState
          message="We're having trouble retrieving your projects right now. Please try again in a moment."
          onRetry={retryConnection}
        />
      ) : (
        <ProjectsGrid isLoading={isLoading} projects={projectsWithDate} />
      )}

      {isMobile ? (
        <ProjectsInfiniteSentinel
          hasNextPage={Boolean(infiniteQuery.hasNextPage)}
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
