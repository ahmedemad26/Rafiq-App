import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function EpicsEmptyState({ projectId, title }: { projectId: string; title?: string }) {
  return (
    <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col items-center rounded-2xl bg-white px-8 py-14 text-center shadow-[0_4px_24px_rgba(15,23,42,0.05)]">
      <div className="mb-6 inline-flex size-20 items-center justify-center rounded-3xl bg-[#EEF2FF] text-brand-primary">
        <Search className="size-8" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-[#11284d]">
        {title ?? "No epics found for this project"}
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
        Break down your large project into manageable epics to track progress better and
        maintain architectural clarity.
      </p>
      <Button asChild variant="brand" size="default" className="mt-7 h-11 px-6">
        <Link href={`/project/${projectId}/epics/new`}>
          <Plus className="mr-2 size-4" />
          Create First Epic
        </Link>
      </Button>
    </div>
  );
}
