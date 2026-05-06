"use client";

import { ChevronDown } from "lucide-react";
import { TASK_STATUSES, taskStatusLabel } from "@/lib/constants/task-status";
import type { ProjectRow } from "@/lib/types/project";

type MyStatisticsFilterDropdownsProps = {
  projectId: string;
  status: string;
  projects: ProjectRow[];
  openDropdown: "project" | "status" | null;
  onToggleDropdown: (kind: "project" | "status") => void;
  onCloseDropdown: () => void;
  onProjectIdChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export default function MyStatisticsFilterDropdowns({
  projectId,
  status,
  projects,
  openDropdown,
  onToggleDropdown,
  onCloseDropdown,
  onProjectIdChange,
  onStatusChange,
}: MyStatisticsFilterDropdownsProps) {
  const statusLabel =
    status === "all"
      ? "All Statuses"
      : taskStatusLabel(status as (typeof TASK_STATUSES)[number])
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase());
  const projectLabel =
    projectId === "all" ? "All Projects" : projects.find((p) => p.id === projectId)?.name || "All Projects";

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <button
          type="button"
          onClick={() => onToggleDropdown("project")}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#D4D8EE] bg-[#EEF0F8] px-3.5 text-sm font-medium text-[#1A1D3A] hover:border-[#A0A7CC] hover:bg-[#E6E9F5]"
        >
          <span className="whitespace-nowrap">{projectLabel}</span>
          <ChevronDown className={`size-3.5 text-[#6B73B5] transition-transform ${openDropdown === "project" ? "rotate-180" : ""}`} />
        </button>
        {openDropdown === "project" ? (
          <div className="absolute right-0 top-[calc(100%+6px)] z-20 min-w-[160px] overflow-hidden rounded-[10px] border border-[#DDE0EF] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
            <button
              type="button"
              onClick={() => {
                onProjectIdChange("all");
                onCloseDropdown();
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm ${projectId === "all" ? "bg-[#EEF0F8] font-semibold text-[#3B44A9]" : "text-[#2D3150] hover:bg-[#EEF0F8]"}`}
            >
              All Projects
            </button>
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => {
                  onProjectIdChange(project.id);
                  onCloseDropdown();
                }}
                className={`block w-full px-4 py-2.5 text-left text-sm ${projectId === project.id ? "bg-[#EEF0F8] font-semibold text-[#3B44A9]" : "text-[#2D3150] hover:bg-[#EEF0F8]"}`}
              >
                {project.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => onToggleDropdown("status")}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#D4D8EE] bg-[#EEF0F8] px-3.5 text-sm font-medium text-[#1A1D3A] hover:border-[#A0A7CC] hover:bg-[#E6E9F5]"
        >
          <span className="whitespace-nowrap">{statusLabel}</span>
          <ChevronDown className={`size-3.5 text-[#6B73B5] transition-transform ${openDropdown === "status" ? "rotate-180" : ""}`} />
        </button>
        {openDropdown === "status" ? (
          <div className="absolute right-0 top-[calc(100%+6px)] z-20 min-w-[170px] overflow-hidden rounded-[10px] border border-[#DDE0EF] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
            <button
              type="button"
              onClick={() => {
                onStatusChange("all");
                onCloseDropdown();
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm ${status === "all" ? "bg-[#EEF0F8] font-semibold text-[#3B44A9]" : "text-[#2D3150] hover:bg-[#EEF0F8]"}`}
            >
              All Statuses
            </button>
            {TASK_STATUSES.map((item) => {
              const itemLabel = taskStatusLabel(item)
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase());
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    onStatusChange(item);
                    onCloseDropdown();
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm ${status === item ? "bg-[#EEF0F8] font-semibold text-[#3B44A9]" : "text-[#2D3150] hover:bg-[#EEF0F8]"}`}
                >
                  {itemLabel}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
