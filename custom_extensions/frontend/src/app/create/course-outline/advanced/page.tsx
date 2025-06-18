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
          {/* Text content card – pixel-match */}
          <div className="bg-white rounded-[12px] border border-[#CED9FF] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col">
            {/* Accordion header */}
            <button className="flex items-center justify-between px-[20px] py-[14px] select-none">
              <span className="text-[#20355D] text-[18px] font-medium">Текстовий вміст</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            <div className="border-t border-[#E7ECFF] px-[20px] pb-[24px] flex flex-col gap-[20px]">
              {/* Text actions */}
              <div className="flex gap-[4px] mt-[12px]">
                {[
                  { label: 'Згенерувати', color: 'bg-[#2A4FFF]', icon: 'sparkles' },
                  { label: 'Конденсуйте', color: 'bg-[#F3F6FF]', icon: 'filter' },
                  { label: 'Заповідник', color: 'bg-[#F3F6FF]', icon: 'lock' },
                ].map((b, idx) => (
                  <button
                    key={idx}
                    className={`h-[36px] px-[14px] flex items-center gap-[6px] rounded-[6px] text-[13px] font-medium ${b.color} ${idx===0?'text-white':'text-[#20355D]'}`}
                  >
                    {/* simple inline icon placeholder */}
                    <span className="w-[14px] h-[14px] inline-block bg-current opacity-70" />
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Text length */}
              <div className="flex flex-col gap-[8px]">
                <span className="text-[13px] text-[#20355D]">Кількість тексту на картці</span>
                <div className="flex gap-[4px]">
                  {[
                    { label: 'КороТКО', icon: '=' },
                    { label: 'Середній', icon: 'filter' },
                    { label: 'Детально', icon: 'align' },
                  ].map((o, idx) => (
                    <button
                      key={idx}
                      className={`h-[36px] px-[14px] flex items-center gap-[6px] rounded-[6px] text-[13px] font-medium ${idx===2?'bg-[#2A4FFF] text-white':'bg-[#F3F6FF] text-[#20355D]'}`}
                    >
                      <span className="w-[14px] h-[14px] inline-block bg-current opacity-70" />
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt textarea */}
              <div className="flex flex-col gap-[4px]">
                <span className="text-[13px] text-[#20355D]">Пишіть для…</span>
                <textarea className="h-[80px] rounded-[6px] border border-[#CED9FF] bg-white px-[10px] py-[8px] text-[13px] resize-none" />
              </div>

              {/* Audience chips */}
              <div className="flex flex-wrap gap-[6px]">
                {['Бізнес','Старшокласники','Студенти коледжу','Креатив','Технічні ентузіасти'].map(t=>(
                  <span key={t} className="px-[10px] py-[4px] bg-[#E5D9FF] text-[#7039FF] text-[11px] rounded-full select-none whitespace-nowrap">{t}</span>
                ))}
              </div>

              {/* Tone*/}
              <div className="flex flex-col gap-[4px]">
                <span className="text-[13px] text-[#20355D]">Тон</span>
                <textarea className="h-[60px] rounded-[6px] border border-[#CED9FF] bg-white px-[10px] py-[8px] text-[13px] resize-none" />
              </div>

              {/* Tone chips */}
              <div className="flex flex-wrap gap-[6px]">
                {['Професіонал','Розмовна','Технічний','Академічний','Надихаюче.','Жартівливо.'].map(t=>(
                  <span key={t} className="px-[10px] py-[4px] bg-[#E5D9FF] text-[#7039FF] text-[11px] rounded-full select-none whitespace-nowrap">{t}</span>
                ))}
              </div>

              {/* Output language */}
              <div className="flex flex-col gap-[6px]">
                <span className="text-[13px] text-[#20355D]">Мова виводу</span>
                <select className="h-[36px] rounded-[6px] border border-[#CED9FF] px-[10px] bg-white text-[13px] text-[#20355D]">
                  <option>Українська</option>
                </select>
              </div>
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