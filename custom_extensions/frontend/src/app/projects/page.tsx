// custom_extensions/frontend/src/app/projects/page.tsx
"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import ProjectsTable from '../../components/ProjectsTable';

export default function ProjectsPage() {
  // Any additional client-side logic for this page can go here in future if needed.

  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-6 flex justify-end flex-wrap gap-4">
          <Link
            href="/create"
            className="text-sm flex items-center px-4 py-2 w-fit bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors"
          >
            + Create New (AI)
          </Link>
        </div>
        <Suspense fallback={<div className="p-8 text-center font-['Inter',_sans-serif]">Loading Projects...</div>}>
            <ProjectsTable />
        </Suspense>
      </div>
    </main>
  );
}
