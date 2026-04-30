import TasksBoardView from "./_components/tasks-board-view";
import TasksListView from "./_components/tasks-list-view";

type TasksPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
};

export default async function ProjectTasksPage({ params, searchParams }: TasksPageProps) {
  const { projectId } = await params;
  const { view } = await searchParams;

  if (view === "list") {
    return <TasksListView projectId={projectId} />;
  }

  return <TasksBoardView projectId={projectId} initialView={view} />;
}
