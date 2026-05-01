export default function ProfileEditLoading() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        {/* Input skeleton 1 */}
        <div className="space-y-1">
          <div className="h-2 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-10 w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>

        {/* Input skeleton 2 */}
        <div className="space-y-1">
          <div className="h-2 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-10 w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>

        {/* Textarea skeleton */}
        <div className="space-y-1">
          <div className="h-2 w-10 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-24 w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>

        {/* Button skeleton */}
        <div className="h-10 w-28 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
    </div>
  );
}
