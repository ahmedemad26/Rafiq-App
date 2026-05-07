import { CreateTaskPage } from "@/features/project";

type CreateNewTaskPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ epicId?: string; status?: string }>;
};

export default async function CreateNewTaskPage({
  params,
  searchParams,
}: CreateNewTaskPageProps) {
  const { projectId } = await params;
  const { epicId, status } = await searchParams;
  return <CreateTaskPage projectId={projectId} epicId={epicId} status={status} />;
}
