function SkeletonResultRow() {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
      <div className="flex flex-col gap-1 flex-1">
        <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-2 w-40 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
    </div>
  );
}

export default function SearchLoading() {
  return (
    <div className="space-y-4">
      {/* Search bar skeleton */}
      <div className="h-10 w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />

      {/* Results skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-4 py-2 divide-y divide-gray-100 dark:divide-gray-800">
        <SkeletonResultRow />
        <SkeletonResultRow />
        <SkeletonResultRow />
        <SkeletonResultRow />
      </div>
    </div>
  );
}
