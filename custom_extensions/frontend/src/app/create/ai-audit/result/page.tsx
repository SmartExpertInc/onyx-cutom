"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AiAuditResultPage() {
  const [markdown, setMarkdown] = useState("");
  const router = useRouter();

  useEffect(() => {
    const md = localStorage.getItem("aiAuditOnePager") || "";
    setMarkdown(md);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 mt-12">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">AI-Аудит (One-Pager)</h1>
        <div className="prose max-w-none" style={{ whiteSpace: "pre-wrap" }}>{markdown}</div>
        <div className="flex gap-4 mt-8 justify-center">
          <button
            className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
            onClick={() => {
              navigator.clipboard.writeText(markdown);
            }}
          >
            Копировать
          </button>
          <button
            className="px-6 py-2 rounded bg-gray-300 text-black font-semibold hover:bg-gray-400"
            onClick={() => router.push("/create/ai-audit/questionnaire")}
          >
            Назад к анкете
          </button>
        </div>
      </div>
    </main>
  );
} 