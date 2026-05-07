import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectsHeader() {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold leading-none tracking-tight text-[#11284d]">Projects</h1>
        <p className="mt-1 text-xs text-[#4f5562]">Manage and curate your projects</p>
      </div>

      <Button
        type="button"
        variant="brand"
        size="default"
        className="hidden h-9 rounded-sm px-4 text-xs font-medium md:inline-flex"
        asChild
      >
        <Link href="/project/add-project">+ Create New Project</Link>
      </Button>
    </div>
  );
}
