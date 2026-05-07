import { ProjectTasksPage as ProjectTasksFeaturePage } from "@/features/project";

type TasksPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
};

export default async function ProjectTasksRoutePage({ params, searchParams }: TasksPageProps) {
  const { projectId } = await params;
  const { view } = await searchParams;

  return <ProjectTasksFeaturePage projectId={projectId} view={view} />;
}
