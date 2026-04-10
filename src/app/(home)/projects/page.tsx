"use client";

import { useMemo, useState } from "react";
import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetProjects } from "@/lib/state/projects";
import ProjectsHeader from "./_components/projects-header";
import ProjectsGrid from "./_components/projects-grid";
import CreateProjectSheet from "./_components/create-project-sheet";
import ProjectsPagination from "./_components/projects-pagination";

// props for project with date
type ProjectWithDate = {
  id: string;
  name: string;
  description: string;
  createdAtLabel: string;
};

// projects page component
export default function ProjectsPage() {
  // State
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Query
  const { data: projects = [], isLoading, isError, error } = useGetProjects();
  const projectsPerPage = 5;

  // Projects with date
  const projectsWithDate = useMemo<ProjectWithDate[]>(
    () =>
      projects.map((project) => ({
        ...project,
        createdAtLabel: project.created_at
          ? new Date(project.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
      })),
    [projects]
  );

  // Total projects
  const totalProjects = projectsWithDate.length;
  const totalPages = Math.max(1, Math.ceil(totalProjects / projectsPerPage));

  // Paged projects
  const pagedProjects = useMemo(() => {
    const start = (page - 1) * projectsPerPage;
    return projectsWithDate.slice(start, start + projectsPerPage);
  }, [page, projectsWithDate]);

  // Showing count
  const showingCount = pagedProjects.length;

  // return projects page
  return (
    <section className="flex min-h-[calc(100svh-8rem)] w-full flex-col overflow-x-hidden">
      <ProjectsHeader onCreateClick={() => setOpen(true)} />

      {/* Error */}
      {isError ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : "Failed to load projects."}
        </div>
      ) : null}

      {/* Projects Grid */}
      <ProjectsGrid isLoading={isLoading} projects={pagedProjects} onAddClick={() => setOpen(true)} />
      <CreateProjectSheet open={open} onOpenChange={setOpen} />

      {/* Create Project Button */}
      <Button
        type="button"
        variant="brand"
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-20 z-30 rounded-xl shadow-md md:hidden"
        aria-label="Create new project"
      >
        <CirclePlus className="size-5" />
      </Button>

      {/* No projects found */}
      {!isLoading && !isError && projects.length === 0 ? (
        <div className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
          No projects found. Create your first project.
        </div>
      ) : null}

      {/* Pagination */}

      {!isLoading && !isError && totalProjects > 0 ? (
        <ProjectsPagination
          page={page}
          totalPages={totalPages}
          totalProjects={totalProjects}
          showingCount={showingCount}
          onPageChange={setPage}
        />
      ) : null}
    </section>
  );
}