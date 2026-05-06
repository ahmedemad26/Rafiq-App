"use client";

import { taskStatusLabel, type TaskStatus } from "@/lib/constants/task-status";
import { cn } from "@/lib/utils/utils";

type DonutEntry = {
  key: TaskStatus;
  value: number;
  color: string;
  percent: number;
};

type MyStatisticsStatusChartProps = {
  totalTasks: number;
  donutBackground: string;
  entries: DonutEntry[];
};

function formatLegendLabel(status: TaskStatus): string {
  return taskStatusLabel(status)
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function MyStatisticsStatusChart({
  totalTasks,
  donutBackground,
  entries,
}: MyStatisticsStatusChartProps) {
  return (
    <section className="rounded-[20px] border border-[#E6ECF8] bg-white px-9 py-8">
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-[18px] leading-none font-semibold text-[#1A1A2E]">Tasks by Status</h2>
      </div>
      <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center">
        <div className="relative grid size-[160px] shrink-0 place-items-center rounded-full bg-[#EEF0F6]" style={{ background: donutBackground || "#EEF0F6" }}>
          <div className="grid size-[124px] place-items-center rounded-full bg-white text-center">
            <p className="text-[56px] leading-none font-semibold text-[#1A1A2E]">{totalTasks}</p>
            <p className="mt-0.5 text-[10px] font-medium tracking-widest text-[#9BA3B8] uppercase">Total</p>
          </div>
        </div>
        <div className="w-full space-y-[18px]">
          {entries.length ? (
            entries.map((entry) => (
              <div key={entry.key} className="space-y-[7px]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-[9px]">
                    <span className="size-[10px] rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[14px] leading-none font-medium text-[#2D3150]">
                      {formatLegendLabel(entry.key)}
                    </span>
                  </span>
                  <span className="text-[14px] leading-none font-semibold text-[#1A1A2E]">{entry.value}</span>
                </div>
                <div className="h-1 rounded-full bg-[#EEF0F6]">
                  <div
                    className={cn("h-1 rounded-full")}
                    style={{ width: `${Math.min(100, entry.percent)}%`, backgroundColor: entry.color }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-[14px] text-[#5A6B8A]">No tasks available in this range.</p>
          )}
        </div>
      </div>
    </section>
  );
}
