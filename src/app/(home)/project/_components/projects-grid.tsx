import ProjectsGridSkeleton from "@/components/skeleton/projects-grid-skeleton";
import Link from "next/link";
import { CirclePlus, Pencil } from "lucide-react";

// props for projects grid
type ProjectCardItem = {
  id: string;
  name: string;
  description: string;
  createdAtLabel: string;
};

// props for projects grid
type ProjectsGridProps = {
  isLoading: boolean;
  projects: ProjectCardItem[];
};

export default function ProjectsGrid({ isLoading, projects }: ProjectsGridProps) {
  if (isLoading && projects.length === 0) {
    return <ProjectsGridSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {/* Projects */}
      {projects.map((project) => (
        <div key={project.id} className="relative">
          <Link
            href={`/project/${project.id}/epics`}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B59C3] focus-visible:ring-offset-2"
          >
            <article className="aspect-square w-full flex flex-col justify-between rounded-xl border border-slate-200 bg-[#f7f8fa] p-4 pt-10 transition hover:border-slate-300 hover:shadow-sm">
              <div>
                <h2 className="text-sm font-semibold text-[#0f172a] line-clamp-2">
                  {project.name}
                </h2>

                <p className="mt-1 text-xs text-slate-500 line-clamp-3">
                  {project.description}
                </p>
              </div>

              <div className="mt-3 border-t pt-2 flex justify-between items-center">
                <span className="text-[9px] uppercase text-slate-400">
                  Created
                </span>

                <span className="text-xs text-slate-600">
                  {project.createdAtLabel}
                </span>
              </div>
            </article>
          </Link>
          <Link
            href={`/project/${project.id}/edit`}
            className="absolute right-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white/95 text-[#475569] shadow-sm transition hover:border-[#2B59C3]/40 hover:bg-white hover:text-[#2B59C3]"
            aria-label={`Edit project ${project.name}`}
          >
            <Pencil className="size-3.5" strokeWidth={2.25} />
          </Link>
        </div>
      ))}

      {/* Add Project */}
      <Link
        href="/project/add-project"
        className="hidden aspect-square w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-200 bg-[#f7f8fa] p-4 transition hover:shadow-sm sm:flex"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#e9edf5] text-[#11284d]">
          <CirclePlus className="size-5" />
        </span>
        <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[#374151]">
          Add project
        </span>
      </Link>
    </div>
  );
}
