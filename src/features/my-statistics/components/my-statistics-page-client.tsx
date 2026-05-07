"use client";

import { useProjectsPageQuery } from "@/features/project";
import { useMyStatisticsData } from "../hooks/use-my-statistics-data";
import MyStatisticsFilters from "./my-statistics-filters";
import MyStatisticsKpiCards from "./my-statistics-kpi-cards";
import MyStatisticsProjectsList from "./my-statistics-projects-list";
import MyStatisticsStatusChart from "./my-statistics-status-chart";
import MyStatisticsWeeklyPlanner from "./my-statistics-weekly-planner";

export default function MyStatisticsPageClient() {
  const {
    startDate,
    endDate,
    projectId,
    status,
    rangeError,
    stats,
    visibleDays,
    dailyMap,
    donutEntries,
    donutBackground,
    calendarStatsQuery,
    projectsCountQuery,
    calendarErrorMessage,
    projectsErrorMessage,
    setStartDate,
    setEndDate,
    setProjectId,
    setStatus,
    handleShiftRange,
  } = useMyStatisticsData();
  const projectsQuery = useProjectsPageQuery({ page: 1, limit: 100 });

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

      <MyStatisticsWeeklyPlanner visibleDays={visibleDays} dailyMap={dailyMap} />

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
              {calendarErrorMessage}
            </p>
          ) : null}
          {projectsCountQuery.isError ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {projectsErrorMessage}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
