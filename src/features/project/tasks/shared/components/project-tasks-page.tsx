"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TasksBoardView from "./tasks-board-view";
import TasksListView from "./tasks-list-view";
import { useIsMobile } from "@/hooks/use-mobile";

type ProjectTasksPageProps = {
  projectId: string;
  view?: string;
};

export default function ProjectTasksPage({ projectId, view }: ProjectTasksPageProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isMobile || view === "list") return;
    router.replace(`/project/${projectId}/tasks?view=list`);
  }, [isMobile, mounted, projectId, router, view]);

  if (!mounted || isMobile || view === "list") {
    return <TasksListView projectId={projectId} />;
  }

  return <TasksBoardView projectId={projectId} initialView={view} />;
}

