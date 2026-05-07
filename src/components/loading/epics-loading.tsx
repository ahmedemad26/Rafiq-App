import { Skeleton } from "../ui/skeleton";

export function EpicsLoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)]"
          >
            <Skeleton className="h-6 w-16 bg-[#E8EEF8]" />
            <Skeleton className="mt-4 h-7 w-4/5 bg-[#E8EEF8]" />
            <Skeleton className="mt-2 h-7 w-3/5 bg-[#E8EEF8]" />
            <div className="mt-5 flex items-center gap-3">
              <Skeleton className="size-10 rounded-full bg-[#E8EEF8]" />
              <div className="w-full space-y-2">
                <Skeleton className="h-3 w-20 bg-[#E8EEF8]" />
                <Skeleton className="h-4 w-36 bg-[#E8EEF8]" />
              </div>
            </div>
            <Skeleton className="mt-5 h-px w-full bg-[#E8EEF8]" />
            <div className="mt-3 flex justify-between">
              <Skeleton className="h-3.5 w-24 bg-[#E8EEF8]" />
              <Skeleton className="h-3.5 w-20 bg-[#E8EEF8]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
