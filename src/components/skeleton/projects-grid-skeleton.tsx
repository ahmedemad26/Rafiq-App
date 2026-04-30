export default function ProjectsGridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(304px,1fr))] gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="w-full max-w-[304px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="h-[140px] w-full animate-pulse bg-slate-200" />

          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />

            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
            </div>

            <div className="mt-4 h-8 w-24 animate-pulse rounded-md bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
