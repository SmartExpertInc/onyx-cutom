import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuizData, AnyQuizQuestion } from "../../../types/quizTypes";

const QuizPreviewPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [themes, setThemes] = useState<string>("");
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<string | null>(null);

  // Stream quiz data from backend (mocked for now)
  useEffect(() => {
    setLoading(true);
    setError(null);
    // TODO: Replace with actual streaming fetch from backend
    setTimeout(() => {
      setQuizData({
        quizTitle: "Sample Quiz Title",
        questions: [
          {
            question_type: "multiple-choice",
            question_text: "What is 2+2?",
            options: [
              { id: "A", text: "3" },
              { id: "B", text: "4" },
              { id: "C", text: "5" },
            ],
            correct_option_id: "B",
          },
        ],
      });
      setLoading(false);
    }, 1500);
  }, []);

  const handleParse = async () => {
    setParsing(true);
    setParseResult(null);
    // TODO: Call backend AI parser with quizData
    setTimeout(() => {
      setParseResult("Quiz product created! (AI parser integration needed)");
      setParsing(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <div className="w-full max-w-3xl flex flex-col gap-4 text-gray-900">
        <h1 className="text-4xl font-semibold text-center mt-8">Quiz Generation Preview</h1>
        {loading && <div className="text-center text-lg mt-8">Generating quiz...</div>}
        {error && <div className="text-center text-red-600 mt-8">{error}</div>}
        {quizData && (
          <div className="bg-white rounded-lg shadow p-6 mt-4">
            <h2 className="text-2xl font-bold mb-2">{quizData.quizTitle}</h2>
            <div className="space-y-4">
              {quizData.questions.map((q: AnyQuizQuestion, idx: number) => (
                <div key={idx} className="border-b pb-4">
                  <div className="font-medium">Q{idx + 1}: {q.question_text}</div>
                  {/* Render question type and options */}
                  {q.question_type === "multiple-choice" && (
                    <ul className="ml-4 mt-2 list-disc">
                      {(q as AnyQuizQuestion & { options: any[] }).options.map((opt: any, i: number) => (
                        <li key={opt.id}>{opt.text}</li>
                      ))}
                    </ul>
                  )}
                  {/* TODO: Render other question types */}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Themes section (not wired) */}
        <div className="flex flex-col gap-2 w-full max-w-md mt-8 mx-auto">
          <label className="font-medium text-gray-700">Themes (optional, not wired)</label>
          <input
            type="text"
            placeholder="e.g. Math, Science, History"
            className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
            value={themes}
            onChange={e => setThemes(e.target.value)}
            disabled
          />
        </div>
        {/* Finalize button */}
        <button
          onClick={handleParse}
          className="mt-8 px-8 py-3 rounded-full bg-brand-primary text-white text-lg font-semibold shadow hover:bg-brand-primary-hover transition disabled:opacity-60"
          disabled={parsing || loading}
        >
          {parsing ? "Creating..." : "Create Final Product"}
        </button>
        {parseResult && <div className="text-center text-green-600 mt-4">{parseResult}</div>}
      </div>
    </main>
  );
};

export default QuizPreviewPage; 