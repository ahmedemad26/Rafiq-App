import { CreateEpicPageClient } from "@/features/project";

type CreateEpicPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function CreateEpicPage({ params }: CreateEpicPageProps) {
  const { projectId } = await params;
  return <CreateEpicPageClient projectId={projectId} />;
}
