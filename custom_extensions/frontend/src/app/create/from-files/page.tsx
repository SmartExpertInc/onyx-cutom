"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateFromFilesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to the specific files page
    router.replace("/create/from-files/specific");
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
} 