import { redirect } from "next/navigation";

type ProjectHomePageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectHomePage({ params }: ProjectHomePageProps) {
  const { projectId } = await params;
  redirect(`/project/${projectId}/epics`);
}
