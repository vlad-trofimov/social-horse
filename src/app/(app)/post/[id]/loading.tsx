function SkeletonPostCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      {/* Header row */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-2 w-16 rounded mt-1 bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
      {/* Content */}
      <div className="h-3 w-full rounded-xl mt-4 bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div className="h-3 w-3/4 rounded-xl mt-2 bg-gray-100 dark:bg-gray-800 animate-pulse" />
      {/* Footer */}
      <div className="h-3 w-32 rounded-xl mt-4 bg-gray-100 dark:bg-gray-800 animate-pulse" />
    </div>
  );
}

function SkeletonCommentRow() {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
      <div className="flex flex-col gap-1 flex-1">
        <div className="h-2 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-2 w-40 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
    </div>
  );
}

export default function PostLoading() {
  return (
    <div className="space-y-4">
      {/* Post skeleton */}
      <SkeletonPostCard />

      {/* Comments section skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse mb-3" />
        <SkeletonCommentRow />
        <SkeletonCommentRow />
      </div>
    </div>
  );
}
