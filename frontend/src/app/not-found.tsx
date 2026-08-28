import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 text-2xl font-bold">
        404
      </div>
      <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">ገጹ አልተገኘም (Page Not Found)</h1>
      <p className="text-gray-500 max-w-md mb-8">
        የፈለጉት ገጽ አልተገኘም ወይም ተንቀሳቅሷል። እባክዎ ወደ ዋናው ገጽ ይመለሱ።
      </p>
      <Link
        href="/"
        className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition"
      >
        ወደ ዋና ገጽ ተመለስ (Back Home)
      </Link>
    </div>
  );
}
