import { ProjectMembersPageClient } from "@/features/project";

type MembersPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectMembersPage({ params }: MembersPageProps) {
  const { projectId } = await params;
  return <ProjectMembersPageClient projectId={projectId} />;
}
