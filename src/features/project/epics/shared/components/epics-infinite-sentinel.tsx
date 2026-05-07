"use client";

import { useEffect, useRef } from "react";

type EpicsInfiniteSentinelProps = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

export default function EpicsInfiniteSentinel({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: EpicsInfiniteSentinelProps) {
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
      { root: null, rootMargin: "120px", threshold: 0 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (!hasNextPage) return null;

  return (
    <div
      ref={ref}
      className="flex min-h-12 w-full items-center justify-center py-6"
      aria-hidden={!isFetchingNextPage}
    >
      {isFetchingNextPage ? (
        <span className="text-xs text-slate-500">Loading more…</span>
      ) : (
        <span className="sr-only">Load more epics</span>
      )}
    </div>
  );
}
