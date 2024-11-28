import Link from 'next/link';

export default function Logo() {
  return (
    <Link className="block" href="/">
      <div className="bg-coop-500 rounded-2xl p-2">
        <svg
          className="w-6 h-6 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L2 9.6V22h20V9.6L12 2zm0 2.8l8 6v9.6H4V10.8l8-6z" />
        </svg>
      </div>
    </Link>
  );
}
