import React, { useState } from "react";
import { useRouter } from "next/navigation";

const employeeOptions = [
  "< 10",
  "10–50",
  "51–200",
  "200+",
];
const goalOptions = [
  "Reduce employee turnover",
  "Automate onboarding",
  "Scale without new hires",
  "Other",
];

export default function AiAuditQuestionnaire() {
  const [companyName, setCompanyName] = useState("");
  const [companyLink, setCompanyLink] = useState("");
  const [employees, setEmployees] = useState("");
  const [mainGoal, setMainGoal] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [challenge, setChallenge] = useState("");
  const [touched, setTouched] = useState({ companyName: false, employees: false, mainGoal: false });
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ companyName: true, employees: true, mainGoal: true });
    if (!companyName.trim() || !employees || !mainGoal) return;
    setSubmitted(true);
    // In real app, POST to backend here
    setTimeout(() => router.push("/create/generate"), 1500);
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 mt-12">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">AI Audit Questionnaire</h1>
        {submitted ? (
          <div className="text-center text-green-700 text-lg font-semibold py-12">Thank you! Your answers have been submitted.</div>
        ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block font-medium mb-1">Company Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={`w-full px-4 py-2 rounded border ${touched.companyName && !companyName.trim() ? 'border-red-400' : 'border-gray-300'} focus:border-blue-400`}
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, companyName: true }))}
              required
            />
            {touched.companyName && !companyName.trim() && <div className="text-red-500 text-xs mt-1">Required</div>}
          </div>
          <div>
            <label className="block font-medium mb-1">Link to the website or socials of the company</label>
            <input
              type="url"
              className="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-400"
              value={companyLink}
              onChange={e => setCompanyLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Amount of employees <span className="text-red-500">*</span></label>
            <select
              className={`w-full px-4 py-2 rounded border ${touched.employees && !employees ? 'border-red-400' : 'border-gray-300'} focus:border-blue-400`}
              value={employees}
              onChange={e => setEmployees(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, employees: true }))}
              required
            >
              <option value="">Select...</option>
              {employeeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {touched.employees && !employees && <div className="text-red-500 text-xs mt-1">Required</div>}
          </div>
          <div>
            <label className="block font-medium mb-1">What is your main goal right now? <span className="text-red-500">*</span></label>
            <select
              className={`w-full px-4 py-2 rounded border ${touched.mainGoal && !mainGoal ? 'border-red-400' : 'border-gray-300'} focus:border-blue-400`}
              value={mainGoal}
              onChange={e => setMainGoal(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, mainGoal: true }))}
              required
            >
              <option value="">Select...</option>
              {goalOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {touched.mainGoal && !mainGoal && <div className="text-red-500 text-xs mt-1">Required</div>}
          </div>
          <div>
            <label className="block font-medium mb-1">Link to the job vacancy or career page</label>
            <input
              type="url"
              className="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-400"
              value={jobLink}
              onChange={e => setJobLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block font-medium mb-1">What is your biggest problem or challenge right now?</label>
            <textarea
              className="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-400 min-h-[80px]"
              value={challenge}
              onChange={e => setChallenge(e.target.value)}
              placeholder="Describe your main challenge..."
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow transition-colors cursor-pointer"
          >
            Generate Audit
          </button>
        </form>
        )}
      </div>
    </main>
  );
} 