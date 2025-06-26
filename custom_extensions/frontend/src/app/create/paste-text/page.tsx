"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home as HomeIcon, ChevronRight, FileText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PasteTextPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"context" | "base" | null>(null);

  const handleContinue = () => {
    if (!text.trim() || !mode) return;

    const params = new URLSearchParams();
    params.set('fromText', 'true');
    params.set('textMode', mode);
    params.set('userText', text.trim());
    
    router.push(`/create/generate?${params.toString()}`);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center pt-24 pb-20 px-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)",
      }}
    >
      {/* Top-left home button */}
      <Link
        href="/projects"
        className="fixed top-4 left-4 flex items-center gap-1 text-sm font-medium bg-white/70 hover:bg-white text-gray-900 backdrop-blur rounded-full px-3 py-1 shadow border border-gray-200"
      >
        <HomeIcon size={14} className="-ml-0.5" />
        Home
      </Link>

      {/* Breadcrumb Navigation */}
      <nav className="fixed top-16 left-6 flex items-center text-sm text-gray-600">
        <Link
          href="/projects"
          className="flex items-center hover:text-gray-900 transition-colors"
        >
          <HomeIcon className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
        <Link
          href="/create"
          className="hover:text-gray-900 transition-colors"
        >
          Create
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
        <span className="text-gray-900 font-medium">Paste Text</span>
      </nav>

      {/* Back button */}
      <Link
        href="/create"
        className="self-start flex items-center gap-2 text-brand-primary hover:text-brand-primary-hover transition-colors text-sm font-medium mb-6"
      >
        <ArrowLeft size={16} />
        Back to Create
      </Link>

      {/* Main content */}
      <div className="w-full max-w-4xl flex flex-col gap-8 items-center">
        {/* Headings */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Paste Your Text</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Enter or paste your text content below and choose how you'd like to use it
          </p>
        </div>

        {/* Text input area */}
        <div className="w-full">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text, notes, outline, or any content you'd like to work with..."
            className="w-full h-96 p-6 rounded-xl border border-gray-300 bg-white shadow-sm text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-base leading-relaxed"
          />
          <div className="mt-2 text-sm text-gray-500 text-right">
            {text.length} characters
          </div>
        </div>

        {/* Mode selection */}
        <div className="w-full max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            How would you like to use this text?
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Use as context option */}
            <button
              onClick={() => setMode("context")}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                mode === "context"
                  ? "border-brand-primary bg-brand-primary/5 shadow-lg"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  mode === "context" ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Use as Context</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    The AI will use your text as reference material and context to create new educational content. 
                    Best for notes, research, or background information.
                  </p>
                </div>
              </div>
            </button>

            {/* Use as base option */}
            <button
              onClick={() => setMode("base")}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                mode === "base"
                  ? "border-brand-primary bg-brand-primary/5 shadow-lg"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  mode === "base" ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Use as Base</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    The AI will enhance and format your existing text structure, preserving your content while 
                    making it into a proper educational product. Best for drafts or existing outlines.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!text.trim() || !mode}
          className="px-8 py-3 bg-brand-primary text-white rounded-xl font-semibold text-lg hover:bg-brand-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Continue to Generate
        </button>
      </div>
    </main>
  );
} 