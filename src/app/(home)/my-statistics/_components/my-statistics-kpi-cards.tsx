"use client";

import { AlertTriangle, CheckCircle2, ClipboardList } from "lucide-react";

type MyStatisticsKpiCardsProps = {
  totalTasks: number;
  doneTasks: number;
  overdueTasks: number;
};

export default function MyStatisticsKpiCards({
  totalTasks,
  doneTasks,
  overdueTasks,
}: MyStatisticsKpiCardsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <article className="flex items-center justify-between rounded-lg border border-[#E6ECF8] bg-white px-5 py-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.08em] text-slate-500 uppercase">Total Tasks</p>
          <p className="mt-1 text-[39px] leading-none font-bold text-[#0f254a]">{totalTasks}</p>
        </div>
        <span className="rounded-md bg-[#E8EEF8] p-2.5 text-[#2657B7]">
          <ClipboardList className="size-4" />
        </span>
      </article>

      <article className="flex items-center justify-between rounded-lg border border-[#E6ECF8] bg-white px-5 py-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.08em] text-slate-500 uppercase">Completed Tasks</p>
          <p className="mt-1 text-[39px] leading-none font-bold text-[#0f254a]">{doneTasks}</p>
        </div>
        <span className="rounded-md bg-[#E6F4ED] p-2.5 text-[#0F766E]">
          <CheckCircle2 className="size-4" />
        </span>
      </article>

      <article className="flex items-center justify-between rounded-lg border border-[#E6ECF8] bg-white px-5 py-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.08em] text-slate-500 uppercase">Overdue Tasks</p>
          <p className="mt-1 text-[39px] leading-none font-bold text-[#B91C1C]">{overdueTasks}</p>
        </div>
        <span className="rounded-md bg-[#FDECEC] p-2.5 text-[#B91C1C]">
          <AlertTriangle className="size-4" />
        </span>
      </article>
    </div>
  );
}
