"use client";

import { useEffect, useRef } from "react";

type TasksInfiniteSentinelProps = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isError?: boolean;
  onLoadMore: () => void;
  onRetry?: () => void;
};

export default function TasksInfiniteSentinel({
  hasNextPage,
  isFetchingNextPage,
  isError,
  onLoadMore,
  onRetry,
}: TasksInfiniteSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          onLoadMore();
        }
      },
      { root: null, rootMargin: "140px", threshold: 0 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (!hasNextPage && !isError) return null;

  return (
    <div ref={ref} className="flex min-h-10 items-center justify-center py-2">
      {isError ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
        >
          Retry
        </button>
      ) : null}
      {isFetchingNextPage ? (
        <span className="text-xs text-slate-500">Loading more...</span>
      ) : (
        <span className="sr-only">Load more tasks</span>
      )}
    </div>
  );
}


