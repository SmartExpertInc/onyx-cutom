"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const documentOptions = [
  "Instructions / SOPs",
  "Checklists",
  "Communication scripts",
  "Technical manuals",
  "Other",
];
const priorityOptions = [
  "Reduce staff turnover",
  "Onboard new employees faster",
  "Scale standards for franchisees",
  "Increase profit through team stability",
  "Other",
];

export default function AiAuditQuestionnaire() {
  const [companyName, setCompanyName] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [employees, setEmployees] = useState("");
  const [franchise, setFranchise] = useState("");
  const [onboardingProblems, setOnboardingProblems] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [documentsOther, setDocumentsOther] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [priorityOther, setPriorityOther] = useState("");
  const [touched, setTouched] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [longLoading, setLongLoading] = useState(false);
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (loading) {
      loadingTimeout.current = setTimeout(() => setLongLoading(true), 60000);
    } else {
      setLongLoading(false);
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    }
    return () => {
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    };
  }, [loading]);

  const handleCheckbox = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    if (arr.includes(value)) {
      setArr(arr.filter(v => v !== value));
    } else {
      setArr([...arr, value]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      companyName: true,
      companyDesc: true,
      companyWebsite: true,
      employees: true,
      franchise: true,
      onboardingProblems: true,
      documents: true,
      priorities: true,
      priorityOther: priorities.includes("Other"),
      documentsOther: documents.includes("Other"),
    });
    if (
      !companyName.trim() ||
      !companyDesc.trim() ||
      !companyWebsite.trim() ||
      !employees ||
      !franchise ||
      !onboardingProblems.trim() ||
      documents.length === 0 ||
      (documents.includes("Other") && !documentsOther.trim()) ||
      priorities.length === 0 ||
      (priorities.includes("Other") && !priorityOther.trim())
    ) return;
    setLoading(true);
    setError("");
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";
      const res = await fetch(`${CUSTOM_BACKEND_URL}/ai-audit/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          companyDesc,
          companyWebsite,
          employees,
          franchise,
          onboardingProblems,
          documents,
          documentsOther,
          priorities,
          priorityOther,
        }),
      });
      if (!res.ok) throw new Error("Ошибка генерации AI-аудита");
      const data = await res.json();
      // Save markdown to localStorage or pass via router (for demo, use localStorage)
      localStorage.setItem("aiAuditOnePager", data.markdown);
      // If folderId is returned, redirect to folder view
      if (data.folderId) {
        router.push(`/projects?folder=${data.folderId}`);
      } else {
        router.push(`/projects/view/${data.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Ошибка генерации AI-аудита");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-0 bg-[#F7F7F7] font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-10 mt-16 border border-gray-100">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-900 tracking-tight">AI Audit Questionnaire</h1>
        <div className="h-1 w-16 bg-blue-200 rounded-full mx-auto mb-8" />
        {submitted ? (
          <div className="text-center text-green-700 text-lg font-semibold py-12">Thank you! Your answers have been submitted.</div>
        ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          <div>
            <label className="block font-medium mb-1 text-black">Company name</label>
            <input
              type="text"
              className={`w-full px-4 py-2 rounded border ${touched.companyName && !companyName.trim() ? 'border-red-400' : 'border-gray-300'} focus:border-blue-400 text-black placeholder-black`}
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              onBlur={() => setTouched((t:any) => ({ ...t, companyName: true }))}
              required
            />
            {touched.companyName && !companyName.trim() && <div className="text-red-500 text-xs mt-1">Required</div>}
          </div>
          <div>
            <label className="block font-medium mb-1 text-black">What does the company do?</label>
            <input
              type="text"
              className={`w-full px-4 py-2 rounded border ${touched.companyDesc && !companyDesc.trim() ? 'border-red-400' : 'border-gray-300'} focus:border-blue-400 text-black placeholder-black`}
              value={companyDesc}
              onChange={e => setCompanyDesc(e.target.value)}
              onBlur={() => setTouched((t:any) => ({ ...t, companyDesc: true }))}
              required
            />
            {touched.companyDesc && !companyDesc.trim() && <div className="text-red-500 text-xs mt-1">Required</div>}
          </div>
          <div>
            <label className="block font-medium mb-1 text-black">Company website</label>
            <input
              type="url"
              className={`w-full px-4 py-2 rounded border ${touched.companyWebsite && !companyWebsite.trim() ? 'border-red-400' : 'border-gray-300'} focus:border-blue-400 text-black placeholder-black`}
              value={companyWebsite}
              onChange={e => setCompanyWebsite(e.target.value)}
              onBlur={() => setTouched((t:any) => ({ ...t, companyWebsite: true }))}
              required
              placeholder="https://example.com"
            />
            {touched.companyWebsite && !companyWebsite.trim() && <div className="text-red-500 text-xs mt-1">Required</div>}
          </div>
          <div>
            <label className="block font-medium mb-1 text-black">Number of employees</label>
            <input
              type="number"
              min={1}
              className={`w-full px-4 py-2 rounded border ${touched.employees && !employees ? 'border-red-400' : 'border-gray-300'} focus:border-blue-400 text-black placeholder-black`}
              value={employees}
              onChange={e => setEmployees(e.target.value)}
              onBlur={() => setTouched((t:any) => ({ ...t, employees: true }))}
              required
            />
            {touched.employees && !employees && <div className="text-red-500 text-xs mt-1">Required</div>}
          </div>
          <div>
            <label className="block font-medium mb-1 text-black">Do you have franchisees or are you planning to open new locations?</label>
            <select
              className={`w-full px-4 py-2 rounded border ${touched.franchise && !franchise ? 'border-red-400' : 'border-gray-300'} focus:border-blue-400 text-black`}
              value={franchise}
              onChange={e => setFranchise(e.target.value)}
              onBlur={() => setTouched((t:any) => ({ ...t, franchise: true }))}
              required
            >
              <option value="" className="text-black">Select...</option>
              <option value="Yes" className="text-black">Yes</option>
              <option value="No" className="text-black">No</option>
            </select>
            {touched.franchise && !franchise && <div className="text-red-500 text-xs mt-1">Required</div>}
          </div>
          <div>
            <label className="block font-medium mb-1 text-black">What are the main problems with onboarding new employees?</label>
            <input
              type="text"
              className={`w-full px-4 py-2 rounded border ${touched.onboardingProblems && !onboardingProblems.trim() ? 'border-red-400' : 'border-gray-300'} focus:border-blue-400 text-black placeholder-black`}
              value={onboardingProblems}
              onChange={e => setOnboardingProblems(e.target.value)}
              onBlur={() => setTouched((t:any) => ({ ...t, onboardingProblems: true }))}
              required
            />
            {touched.onboardingProblems && !onboardingProblems.trim() && <div className="text-red-500 text-xs mt-1">Required</div>}
          </div>
          <div>
            <label className="block font-medium mb-1 text-black">What documents do you already have?</label>
            <div className={`w-full px-4 py-2 rounded border ${touched.documents && documents.length === 0 ? 'border-red-400' : 'border-gray-300'} focus-within:border-blue-400 bg-white`}>
              {documentOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 text-black">
                  <input
                    type="checkbox"
                    checked={documents.includes(opt)}
                    onChange={() => handleCheckbox(documents, setDocuments, opt)}
                    className="accent-blue-600"
                  />
                  {opt}
                </label>
              ))}
              {documents.includes("Other") && (
                <input
                  type="text"
                  className="mt-2 w-full px-2 py-1 rounded border border-gray-300 focus:border-blue-400 text-black placeholder-black"
                  placeholder="Please specify"
                  value={documentsOther}
                  onChange={e => setDocumentsOther(e.target.value)}
                  required
                />
              )}
            </div>
            {touched.documents && documents.length === 0 && <div className="text-red-500 text-xs mt-1">Required</div>}
            {documents.includes("Other") && touched.documentsOther && !documentsOther.trim() && <div className="text-red-500 text-xs mt-1">Required</div>}
          </div>
          <div>
            <label className="block font-medium mb-1 text-black">What is your main priority right now?</label>
            <div className={`w-full px-4 py-2 rounded border ${touched.priorities && priorities.length === 0 ? 'border-red-400' : 'border-gray-300'} focus-within:border-blue-400 bg-white`}>
              {priorityOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 text-black">
                  <input
                    type="checkbox"
                    checked={priorities.includes(opt)}
                    onChange={() => handleCheckbox(priorities, setPriorities, opt)}
                    className="accent-blue-600"
                  />
                  {opt}
                </label>
              ))}
              {priorities.includes("Other") && (
                <input
                  type="text"
                  className="mt-2 w-full px-2 py-1 rounded border border-gray-300 focus:border-blue-400 text-black placeholder-black"
                  placeholder="Please specify"
                  value={priorityOther}
                  onChange={e => setPriorityOther(e.target.value)}
                  required
                />
              )}
            </div>
            {touched.priorities && priorities.length === 0 && <div className="text-red-500 text-xs mt-1">Required</div>}
            {priorities.includes("Other") && touched.priorityOther && !priorityOther.trim() && <div className="text-red-500 text-xs mt-1">Required</div>}
          </div>
          {/* Example section divider: */}
          <div className="h-px bg-gray-200 my-2" />
          <button
            type="submit"
            className="mt-6 px-10 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold shadow-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (longLoading ? (
              <span className="flex items-center gap-2"><span className="animate-spin h-5 w-5 border-2 border-t-2 border-blue-200 border-t-blue-600 rounded-full"></span> Still working...</span>
            ) : (
              <span className="flex items-center gap-2"><span className="animate-spin h-5 w-5 border-2 border-t-2 border-blue-200 border-t-blue-600 rounded-full"></span> Generating...</span>
            )) : "Generate Audit"}
          </button>
          {error && <div className="text-red-600 text-base mt-2 text-center">{error}</div>}
        </form>
        )}
      </div>
    </main>
  );
} 