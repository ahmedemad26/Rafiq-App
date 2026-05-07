"use client";

import { useRouter } from "next/navigation";
import type { TaskStatus } from "@/lib/constants/task-status";
import { useProjectDetails } from "@/features/project/shared/hooks/use-project-details";
import CreateTaskBreadcrumb from "./create-task-breadcrumb";
import CreateTaskForm from "./create-task-form";

type CreateTaskPageClientProps = {
  projectId: string;
  initialEpicId?: string;
  initialStatus?: TaskStatus;
};

export default function CreateTaskPageClient({
  projectId,
  initialEpicId,
  initialStatus,
}: CreateTaskPageClientProps) {
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
          <CreateTaskBreadcrumb projectId={projectId} projectTitle={projectTitle} />
          <h1 className="text-3xl font-bold leading-none tracking-tight text-[#11284d]">
            Create New Task
          </h1>
          <p className="mb-6 mt-2 max-w-xl text-sm text-slate-600">
            Initialize a new work item within the Architectural Workspace ecosystem.
          </p>
        </div>

        <div className="mx-auto w-full max-w-4xl flex-1">
          <CreateTaskForm
            projectId={projectId}
            initialEpicId={initialEpicId}
            initialStatus={initialStatus}
            onSuccess={() => router.push(`/project/${projectId}/tasks?view=board`)}
            onCancel={() => router.push(`/project/${projectId}/tasks?view=board`)}
          />
        </div>
      </div>
    </section>
  );
}


