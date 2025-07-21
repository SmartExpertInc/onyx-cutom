"use client";
import React, { useState } from "react";

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

export default function QuestionnaireClient() {
  const [form, setForm] = useState({
    companyName: "",
    website: "",
    employees: "",
    mainGoal: "",
    jobLink: "",
    challenge: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.companyName.trim()) newErrors.companyName = "Company Name is required.";
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setSubmitted(true);
    if (Object.keys(validationErrors).length === 0) {
      // TODO: POST to backend
      alert("Audit generation not implemented yet.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded-xl shadow p-8 space-y-6">
        <h1 className="text-2xl font-bold mb-2 text-center">AI Audit Questionnaire</h1>
        <div>
          <label className="block font-medium mb-1">Company Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded border ${errors.companyName ? 'border-red-500' : 'border-gray-300'} focus:outline-none`}
            required
          />
          {errors.companyName && <div className="text-red-500 text-sm mt-1">{errors.companyName}</div>}
        </div>
        <div>
          <label className="block font-medium mb-1">Link to website or socials</label>
          <input
            type="url"
            name="website"
            value={form.website}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none"
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Amount of employees</label>
          <select
            name="employees"
            value={form.employees}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none"
          >
            <option value="">Select...</option>
            {employeeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">What is your main goal right now?</label>
          <select
            name="mainGoal"
            value={form.mainGoal}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none"
          >
            <option value="">Select...</option>
            {goalOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Link to job vacancy or career page</label>
          <input
            type="url"
            name="jobLink"
            value={form.jobLink}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none"
            placeholder="https://careers.example.com"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">What is your biggest problem or challenge right now?</label>
          <textarea
            name="challenge"
            value={form.challenge}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none min-h-[80px]"
            placeholder="Describe your main challenge..."
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow transition-colors"
        >
          Generate Audit
        </button>
        {submitted && Object.keys(errors).length > 0 && (
          <div className="text-red-500 text-center text-sm mt-2">Please fill all required fields.</div>
        )}
      </form>
    </div>
  );
} 