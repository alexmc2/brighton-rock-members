import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-7xl font-bold text-slate-800 dark:text-slate-100">404</h1>
          <div className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Oops! This page doesn't exist.
          </div>
        </div>
        <div className="mb-8">
          <Link
            href="/"
            className="btn bg-coop-600 hover:bg-coop-700 text-white"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}