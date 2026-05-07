"use client";

import { useMemo } from "react";
import { TASK_STATUSES, taskStatusLabel, type TaskStatus } from "@/lib/constants/task-status";
import { SectionCard } from "@/shared/components/section-card";
import { dayLabel, toDateInputValue, weekdayLabel } from "../utils/my-statistics.utils";

interface MyStatisticsWeeklyPlannerProps {
  visibleDays: string[];
  dailyMap: Map<string, Partial<Record<TaskStatus, number>>>;
}

export default function MyStatisticsWeeklyPlanner({ visibleDays, dailyMap }: MyStatisticsWeeklyPlannerProps) {
  const todayKey = toDateInputValue(new Date());
  const dayEntriesMap = useMemo(() => {
    const map = new Map<string, Array<{ key: TaskStatus; value: number }>>();
    for (const day of visibleDays) {
      const statuses = dailyMap.get(day) ?? {};
      const entries = TASK_STATUSES.map((item) => ({
        key: item,
        value: Number(statuses[item] ?? 0),
      })).filter((item) => item.value > 0);
      map.set(day, entries);
    }
    return map;
  }, [dailyMap, visibleDays]);

  return (
    <SectionCard title="Weekly Planner" className="rounded-xl p-3" headerClassName="mb-3">
      <div className="grid gap-2 md:grid-cols-7">
        {visibleDays.map((day) => {
          const entries = dayEntriesMap.get(day) ?? [];
          const isToday = day === todayKey;

          return (
            <article
              key={day}
              className={`relative min-h-[210px] rounded-lg border bg-[#F9FBFF] p-2.5 ${
                isToday ? "border-[#2D5BBD] ring-1 ring-[#2D5BBD]" : "border-[#E8EDF8]"
              }`}
            >
              {isToday ? (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-[#1D4ED8] px-2 py-0.5 text-[9px] font-bold text-white">
                  TODAY
                </span>
              ) : null}
              <p className="text-[11px] font-bold tracking-[0.06em] text-slate-400 uppercase">{weekdayLabel(day)}</p>
              <p className="mt-0.5 text-[33px] leading-none font-bold text-[#10294D]">{dayLabel(day)}</p>
              <div className="mt-4 space-y-2">
                {entries.length ? (
                  entries.map((entry) => (
                    <div
                      key={`${day}-${entry.key}`}
                      className="flex items-center justify-between rounded bg-[#E9EEF9] px-2 py-1 text-[10px] font-bold text-[#204780]"
                    >
                      <span>{taskStatusLabel(entry.key)}</span>
                      <span>{entry.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="pt-10 text-center text-[10px] font-semibold tracking-[0.08em] text-slate-400 uppercase">
                    No Tasks
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );
}
