import EditProjectPageClient from "./_components/edit-project-page-client";

type EditProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { projectId } = await params;
  return <EditProjectPageClient projectId={projectId} />;
}
