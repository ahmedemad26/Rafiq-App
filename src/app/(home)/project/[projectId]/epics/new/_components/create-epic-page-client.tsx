"use client";

import { useRouter } from "next/navigation";
import { useProjectDetails } from "../../../edit/_hooks/use-project-details";
import CreateEpicBreadcrumb from "./create-epic-breadcrumb";
import CreateEpicForm from "./create-epic-form";

type CreateEpicPageClientProps = {
  projectId: string;
};

export default function CreateEpicPageClient({
  projectId,
}: CreateEpicPageClientProps) {
  const router = useRouter();
  const { data: project, isPending } = useProjectDetails(projectId);
  const projectTitle = project?.name?.trim()
    ? project.name
    : isPending
      ? "Loading project..."
      : projectId;

  return (
    <section className="-mx-6 -mt-6 flex min-h-[calc(100svh-8rem)] flex-col overflow-x-hidden bg-[#F4F7FA] px-6 pb-16 pt-0">
      <div className="flex w-full flex-1 flex-col">
        <div className="mt-2 w-full shrink-0 text-left sm:mt-3">
          <CreateEpicBreadcrumb projectId={projectId} projectTitle={projectTitle} />
          <h1 className="text-3xl font-bold leading-none tracking-tight text-[#11284d]">
            Create New Epic
          </h1>
          <p className="mb-6 mt-2 max-w-xl text-sm text-slate-600">
            Define a major project phase or high-level milestone to group related tasks and
            track architectural progress.
          </p>
        </div>

        <div className="mx-auto w-full max-w-4xl flex-1">
          <CreateEpicForm
            projectId={projectId}
            onSuccess={() => router.push(`/project/${projectId}/epics`)}
            onCancel={() => router.push(`/project/${projectId}/epics`)}
          />
        </div>
      </div>
    </section>
  );
}
