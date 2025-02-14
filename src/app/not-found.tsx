"use client";

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-lg mt-2">The page you are looking for does not exist.</p>
      <Link href="/" className="mt-4 px-4 py-2 bg-blue-500 rounded-lg">
        Go Back Home
      </Link>
    </div>
  );
}
