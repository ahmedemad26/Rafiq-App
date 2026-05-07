import { ProjectEpicsPageClient } from "@/features/project";

type EpicsPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectEpicsPage({ params }: EpicsPageProps) {
  const { projectId } = await params;
  return <ProjectEpicsPageClient projectId={projectId} />;
}
