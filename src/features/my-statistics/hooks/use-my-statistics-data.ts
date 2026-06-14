"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { TaskStatus } from "@/lib/constants/task-status";
import { getTasksCalendarStats } from "@/lib/actions/products/statistics/get-tasks-calendar-stats";
import { getTasksCountPerProject } from "@/lib/actions/products/statistics/get-tasks-count-per-project";
import {
  buildDailyMap,
  buildDonutEntries,
  buildDonutGradient,
  dateRangeError,
  enumerateDays,
  getDefaultCurrentWeekRange,
  shiftRange,
} from "../utils/my-statistics.utils";

export function useMyStatisticsData() {
  const { data: session } = useSession();
  console.log("[client] session:", JSON.stringify(session?.user));

  const userId = session?.user?.id ?? "anonymous";
  const hasAccessToken = Boolean(session?.user?.access_token);
  const defaults = useMemo(() => getDefaultCurrentWeekRange(), []);
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [projectId, setProjectId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const rangeError = dateRangeError(startDate, endDate);
  const isRangeValid = !rangeError;
  const sharedQueryOptions = {
    enabled: isRangeValid && hasAccessToken,
    refetchOnMount: "always" as const,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  };

  const calendarStatsQuery = useQuery({
    queryKey: [
      "my-statistics",
      "calendar",
      userId,
      startDate,
      endDate,
      projectId,
      status,
    ] as const,
    ...sharedQueryOptions,
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
    queryKey: [
      "my-statistics",
      "projects",
      userId,
      startDate,
      endDate,
    ] as const,
    ...sharedQueryOptions,
    queryFn: async () => {
      const result = await getTasksCountPerProject({
        p_start_date: startDate,
        p_end_date: endDate,
      });
      if ("error" in result) throw new Error(result.error);
      return result.data;
    },
  });

  console.log("[query] enabled:", isRangeValid && hasAccessToken);
  console.log("[query] hasAccessToken:", hasAccessToken);
  console.log("[query] status:", calendarStatsQuery.status);

  const stats = calendarStatsQuery.data;
  const visibleDays = useMemo(
    () => enumerateDays(startDate, endDate),
    [startDate, endDate],
  );
  const dailyMap = useMemo(
    () => buildDailyMap(stats?.daily ?? []),
    [stats?.daily],
  );
  const donutEntries = useMemo(
    () =>
      buildDonutEntries({
        total_tasks: stats?.total_tasks,
        totals: stats?.totals,
      }),
    [stats?.total_tasks, stats?.totals],
  );
  const donutBackground = useMemo(
    () =>
      buildDonutGradient(
        donutEntries.map((entry) => ({
          percent: entry.percent,
          color: entry.color,
        })),
      ),
    [donutEntries],
  );

  const handleShiftRange = (offsetDays: number) => {
    const next = shiftRange(startDate, endDate, offsetDays);
    setStartDate(next.startDate);
    setEndDate(next.endDate);
  };

  const calendarErrorMessage =
    calendarStatsQuery.isError && calendarStatsQuery.error instanceof Error
      ? calendarStatsQuery.error.message
      : "Failed to load statistics.";
  const projectsErrorMessage =
    projectsCountQuery.isError && projectsCountQuery.error instanceof Error
      ? projectsCountQuery.error.message
      : "Failed to load project counts.";

  return {
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
  };
}
