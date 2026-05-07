"use client";

import type { TasksPerProjectRow } from "@/lib/types/statistics";
import { SectionCard } from "@/shared/components/section-card";

interface MyStatisticsProjectsListProps {
  projects: TasksPerProjectRow[];
}

export default function MyStatisticsProjectsList({ projects }: MyStatisticsProjectsListProps) {
  return (
    <SectionCard title="All Projects" className="p-4" headerClassName="mb-5">
      <div className="space-y-2.5">
        {projects.length ? (
          projects.map((item) => (
            <div key={item.project_id} className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-slate-600">{item.project_name}</span>
              <span className="font-bold text-[#10294D]">{item.tasks_count} Tasks</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No project tasks found in this range.</p>
        )}
      </div>
    </SectionCard>
  );
}
