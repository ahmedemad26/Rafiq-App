"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProjectDetails } from "../../shared/hooks/use-project-details";
import EditProjectBreadcrumb from "./edit-project-breadcrumb";
import EditProjectForm from "./edit-project-form";

export interface EditProjectPageClientProps {
  projectId: string;
}

export default function EditProjectPageClient({ projectId }: EditProjectPageClientProps) {
  const router = useRouter();
  const { data: project, isPending } = useProjectDetails(projectId);
  const projectTitle = project?.name?.trim() ? project.name : isPending ? "Loading project..." : projectId;
  const [displayProjectTitle, setDisplayProjectTitle] = useState(projectTitle);
  const resolvedProjectTitle =
    displayProjectTitle && displayProjectTitle !== projectId
      ? displayProjectTitle
      : isPending
        ? "Loading project..."
        : "Edit Project";

  useEffect(() => {
    setDisplayProjectTitle(projectTitle);
  }, [projectTitle]);

  return (
    <section className="-mx-6 -mt-6 flex min-h-[calc(100svh-8rem)] flex-col overflow-x-hidden bg-[#F4F7FA] px-6 pb-16 pt-0">
      <div className="flex w-full flex-1 flex-col">
        <div className="mt-2 w-full shrink-0 text-left sm:mt-3">
          <EditProjectBreadcrumb projectTitle={resolvedProjectTitle} />
          <h1 className="mb-6 text-3xl font-bold leading-none tracking-tight text-[#11284d]">{resolvedProjectTitle}</h1>
          <p className="-mt-4 mb-6 text-sm text-slate-600">
            Project: <span className="font-semibold text-slate-800">{resolvedProjectTitle}</span>
          </p>
        </div>

        <div className="mx-auto w-full max-w-3xl flex-1">
          <EditProjectForm
            projectId={projectId}
            onNameChange={(name) => {
              const trimmedName = name.trim();
              setDisplayProjectTitle(trimmedName || resolvedProjectTitle);
            }}
            onSuccess={() => router.push("/project")}
            onCancel={() => router.push("/project")}
          />
        </div>
      </div>
    </section>
  );
}
