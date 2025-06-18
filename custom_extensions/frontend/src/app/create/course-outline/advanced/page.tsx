"use client";
// @ts-nocheck – new standalone page for Advanced Mode. Detailed styling to 1:1 match the provided Figma frame will be applied iteratively.

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdvancedCourseOutlinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-white py-10 px-6 relative">
      {/* Back to generator */}
      <Link
        href="/create/course-outline"
        className="absolute top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white"
      >
        <ArrowLeft size={14} /> Back
      </Link>

      {/* Placeholder – replace with pixel-perfect markup */}
      <div className="w-full max-w-5xl border-dashed border-4 border-gray-300 rounded-lg flex items-center justify-center h-[80vh] text-center">
        <p className="text-gray-500 text-lg">
          Advanced Mode UI goes here – replicate frame
          <br />
          <strong>"Figma design - img_1749843611_f2bbf02509a6446491c9af1c587a539c.png"</strong>
        </p>
      </div>
    </main>
  );
} 