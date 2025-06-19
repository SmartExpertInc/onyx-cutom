import { Suspense } from "react";
import LessonPresentationClient from "./LessonPresentationClient";

export default function LessonPresentationPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <LessonPresentationClient />
    </Suspense>
  );
}

export const dynamic = "force-dynamic"; 