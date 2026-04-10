import Skelton from "@/components/skelton/skelton";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";

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
  onAddClick: () => void;
};

export default function ProjectsGrid({ isLoading, projects, onAddClick }: ProjectsGridProps) {

  // if loading, show skelton
  if (isLoading) {
      return <Skelton />
  }

  // if not loading, show projects
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Projects */}
      {projects.map((project) => (
        <article
          key={project.id}
          className="aspect-square w-full flex flex-col justify-between rounded-xl border border-slate-200 bg-[#f7f8fa] p-4"
        >
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
      ))}

      {/* Add Project */}
      <Button
        type="button"
        variant="ghost"
        size="default"
        onClick={onAddClick}
        className="hidden h-auto aspect-square w-full rounded-xl border border-dashed border-slate-200 bg-[#f7f8fa] p-4 transition hover:shadow-sm sm:inline-flex"
      >
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#e9edf5] text-[#11284d]">
            <CirclePlus className="size-5" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[#374151]">
            Add project
          </span>
        </div>
      </Button>

    </div>
  );
}
