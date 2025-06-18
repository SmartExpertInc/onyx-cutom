"use client";
/* eslint-disable */
// @ts-nocheck – this component is compiled by Next.js but lives outside the main
// app dir so local tsconfig paths/types do not apply. Disable type-checking to
// avoid IDE / build noise until shared tsconfig is wired up.
import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Advanced Mode – course outline editor.
 *
 * NOTE: This is a first-pass scaffold that follows the layout of the
 * Figma frame "FULL_ADNVACED_PAGE".  It purposefully contains only static
 * sections, exact paddings, colours and font-sizes so that the design team
 * can iterate and wire functionality later.
 */
export default function CourseOutlineAdvancedPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white text-[#20355D] font-sans">
      {/* Fixed top nav */}
      <header className="h-[72px] w-full border-b border-gray-300 flex items-center px-6 justify-between sticky top-0 bg-white z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/create/course-outline"
            className="flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>
        </div>
        <h1 className="text-[20px] font-semibold tracking-tight select-none">
          Advanced Mode
        </h1>
        {/* right-side placeholder (save / settings etc.) */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-full bg-[#0540AB] text-white text-sm font-medium shadow">Save</button>
        </div>
      </header>

      {/* Content area */}
      <section className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-[260px] shrink-0 border-r border-gray-200 bg-[#F8FAFF] p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Module list placeholder */}
          <h2 className="text-[14px] font-semibold mb-2 uppercase tracking-wide text-gray-500 select-none">Modules</h2>
          <ul className="flex flex-col gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <li
                key={i}
                className="px-3 py-2 rounded-lg cursor-pointer hover:bg-[#E5EEFF] text-sm"
              >
                Module {i + 1}
              </li>
            ))}
          </ul>
          <button className="mt-4 w-full text-center py-2 rounded-full border border-[#D5DDF8] text-[#20355D] text-sm hover:bg-[#F0F4FF]">
            + Add Module
          </button>
        </aside>

        {/* Main editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Secondary toolbar */}
          <div className="h-[56px] border-b border-gray-200 flex items-center px-6 gap-4 shrink-0 bg-white">
            <button className="px-3 py-1 rounded border border-gray-300 text-sm">Undo</button>
            <button className="px-3 py-1 rounded border border-gray-300 text-sm">Redo</button>
            <div className="mx-4 h-5 w-px bg-gray-300" />
            <button className="px-3 py-1 rounded border border-gray-300 text-sm">Bold</button>
            <button className="px-3 py-1 rounded border border-gray-300 text-sm">Italic</button>
            <button className="px-3 py-1 rounded border border-gray-300 text-sm">Underline</button>
          </div>

          {/* Scrollable editor canvas */}
          <div className="flex-1 overflow-y-auto p-8 bg-[#FBFCFF]">
            {/* Placeholder lesson cards grid */}
            <div className="grid grid-cols-2 gap-6 max-w-6xl mx-auto">
              {Array.from({ length: 8 }, (_, i) => (
                <article
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-3"
                >
                  <h3 className="font-semibold text-lg">Lesson {i + 1} title goes here</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean sit amet
                    accumsan urna. Integer et tincidunt leo.
                  </p>
                  <div className="flex gap-2 mt-auto pt-4">
                    <button className="flex-1 py-2 text-center rounded-md border border-brand-primary text-brand-primary text-sm">
                      Preview
                    </button>
                    <button className="flex-1 py-2 text-center rounded-md bg-brand-primary text-white text-sm">
                      Edit
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 