"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type TaskStatus } from "@/lib/constants/task-status";
import { getTasksCalendarStats } from "@/lib/actions/products/statistics/get-tasks-calendar-stats";
import { getTasksCountPerProject } from "@/lib/actions/products/statistics/get-tasks-count-per-project";
import { useProjectsPageQuery } from "@/app/(home)/project/_hooks/use-projects-query";
import MyStatisticsFilters from "./my-statistics-filters";
import MyStatisticsKpiCards from "./my-statistics-kpi-cards";
import MyStatisticsProjectsList from "./my-statistics-projects-list";
import MyStatisticsStatusChart from "./my-statistics-status-chart";
import MyStatisticsWeeklyPlanner from "./my-statistics-weekly-planner";
import {
  buildDailyMap,
  buildDonutEntries,
  buildDonutGradient,
  dateRangeError,
  enumerateDays,
  shiftRange,
  getDefaultCurrentWeekRange,
} from "./my-statistics.utils";

export default function MyStatisticsPageClient() {
  const defaults = useMemo(() => getDefaultCurrentWeekRange(), []);
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [projectId, setProjectId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const rangeError = dateRangeError(startDate, endDate);
  const isRangeValid = !rangeError;

  const projectsQuery = useProjectsPageQuery({ page: 1, limit: 100 });

  const calendarStatsQuery = useQuery({
    queryKey: ["my-statistics", "calendar", startDate, endDate, projectId, status] as const,
    enabled: isRangeValid,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      const result = await getTasksCalendarStats({
        p_start_date: startDate,
        p_end_date: endDate,
        p_project_id: projectId === "all" ? null : projectId,
        p_status: status === "all" ? null : (status as TaskStatus),
      });
      if ("error" in result) throw new Error(result.error);
      return result.data;
    },
  });

  const projectsCountQuery = useQuery({
    queryKey: ["my-statistics", "projects", startDate, endDate] as const,
    enabled: isRangeValid,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      const result = await getTasksCountPerProject({
        p_start_date: startDate,
        p_end_date: endDate,
      });
      if ("error" in result) throw new Error(result.error);
      return result.data;
    },
  });

  const stats = calendarStatsQuery.data;
  const visibleDays = useMemo(() => enumerateDays(startDate, endDate), [startDate, endDate]);
  const dailyMap = useMemo(() => buildDailyMap(stats?.daily ?? []), [stats?.daily]);
  const donutEntries = useMemo(
    () => buildDonutEntries({ total_tasks: stats?.total_tasks, totals: stats?.totals }),
    [stats?.total_tasks, stats?.totals],
  );

  const donutBackground = buildDonutGradient(
    donutEntries.map((entry) => ({ percent: entry.percent, color: entry.color })),
  );
  const handleShiftRange = (offsetDays: number) => {
    const next = shiftRange(startDate, endDate, offsetDays);
    setStartDate(next.startDate);
    setEndDate(next.endDate);
  };

  return (
    <section className="mx-auto w-full max-w-[1150px] space-y-4">
      <header>
        <h1 className="text-[46px] leading-none font-bold text-[#11284d]">Weekly Planner</h1>
        <p className="mt-1 text-base text-slate-600">Manage your deadlines and track team velocity.</p>
      </header>

      <MyStatisticsFilters
        startDate={startDate}
        endDate={endDate}
        projectId={projectId}
        status={status}
        projects={projectsQuery.data?.data ?? []}
        rangeError={rangeError}
        onShiftRange={handleShiftRange}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onProjectIdChange={setProjectId}
        onStatusChange={setStatus}
      />

      <MyStatisticsKpiCards
        totalTasks={stats?.total_tasks ?? 0}
        doneTasks={stats?.done_tasks ?? 0}
        overdueTasks={stats?.overdue_tasks ?? 0}
      />

      <MyStatisticsWeeklyPlanner
        visibleDays={visibleDays}
        dailyMap={dailyMap}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <MyStatisticsStatusChart
          totalTasks={stats?.total_tasks ?? 0}
          donutBackground={donutBackground}
          entries={donutEntries}
        />
        <MyStatisticsProjectsList projects={projectsCountQuery.data ?? []} />
      </div>

      {calendarStatsQuery.isError || projectsCountQuery.isError ? (
        <div className="space-y-2">
          {calendarStatsQuery.isError ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {calendarStatsQuery.error instanceof Error
                ? calendarStatsQuery.error.message
                : "Failed to load statistics."}
            </p>
          ) : null}
          {projectsCountQuery.isError ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {projectsCountQuery.error instanceof Error
                ? projectsCountQuery.error.message
                : "Failed to load project counts."}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
