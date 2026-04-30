import ProjectEpicsPageClient from "./_components/project-epics-page-client";

type EpicsPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectEpicsPage({ params }: EpicsPageProps) {
  const { projectId } = await params;
  return <ProjectEpicsPageClient projectId={projectId} />;
}
