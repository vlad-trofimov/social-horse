'use client';

export default function FeedError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
      <span className="text-3xl mb-3" aria-hidden="true">⚠️</span>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {error.message || 'Something went wrong.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 mt-4 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:opacity-80 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
