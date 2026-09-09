'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Michu Pharmacy] Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 text-2xl font-bold shadow-sm">
        ⚠️
      </div>

      <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">
        Something went wrong
      </h1>

      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
        An unexpected error occurred. Please try again, or return to the home
        page if the problem persists.
        {error?.digest && (
          <span className="block mt-2 text-xs text-gray-400 font-mono">
            Reference: {error.digest}
          </span>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 duration-150 shadow-md"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all hover:scale-105 active:scale-95 duration-150 shadow-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
