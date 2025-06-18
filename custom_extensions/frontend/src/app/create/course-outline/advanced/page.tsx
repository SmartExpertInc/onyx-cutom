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
              <span className="text-[#20355D] text-[18px] font-medium">Text content</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            <div className="border-t border-[#E7ECFF] px-[20px] pb-[24px] flex flex-col gap-[20px]">
              {/* Text actions */}
              <div className="flex gap-[4px] mt-[12px]">
                {[
                  { label: 'Generate', color: 'bg-[#2A4FFF]', icon: 'sparkles' },
                  { label: 'Condense', color: 'bg-[#F3F6FF]', icon: 'filter' },
                  { label: 'Reserve', color: 'bg-[#F3F6FF]', icon: 'lock' },
                ].map((b, idx) => (
                  <button
                    key={idx}
                    className={`h-[36px] px-[12px] flex-1 flex items-center justify-center gap-[6px] rounded-[6px] text-[13px] font-medium ${b.color} ${idx===0?'text-white':'text-[#20355D]'}`}
                  >
                    {/* simple inline icon placeholder */}
                    <span className="w-[14px] h-[14px] inline-block bg-current opacity-70" />
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Text length */}
              <div className="flex flex-col gap-[8px]">
                <span className="text-[13px] text-[#20355D]">Amount of text per card</span>
                <div className="flex gap-[4px]">
                  {[
                    { label: 'Short', icon: '=' },
                    { label: 'Medium', icon: 'filter' },
                    { label: 'Detailed', icon: 'align' },
                  ].map((o, idx) => (
                    <button
                      key={idx}
                      className={`h-[36px] px-[12px] flex-1 flex items-center justify-center gap-[6px] rounded-[6px] text-[13px] font-medium ${idx===2?'bg-[#2A4FFF] text-white':'bg-[#F3F6FF] text-[#20355D]'}`}
                    >
                      <span className="w-[14px] h-[14px] inline-block bg-current opacity-70" />
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt textarea */}
              <div className="flex flex-col gap-[4px]">
                <span className="text-[13px] text-[#20355D]">Write for…</span>
                <textarea className="h-[80px] rounded-[6px] border border-[#CED9FF] bg-white px-[10px] py-[8px] text-[13px] resize-none" />
              </div>

              {/* Audience chips */}
              <div className="flex flex-wrap gap-[6px]">
                {['Business','High school students','College students','Creatives','Tech enthusiasts'].map(t=>(
                  <span key={t} className="px-[10px] py-[4px] bg-[#E5D9FF] text-[#7039FF] text-[11px] rounded-full select-none whitespace-nowrap">{t}</span>
                ))}
              </div>

              {/* Tone*/}
              <div className="flex flex-col gap-[4px]">
                <span className="text-[13px] text-[#20355D]">Tone</span>
                <textarea className="h-[60px] rounded-[6px] border border-[#CED9FF] bg-white px-[10px] py-[8px] text-[13px] resize-none" />
              </div>

              {/* Tone chips */}
              <div className="flex flex-wrap gap-[6px]">
                {['Professional','Conversational','Technical','Academic','Inspirational','Humorous'].map(t=>(
                  <span key={t} className="px-[10px] py-[4px] bg-[#E5D9FF] text-[#7039FF] text-[11px] rounded-full select-none whitespace-nowrap">{t}</span>
                ))}
              </div>

              {/* Output language */}
              <div className="flex flex-col gap-[6px]">
                <span className="text-[13px] text-[#20355D]">Output language</span>
                <select className="h-[36px] rounded-[6px] border border-[#CED9FF] px-[10px] bg-white text-[13px] text-[#20355D]">
                  <option>English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="bg-white rounded-[12px] border border-[#CED9FF] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col">
            {/* Accordion header */}
            <button className="flex items-center justify-between w-full px-[20px] py-[14px] select-none">
              <div className="flex items-center gap-[8px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 3H3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H21C22.1046 21 23 20.1046 23 19V5C23 3.89543 22.1046 3 21 3ZM3 19V5H21V19H3Z" fill="#20355D"/><path d="M8 9C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11C8.55228 11 9 10.5523 9 10C9 9.44772 8.55228 9 8 9Z" fill="#20355D"/><path d="M11 16L7 12L4 15V18H20V12L16 8L11 16Z" fill="#20355D"/></svg>
                <span className="text-[#20355D] text-[18px] font-medium">Image</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 9L12 15L6 9"/></svg>
            </button>
            <div className="border-t border-[#E7ECFF] px-[20px] pb-[24px] flex flex-col gap-[20px] pt-[12px]">
              {/* Image source */}
              <div className="flex flex-col gap-[6px]">
                <span className="text-[13px] text-[#20355D] font-medium">Image source</span>
                <button className="h-[36px] w-full rounded-[6px] border border-[#CED9FF] px-[12px] bg-white text-[13px] text-[#20355D] flex items-center justify-between">
                  <div className="flex items-center gap-[8px]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.09 8.26L20.5 9.17L15.68 13.34L17.18 19.82L12 16.77L6.82 19.82L8.32 13.34L3.5 9.17L9.91 8.26L12 2Z" fill="#2A4FFF"/></svg>
                    <span>AI-generated image</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9L12 15L18 9"/></svg>
                </button>
              </div>
              {/* Image style */}
              <div className="flex flex-col gap-[6px]">
                <span className="text-[13px] text-[#20355D] font-medium">Image style</span>
                <textarea placeholder="Optional: describe colors, style, or mood to use" className="h-[80px] w-full rounded-[6px] border border-[#CED9FF] bg-white px-[12px] py-[8px] text-[13px] resize-none placeholder:text-[#818E9F]" />
              </div>
              {/* AI image model */}
              <div className="flex flex-col gap-[6px]">
                <span className="text-[13px] text-[#20355D] font-medium">AI Image Model</span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-[12px] pointer-events-none">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L1 21H23L12 2Z" fill="#20355D"/></svg>
                  </div>
                  <select className="h-[36px] w-full appearance-none rounded-[6px] border border-[#CED9FF] pl-[36px] pr-[36px] bg-white text-[13px] text-[#20355D]">
                      <option>Flux Kontext Fast</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-[12px] pointer-events-none">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9L12 15L18 9"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Format Section */}
          <div className="bg-white rounded-[12px] border border-[#CED9FF] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col">
            {/* Accordion header */}
            <button className="flex items-center justify-between w-full px-[20px] py-[14px] select-none">
              <div className="flex items-center gap-[8px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#20355D"><path d="M10 4H4v6h6V4zm-2 4H6V6h2v2zm8-4h-6v6h6V4zm-2 4h-2V6h2v2zM8 12H4v6h6v-6zm-2 4H6v-2h2v2zm8-4h-6v6h6v-6zm-2 4h-2v-2h2v2z"/></svg>
                <span className="text-[#20355D] text-[18px] font-medium">Format</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 9L12 15L6 9"/></svg>
            </button>
            <div className="border-t border-[#E7ECFF] px-[20px] pb-[24px] flex flex-col gap-[12px] pt-[12px]">
              {/* Grid */}
              <div className="grid grid-cols-2 gap-[8px]">
                {/* Presentation - selected */}
                <button className="relative rounded-[6px] border-2 border-[#2A4FFF] bg-[#F0F4FF] p-[12px] flex flex-col items-center justify-center gap-[8px] h-[90px] text-center">
                  <div className="absolute top-[8px] left-[8px]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" fill="#2A4FFF" stroke="white" strokeWidth="1"/><path d="m5 8 2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <svg width="32" height="32" viewBox="0 0 24 24"><path d="M4 3h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm0 2v8h16V5H4zm8 10l-4 4h8l-4-4z" fill="#2A4FFF"/></svg>
                  <span className="text-[13px] font-medium text-[#20355D]">Presentation</span>
                </button>
                {/* Web page */}
                <button className="relative rounded-[6px] border border-[#D9E1FF] bg-white p-[12px] flex flex-col items-center justify-center gap-[8px] h-[90px] text-center">
                  <div className="absolute top-[8px] left-[8px]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" fill="white" stroke="#D9E1FF" strokeWidth="1"/></svg>
                  </div>
                  <svg width="32" height="32" viewBox="0 0 24 24"><path d="M20 4H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1zM5 19V7h14v12H5zm0-14h14v1H5V5z" fill="#A5B4FF"/></svg>
                  <span className="text-[13px] font-medium text-[#20355D]">Web page</span>
                </button>
                {/* Document */}
                <button className="relative rounded-[6px] border border-[#D9E1FF] bg-white p-[12px] flex flex-col items-center justify-center gap-[8px] h-[90px] text-center">
                   <div className="absolute top-[8px] left-[8px]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" fill="white" stroke="#D9E1FF" strokeWidth="1"/></svg>
                  </div>
                  <svg width="32" height="32" viewBox="0 0 24 24"><path d="M6 2h10l4 4v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 2v4h8V4H7z" fill="#A5B4FF"/></svg>
                  <span className="text-[13px] font-medium text-[#20355D]">Document</span>
                </button>
                {/* Social */}
                <button className="relative rounded-[6px] border border-[#D9E1FF] bg-white p-[12px] flex flex-col items-center justify-center gap-[8px] h-[90px] text-center">
                   <div className="absolute top-[8px] left-[8px]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" fill="white" stroke="#D9E1FF" strokeWidth="1"/></svg>
                  </div>
                  <svg width="32" height="32" viewBox="0 0 24 24"><path d="M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 2v14h8V4H8zm3 15a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="#A5B4FF"/></svg>
                  <span className="text-[13px] font-medium text-[#20355D]">Social</span>
                </button>
              </div>
              {/* Default settings dropdown */}
              <select className="h-[36px] rounded-[6px] border border-[#CED9FF] px-[12px] bg-white text-[13px] text-[#20355D]">
                  <option>Default</option>
              </select>
            </div>
          </div>
        </aside>

        {/* CENTER – editable document */}
        <div className="flex-1 bg-white rounded-[12px] border border-[#D9E1FF] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-[40px] overflow-auto min-h-[640px]">
          <h2 className="text-[20px] font-semibold text-[#20355D] mb-[16px]">General technical site audit</h2>
          <ul className="list-disc pl-[20px] text-[#20355D] text-[14px] leading-[22px] space-y-[4px]">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i}>Bullet&nbsp;item&nbsp;{i + 1}</li>
            ))}
          </ul>
        </div>

        {/* RIGHT SIDEBAR – instructions & tips */}
        <aside className="w-[260px] shrink-0 flex flex-col gap-[24px]">
          <div className="bg-white rounded-[12px] border border-[#D9E1FF] p-[16px] shadow">
            <h3 className="text-[14px] font-medium text-[#20355D] mb-[8px]">Additional&nbsp;instructions</h3>
            <div className="h-[240px] bg-[#F9FAFF] rounded-[6px]" />
          </div>
          <div className="bg-white rounded-[12px] border border-[#D9E1FF] p-[16px] shadow">
            <h3 className="text-[14px] font-medium text-[#20355D] mb-[8px]">Tips</h3>
            <div className="h-[120px] bg-[#F9FAFF] rounded-[6px]" />
          </div>
        </aside>
      </section>

      {/* Footer banner */}
      <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-[#D9E1FF] h-[56px] flex items-center justify-center text-[12px] text-[#20355D]">
        ⓘ You are almost out of credits. Upgrade to one of our plans!
      </footer>
    </main>
  );
} 