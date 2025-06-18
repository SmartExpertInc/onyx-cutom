"use client";
/* eslint-disable */
// @ts-nocheck – lives outside main app dir, ignore type noise.

import React from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";

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
    <main
      className="min-h-screen flex flex-col items-stretch font-sans"
      /* White → pastel-blue gradient identical to generator */
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #E6F3FF 25%, #B6DEFF 65%, #9DD3FF 100%)",
      }}
    >
      {/* ---------------------------------------------------------------- */}
      {/* Top Navigation Bar                                             */}
      {/* ---------------------------------------------------------------- */}
      <header className="h-[50px] flex items-center justify-between px-6 border-b border-gray-300 bg-transparent select-none">
        <Link
          href="/create/course-outline"
          className="flex items-center gap-1 text-[13px] text-[#396EDF] hover:opacity-80"
        >
          <ArrowLeft size={16} />
          Назад
        </Link>

        <h1 className="text-[18px] font-semibold text-[#20355D]">Оперативний редактор</h1>

        {/* Empty spacer to keep title centered */}
        <span className="w-[60px]" />
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Three-column main workspace                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="flex flex-1 w-full max-w-[1440px] mx-auto pt-4 px-5 gap-4">
        {/* ---------------- Left Settings Sidebar ---------------- */}
        <aside className="w-[280px] shrink-0 bg-white/90 rounded-md border border-gray-300 p-4 flex flex-col gap-4 overflow-y-auto">
          <h2 className="text-[14px] font-semibold text-[#20355D] mb-1">Налаштування</h2>

          {/* TEXT CONTENT CARD ---------------------------------- */}
          <div className="border border-gray-200 rounded-md px-3 py-3 flex flex-col gap-3">
            <h3 className="text-[14px] font-semibold">Текстовий вміст</h3>

            {/* toggle chips */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 1, label: "Згенерувати" },
                { id: 2, label: "Консультує" },
                { id: 3, label: "Заповніть" },
              ].map((t, idx) => (
                <button
                  key={idx}
                  className="text-[12px] h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#F0F4FF]"
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Radio – chunk length */}
            <p className="text-[12px] font-medium text-gray-700">Кількість тексту на картці</p>
            <div className="flex gap-2">
              {[
                { id: "short", label: "Коротко" },
                { id: "mid", label: "Середній" },
                { id: "long", label: "Детально" },
              ].map((o) => (
                <label
                  key={o.id}
                  className="flex items-center gap-[3px] text-[12px] cursor-pointer"
                >
                  <input type="radio" name="len" className="accent-[#0540AB]" />
                  {o.label}
                </label>
              ))}
            </div>

            {/* Input placeholder */}
            <input
              placeholder="Ліміт для…"
              className="h-8 w-full border border-gray-300 rounded text-[12px] px-2"
            />

            {/* tag pills row */}
            <div className="flex flex-wrap gap-1">
              {["Бізнес", "Старшокласники", "Студент коледжу", "Кар'єра", "Техніки еміграції"].map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-[2px] bg-[#E5EEFF] text-[#20355D] text-[11px] rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Language select */}
            <label className="text-[12px] font-medium mt-1">Мова виводу</label>
            <div className="relative">
              <select className="appearance-none w-full h-8 border border-gray-300 rounded text-[12px] pl-2 pr-6">
                <option>Українська</option>
                <option>English</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600" />
            </div>
          </div>

          {/* IMAGE SETTINGS CARD -------------------------------- */}
          <div className="border border-gray-200 rounded-md px-3 py-3 flex flex-col gap-3">
            <h3 className="text-[14px] font-semibold">Зображення</h3>
            <label className="text-[12px] font-medium">Джерело зображення</label>
            <div className="relative">
              <select className="appearance-none w-full h-8 border border-gray-300 rounded text-[12px] pl-2 pr-6">
                <option>Зображення з штучним інтелектом</option>
                <option>Сток</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600" />
            </div>

            <label className="text-[12px] font-medium">Стиль зображення</label>
            <input className="h-8 w-full border border-gray-300 rounded text-[12px] px-2" />

            <label className="text-[12px] font-medium">Модель зображення ШІ</label>
            <div className="relative">
              <select className="appearance-none w-full h-8 border border-gray-300 rounded text-[12px] pl-2 pr-6">
                <option>Flux Kontext Fast</option>
                <option>Stable Diffusion</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600" />
            </div>
          </div>

          {/* FORMAT CARD */}
          <div className="border border-gray-200 rounded-md px-3 py-3 flex flex-col gap-3">
            <h3 className="text-[14px] font-semibold">Формат</h3>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              {[
                "Презентація",
                "Веб-сторінка",
                "Документ",
                "Соціальний",
              ].map((fmt, i) => (
                <button
                  key={fmt}
                  className={`h-16 border rounded flex flex-col items-center justify-center gap-1 ${
                    i === 0 ? "border-brand-primary text-brand-primary" : "border-gray-300 text-gray-600"
                  }`}
                >
                  <Check className="text-[10px]" />
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ---------------- Center Editor ---------------- */}
        <div className="flex-1 bg-white rounded-md border border-gray-300 flex flex-col overflow-hidden">
          {/* Sub-toolbar inside card */}
          <div className="h-[36px] border-b border-gray-200 flex items-center px-3 gap-3 text-[12px]">
            <button className="h-6 px-2 rounded bg-[#F0F4FF] text-[#0540AB]">Вільна форма</button>
            <button className="h-6 px-2 rounded hover:bg-gray-100">Карта за карткою</button>
            <input
              placeholder="🔍 Пошук"
              className="ml-auto h-6 w-40 text-[12px] border border-gray-300 rounded px-2"
            />
          </div>

          {/* Editable area */}
          <div className="flex-1 overflow-y-auto p-6 text-[14px] leading-[22px]">
            <h2 className="font-semibold text-[18px] mb-1">Загальна технічна перевірка сайту</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Google Search Console:</li>
              <ul className="list-disc pl-6 space-y-1">
                <li>Актуальність додання та перевірено</li>
                <li>Перевірено на критичні помилки індексації</li>
                <li>Немає заблокованих сторінок (розділ Pages)</li>
                <li>Усі основні сторінки індексуються корректно</li>
              </ul>
              <li className="mt-2">Файл robots.txt:</li>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Аналіз за адресою: <a className="text-blue-600 underline">https://example.com/robots.txt</a>
                </li>
                <li>Наявність sitemap у файлі</li>
                <li>Основні сторінки дозволені для індексації</li>
              </ul>
              <li className="mt-2">SSL-сертифікат:</li>
              <ul className="list-disc pl-6 space-y-1">
                <li>На сайті активовано HTTPS (https://)</li>
                <li>Перевірено наявність дійсного SSL-сертифікату</li>
              </ul>
              <li className="mt-2">Користь для SEO:</li>
              <ul className="list-disc pl-6 space-y-1">
                <li>Такі заходи значно зменшують ризик помилок індексації</li>
                <li>Забезпечують краще ранжування та надійність сайту</li>
              </ul>
            </ul>
            <span className="block text-[11px] text-center text-gray-400 mt-8">Кінець</span>
          </div>

          {/* Editor footer char counter */}
          <div className="h-[24px] border-t border-gray-200 flex items-center justify-end px-3 text-[11px] text-gray-500">
            3397/20000
          </div>
        </div>

        {/* ---------------- Right Sidebar ---------------- */}
        <aside className="w-[240px] shrink-0 flex flex-col gap-4">
          {/* Additional instructions card */}
          <div className="bg-[#F8FAFF] border border-gray-300 rounded-md p-3 text-[12px] leading-[18px]">
            <h3 className="font-semibold mb-1">Додаткові інструкції</h3>
            <p>## 1. Загальна технічна перевірка</p>
            <p className="mt-2">• Перевірити через Google Search Console…</p>
          </div>

          {/* Tips card */}
          <div className="bg-[#F8FAFF] border border-gray-300 rounded-md p-3 text-[12px] leading-[18px] flex-1">
            <h3 className="font-semibold mb-1">Поради</h3>
            <p>
              <b>Вільна форма</b> дозволяє маніпулювати або змінювати текст
              так, як вам потрібно…
            </p>
          </div>
        </aside>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Bottom info bar                                                */}
      {/* ---------------------------------------------------------------- */}
      <footer className="flex items-center justify-between w-full max-w-[1440px] mx-auto px-6 py-3 gap-4 text-[12px]">
        {/* Credit warning */}
        <div className="bg-[#FFF5E5] text-[#C47F00] px-4 py-2 rounded-lg flex items-center gap-2">
          <span>У тебе майже закінчилися кредити.</span>
          <button className="text-blue-600 underline text-[11px]">Придбати плани</button>
        </div>

        {/* Continue button */}
        <button className="ml-auto px-10 py-2 rounded-full bg-[#0540AB] text-white text-[14px] font-semibold hover:bg-[#043a99]">
          Продовжуйте
        </button>

        {/* Help icon */}
        <button className="w-7 h-7 rounded-full border border-gray-400 text-gray-800 flex items-center justify-center ml-4 opacity-70">
          ?
        </button>
      </footer>
    </main>
  );
} 