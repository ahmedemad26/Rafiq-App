import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
    
export function MembersLoadingState() {
    return (
        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-[0_4px_24px_rgba(15,23,42,0.06)] sm:px-6">
            <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.4fr] gap-4 border-b border-slate-200 pb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                <span>Member</span>
                <span>Role</span>
                <span>Joined at</span>
                <span className="text-right">Actions</span>
            </div>
            <div className="space-y-4 py-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.4fr] items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-8 rounded-full bg-[#E8EEF8]" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32 bg-[#E8EEF8]" />
                                <Skeleton className="h-3 w-40 bg-[#E8EEF8]" />
                            </div>
                        </div>
                        <Skeleton className="h-7 w-16 rounded-full bg-[#E8EEF8]" />
                        <Skeleton className="h-4 w-24 bg-[#E8EEF8]" />
                        <div className="flex justify-end">
                            <Skeleton className="h-7 w-7 rounded-md bg-[#E8EEF8]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );  
}

export function MembersErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white px-6 text-center shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-500">
                <span className="text-lg" aria-hidden>
                    !
                </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#11284d]">Something went wrong</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
                Failed to load project members. Please try again.
            </p>
            <Button
                type="button"
                variant="brand"
                size="default"
                onClick={onRetry}
                className="mt-6 h-10 rounded-md bg-[#003380]! px-5 text-sm font-semibold text-white hover:bg-[#002d6e]! hover:opacity-100!"
            >
                Retry Connection
            </Button>
        </div>
    );
}
