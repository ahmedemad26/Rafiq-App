"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatRangeLabel, parseDate, toDateInputValue } from "../utils/my-statistics.utils";

const WEEKDAY_HEADERS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] as const;

function monthTitle(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
}
function isSameDate(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}
function isInRange(day: Date, start: Date, end: Date): boolean {
  const dayTime = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return dayTime >= startTime && dayTime <= endTime;
}
function monthGrid(viewMonth: Date): Date[] {
  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const last = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayOffset);
  const days: Date[] = [];
  const totalCells = Math.ceil((mondayOffset + last.getDate()) / 7) * 7;
  for (let i = 0; i < totalCells; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

interface MyStatisticsRangePickerProps {
  startDate: string;
  endDate: string;
  open: boolean;
  onToggleOpen: () => void;
  onShiftRange: (offsetDays: number) => void;
  onApplyRange: (start: string, end: string) => void;
}

export default function MyStatisticsRangePicker({
  startDate,
  endDate,
  open,
  onToggleOpen,
  onShiftRange,
  onApplyRange,
}: MyStatisticsRangePickerProps) {
  const [draftStartDate, setDraftStartDate] = useState(startDate);
  const [draftEndDate, setDraftEndDate] = useState(endDate);
  const [viewMonth, setViewMonth] = useState<Date>(() => parseDate(startDate) ?? new Date());

  useEffect(() => {
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
  }, [startDate, endDate]);

  const draftStart = parseDate(draftStartDate);
  const draftEnd = parseDate(draftEndDate);
  const days = monthGrid(viewMonth);

  return (
    <div className="relative flex min-w-0 items-center gap-2.5">
      <button type="button" onClick={() => onShiftRange(-7)} className="inline-flex size-7 items-center justify-center rounded-md text-[#4A4F72] hover:bg-[#DDE0EF]" aria-label="Previous week"><ChevronLeft className="size-4" /></button>
      <button type="button" onClick={onToggleOpen} className="whitespace-nowrap rounded-md px-1 py-0.5 text-sm font-semibold text-[#1A1D3A] hover:bg-[#DDE0EF]">{formatRangeLabel(startDate, endDate)}</button>
      <button type="button" onClick={() => onShiftRange(7)} className="inline-flex size-7 items-center justify-center rounded-md text-[#4A4F72] hover:bg-[#DDE0EF]" aria-label="Next week"><ChevronRight className="size-4" /></button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+12px)] z-30 w-[330px] rounded-xl border border-[#E2E6F2] bg-white p-4 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[32px] leading-none font-semibold text-[#1A2A49]">{monthTitle(viewMonth)}</p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="inline-flex size-7 items-center justify-center rounded text-[#4A4F72] hover:bg-[#EEF0F8]"><ChevronLeft className="size-4" /></button>
              <button type="button" onClick={() => setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="inline-flex size-7 items-center justify-center rounded text-[#4A4F72] hover:bg-[#EEF0F8]"><ChevronRight className="size-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAY_HEADERS.map((day) => (
              <span key={day} className="py-1 text-[12px] font-semibold text-[#9BA3B8]">{day}</span>
            ))}
            {days.map((day) => {
              const currentMonth = day.getMonth() === viewMonth.getMonth();
              const active = draftStart && draftEnd ? isInRange(day, draftStart, draftEnd) : false;
              const startActive = draftStart ? isSameDate(day, draftStart) : false;
              const endActive = draftEnd ? isSameDate(day, draftEnd) : false;
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => {
                    const nextStart = toDateInputValue(day);
                    const nextEndDate = new Date(day);
                    nextEndDate.setDate(day.getDate() + 6);
                    setDraftStartDate(nextStart);
                    setDraftEndDate(toDateInputValue(nextEndDate));
                  }}
                  className={`h-9 rounded-md text-[18px] ${!currentMonth ? "text-[#C5CEDF]" : startActive || endActive ? "bg-[#C8D8F3] font-semibold text-[#1D4ED8]" : active ? "bg-[#E3ECFA] text-[#1D4ED8]" : "text-[#1A2A49] hover:bg-[#EEF0F8]"}`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-3 border-t border-[#E8ECF4] pt-3">
            <div className="flex items-center justify-between">
              <button type="button" onClick={onToggleOpen} className="h-10 rounded-md px-5 text-[20px] font-medium text-[#526180] hover:bg-[#EEF0F8]">Cancel</button>
              <button type="button" onClick={() => onApplyRange(draftStartDate, draftEndDate)} className="h-10 rounded-md bg-[#1453B8] px-6 text-[18px] font-semibold text-white hover:bg-[#0f47a3]">Apply Range</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
