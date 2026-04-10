import { Button } from "@/components/ui/button";

// props for projects header
type ProjectsHeaderProps = {
  onCreateClick: () => void;
};

// projects header component
export default function ProjectsHeader({ onCreateClick }: ProjectsHeaderProps) {
  // return projects header
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>

        {/* Title */}
        <h1 className="text-3xl font-bold leading-none tracking-tight text-[#11284d]">Projects</h1>

        {/* Description */}
        <p className="mt-1 text-xs text-[#4f5562]">Manage and curate your projects</p>
      </div>

      {/* Create Project Button */}
      <Button
        type="button"
        variant="brand"
        size="default"
        onClick={onCreateClick}
        className="hidden h-9 rounded-sm px-4 text-xs font-medium md:inline-flex"
      >
        + Create New Project
      </Button>
    </div>
  );
}
