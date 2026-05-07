import { CalendarDays } from "lucide-react";
import type { ProjectEpic } from "@/lib/types/epics";
import { formatEpicDate, initialsFromDisplayName } from "../utils/epic-formatters";

type EpicCardProps = {
  epic: ProjectEpic;
  onOpenDetails: (epic: ProjectEpic) => void;
};

export default function EpicCard({ epic, onOpenDetails }: EpicCardProps) {
  const assigneeName = epic.assignee?.name?.trim() || "Unassigned";
  const creatorName = epic.created_by?.name?.trim() || "Unknown";

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Open details for epic ${epic.epic_id || epic.title || "Untitled"}`}
      onClick={() => onOpenDetails(epic)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails(epic);
        }
      }}
      className="cursor-pointer overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)] outline-none ring-[#003380] transition-shadow hover:shadow-[0_6px_28px_rgba(15,23,42,0.08)] focus-visible:ring-2"
    >
      <div className="border-l-4 border-l-emerald-500 p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="inline-flex h-6 items-center rounded-md bg-emerald-100 px-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700">
            {epic.epic_id || "EPIC"}
          </span>
          <button
            type="button"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="More actions"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="block h-1 w-1 rounded-full bg-current" />
            <span className="mt-0.5 block h-1 w-1 rounded-full bg-current" />
            <span className="mt-0.5 block h-1 w-1 rounded-full bg-current" />
          </button>
        </div>

        <h3 className="line-clamp-2 min-h-14 text-xl font-bold leading-tight text-[#11284d]">
          {epic.title || "Untitled Epic"}
        </h3>

        <div className="mt-4 flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
            {initialsFromDisplayName(assigneeName)}
          </span>
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Assignee</p>
            <p className="truncate text-sm font-semibold text-[#11284d]">{assigneeName}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        <p className="truncate">Created by: {creatorName}</p>
        <p className="inline-flex shrink-0 items-center gap-1">
          <CalendarDays className="size-3.5" />
          {formatEpicDate(epic.created_at)}
        </p>
      </div>
    </article>
  );
}
