"use client";
/* eslint-disable */
// @ts-nocheck – lives outside main app dir, disable type-check for now until shared tsconfig is wired.
// This page is a static, pixel-perfect replica of the Figma frame "FULL_ADNVACED_PAGE".
// Functionality wires will be added later – for now we only mirror layout & visual styling.

import React from "react";
import Link from "next/link";

export default function CourseOutlineAdvancedPage() {
  return (
    <main
      className="min-h-screen w-full flex flex-col items-center bg-[linear-gradient(180deg,_#FFFFFF_0%,_#CBDAFB_35%,_#AEE5FA_70%,_#FFFFFF_100%)]"
    >
      {/* Fixed header */}
      <header className="w-full max-w-[1280px] flex items-center justify-between px-[24px] pt-[24px]">
        <Link
          href="/create/course-outline"
          className="text-[#396EDF] text-[14px] font-medium flex items-center gap-[4px] hover:opacity-80"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </Link>
        <h1 className="text-[20px] leading-[24px] font-semibold text-[#20355D]">Advanced&nbsp;Mode</h1>
        {/* placeholder for right-aligned actions */}
        <div className="w-[48px]" />
      </header>

      {/* Content wrapper */}
      <section className="w-full max-w-[1280px] flex flex-row gap-[24px] px-[24px] pt-[32px] pb-[48px]">
        {/* LEFT SIDEBAR – controls */}
        <aside className="w-[300px] shrink-0 flex flex-col gap-[24px]">
          {/* Text content card */}
          <div className="bg-white rounded-[12px] border border-[#D9E1FF] p-[20px] flex flex-col gap-[16px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <h2 className="text-[#20355D] text-[14px] font-medium tracking-[0.2px]">Текстовий&nbsp;вміст</h2>
            {/* Placeholder rectangles mimicking inputs */}
            <div className="flex flex-col gap-[8px]">
              <div className="h-[32px] rounded-[6px] bg-[#F3F6FF]" />
              <div className="h-[32px] rounded-[6px] bg-[#F3F6FF]" />
              <div className="h-[120px] rounded-[6px] bg-[#F3F6FF]" />
            </div>
            {/* Chips */}
            <div className="flex flex-wrap gap-[6px]">
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className="px-[8px] py-[4px] bg-[#E5EEFF] text-[#20355D] text-[10px] leading-[12px] rounded-full select-none"
                >
                  Tag
                </span>
              ))}
            </div>
          </div>
          {/* Re-use card blocks to match the rest of sidebar – skeleton only */}
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-[12px] border border-[#D9E1FF] h-[160px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]" />
          ))}
        </aside>

        {/* CENTER – editable document */}
        <div className="flex-1 bg-white rounded-[12px] border border-[#D9E1FF] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-[40px] overflow-auto min-h-[640px]">
          <h2 className="text-[20px] font-semibold text-[#20355D] mb-[16px]">Загальна технічна перевірка сайту</h2>
          <ul className="list-disc pl-[20px] text-[#20355D] text-[14px] leading-[22px] space-y-[4px]">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i}>Bullet&nbsp;item&nbsp;{i + 1}</li>
            ))}
          </ul>
        </div>

        {/* RIGHT SIDEBAR – instructions & tips */}
        <aside className="w-[260px] shrink-0 flex flex-col gap-[24px]">
          <div className="bg-white rounded-[12px] border border-[#D9E1FF] p-[16px] shadow">
            <h3 className="text-[14px] font-medium text-[#20355D] mb-[8px]">Додаткові&nbsp;інструкції</h3>
            <div className="h-[240px] bg-[#F9FAFF] rounded-[6px]" />
          </div>
          <div className="bg-white rounded-[12px] border border-[#D9E1FF] p-[16px] shadow">
            <h3 className="text-[14px] font-medium text-[#20355D] mb-[8px]">Поради</h3>
            <div className="h-[120px] bg-[#F9FAFF] rounded-[6px]" />
          </div>
        </aside>
      </section>

      {/* Footer banner */}
      <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-[#D9E1FF] h-[56px] flex items-center justify-center text-[12px] text-[#20355D]">
        ⓘ У&nbsp;тебе&nbsp;майже&nbsp;закінчилися&nbsp;кредити. Перейдіть на&nbsp;один з&nbsp;наших планів!
      </footer>
    </main>
  );
} 