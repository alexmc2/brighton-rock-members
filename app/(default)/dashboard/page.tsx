import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard - Brighton Rock Housing Co-op',
  description: 'Dashboard for Brighton Rock Housing Co-op members',
};

const roles = [
  {
    name: 'Secretary',
    href: '/secretary',
    description: 'Manage meetings, minutes, and communications',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    name: 'Treasury',
    href: '/treasury',
    description: 'Handle co-op finances and budgeting',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    name: 'Rents',
    href: '/rents',
    description: 'Manage rent collection and payments',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    name: 'Garden',
    href: '/garden',
    description: 'Coordinate garden maintenance and projects',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
      </svg>
    ),
  },
  {
    name: 'Development',
    href: '/development',
    description: 'Handle co-op development and outreach',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    name: 'Shop',
    href: '/shop',
    description: 'Manage co-op shop and supplies',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
  },
  {
    name: 'Maintenance',
    href: '/maintenance',
    description: 'Coordinate repairs and maintenance',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
        />
      </svg>
    ),
  },
  {
    name: 'Allocations',
    href: '/allocations',
    description: 'Manage room and space allocations',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
];

const houses = [
  {
    name: '399',
    href: '/houses/399',
    residents: 4,
    status: 'All Good',
    statusColor: 'bg-green-500',
  },
  {
    name: '397',
    href: '/houses/397',
    residents: 4,
    status: 'Maintenance Required',
    statusColor: 'bg-yellow-500',
  },
  {
    name: '395',
    href: '/houses/395',
    residents: 4,
    status: 'All Good',
    statusColor: 'bg-green-500',
  },
];

export default function Dashboard() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-tr  from-violet-500 to-violet-400 dark:from-violet-600 dark:to-violet-500 p-4 sm:p-6 rounded-lg overflow-hidden mb-8">
        {/* Background illustration */}
        <div
          className="absolute right-0 top-0 -mt-4 mr-16 pointer-events-none hidden xl:block"
          aria-hidden="true"
        >
          <svg
            width="319"
            height="198"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <defs>
              <path id="welcome-a" d="M64 0l64 128-64-20-64 20z" />
              <path id="welcome-e" d="M40 0l40 80-40-12.5L0 80z" />
              <path id="welcome-g" d="M40 0l40 80-40-12.5L0 80z" />
              <linearGradient
                x1="50%"
                y1="0%"
                x2="50%"
                y2="100%"
                id="welcome-b"
              >
                <stop stopColor="#FFF" offset="0%" />
                <stop stopColor="#FFF" stopOpacity="0" offset="100%" />
              </linearGradient>
              <linearGradient
                x1="50%"
                y1="24.537%"
                x2="50%"
                y2="100%"
                id="welcome-c"
              >
                <stop stopColor="#FFF" offset="0%" />
                <stop stopColor="#FFF" stopOpacity="0" offset="100%" />
              </linearGradient>
            </defs>
            <g fill="none" fillRule="evenodd">
              <g transform="rotate(64 36.592 105.604)">
                <mask id="welcome-d" fill="#fff">
                  <use xlinkHref="#welcome-a" />
                </mask>
                <use fill="url(#welcome-b)" xlinkHref="#welcome-a" />
                <path
                  fill="url(#welcome-c)"
                  mask="url(#welcome-d)"
                  d="M64-24h80v152H64z"
                />
              </g>
              <g transform="rotate(-51 91.324 -105.372)">
                <mask id="welcome-f" fill="#fff">
                  <use xlinkHref="#welcome-e" />
                </mask>
                <use fill="url(#welcome-b)" xlinkHref="#welcome-e" />
                <path
                  fill="url(#welcome-c)"
                  mask="url(#welcome-f)"
                  d="M40.333-15.147h50v95h-50z"
                />
              </g>
              <g transform="rotate(44 61.546 392.623)">
                <mask id="welcome-h" fill="#fff">
                  <use xlinkHref="#welcome-g" />
                </mask>
                <use fill="url(#welcome-b)" xlinkHref="#welcome-g" />
                <path
                  fill="url(#welcome-c)"
                  mask="url(#welcome-h)"
                  d="M40.333-15.147h50v95h-50z"
                />
              </g>
            </g>
          </svg>
        </div>

        {/* Content */}
        <div className="relative ">
          <h1 className="text-2xl md:text-3xl text-white font-bold mb-1 py-2">
            Welcome to Brighton Rock Housing Co-op. 👋
          </h1>
          <p className="text-white opacity-90">
            Here's what's happening in our co-op today:
          </p>
        </div>
      </div>

      {/* Roles Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Co-op Roles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Link
              key={role.name}
              href={role.href}
              className="group flex flex-col p-6 bg-white dark:bg-gray-800 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.05)] rounded-xl border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-500 transition-all duration-150 hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors duration-150">
                  {role.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {role.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                {role.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Houses Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Houses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {houses.map((house) => (
            <Link
              key={house.name}
              href={house.href}
              className="group p-6 bg-white dark:bg-gray-800 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.05)] rounded-xl border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-500 transition-all duration-150 hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {house.name} Kingsway
                </h3>
                <div
                  className={`w-2 h-2 rounded-full ${house.statusColor}`}
                ></div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{house.residents}</span>{' '}
                  residents
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status: <span className="font-medium">{house.status}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
