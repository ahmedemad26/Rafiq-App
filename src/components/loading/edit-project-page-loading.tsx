import type { ReactNode } from "react";

type EditProjectPageSkeletonProps = {
  breadcrumb: ReactNode;
};

export function EditProjectPageSkeleton({ breadcrumb }: EditProjectPageSkeletonProps) {
  return (
    <section className="-mx-6 -mt-6 flex min-h-[calc(100svh-8rem)] flex-col overflow-x-hidden bg-[#F4F7FA] px-6 pb-16 pt-0">
      <div className="flex w-full flex-1 flex-col">
        <div className="mt-2 w-full shrink-0 sm:mt-3">
          {breadcrumb}
          <div className="mb-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="h-9 max-w-[min(100%,20rem)] flex-1 animate-pulse rounded-md bg-slate-200/80 sm:h-10 sm:max-w-none" />
            <div className="h-9 w-full max-w-36 shrink-0 animate-pulse rounded-md bg-slate-200/80 sm:w-36" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl flex-1">
          <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
            <div className="px-6 pb-1 pt-6 sm:px-8 sm:pt-7">
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-[#DCE8FF]" />
                <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                  <div className="h-5 w-[60%] max-w-56 animate-pulse rounded bg-slate-200/80" />
                  <div className="h-4 w-full max-w-[22rem] animate-pulse rounded bg-slate-200/60" />
                </div>
              </div>
              <div className="my-5 h-px bg-slate-200/80" />
              <div className="space-y-4 pb-5 sm:space-y-5 sm:pb-6">
                <div className="h-10 w-full animate-pulse rounded-lg bg-[#EEF2FF]" />
                <div className="h-[88px] w-full animate-pulse rounded-lg bg-[#EEF2FF] sm:h-[96px]" />
              </div>
            </div>
            <div className="flex gap-3 rounded-b-2xl bg-[#E8EEF8] px-6 py-2.5 sm:px-8">
              <div className="mt-0.5 size-4 shrink-0 animate-pulse rounded bg-slate-300/60" />
              <div className="h-10 flex-1 animate-pulse rounded bg-slate-200/50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
