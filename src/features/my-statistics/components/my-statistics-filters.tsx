"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectRow } from "@/lib/types/project";
import MyStatisticsFilterDropdowns from "./my-statistics-filter-dropdowns";
import MyStatisticsRangePicker from "./my-statistics-range-picker";

interface MyStatisticsFiltersProps {
  startDate: string;
  endDate: string;
  projectId: string;
  status: string;
  projects: ProjectRow[];
  rangeError: string | null;
  onShiftRange: (offsetDays: number) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onProjectIdChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function MyStatisticsFilters(props: MyStatisticsFiltersProps) {
  const {
    startDate,
    endDate,
    projectId,
    status,
    projects,
    rangeError,
    onShiftRange,
    onStartDateChange,
    onEndDateChange,
    onProjectIdChange,
    onStatusChange,
  } = props;
  const [openDropdown, setOpenDropdown] = useState<"project" | "status" | null>(null);
  const [openCalendar, setOpenCalendar] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const element = wrapperRef.current;
      if (element && !element.contains(event.target as Node)) {
        setOpenDropdown(null);
        setOpenCalendar(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div className="space-y-2" ref={wrapperRef}>
      <div className="flex w-full flex-col items-start justify-between gap-4 rounded-xl bg-[#EEF0F8] px-5 py-3 lg:flex-row lg:items-center">
        <MyStatisticsRangePicker
          startDate={startDate}
          endDate={endDate}
          open={openCalendar}
          onToggleOpen={() => {
            setOpenCalendar((current) => !current);
            setOpenDropdown(null);
          }}
          onShiftRange={onShiftRange}
          onApplyRange={(nextStart, nextEnd) => {
            onStartDateChange(nextStart);
            onEndDateChange(nextEnd);
            setOpenCalendar(false);
          }}
        />

        <MyStatisticsFilterDropdowns
          projectId={projectId}
          status={status}
          projects={projects}
          openDropdown={openDropdown}
          onToggleDropdown={(kind) => {
            setOpenDropdown((current) => (current === kind ? null : kind));
            setOpenCalendar(false);
          }}
          onCloseDropdown={() => setOpenDropdown(null)}
          onProjectIdChange={onProjectIdChange}
          onStatusChange={onStatusChange}
        />
      </div>
      {rangeError ? <p className="mt-2 text-sm font-medium text-rose-600">{rangeError}</p> : null}
    </div>
  );
}
