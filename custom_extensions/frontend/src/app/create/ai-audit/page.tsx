"use client";
import { Suspense } from "react";
import QuestionnaireClient from "./QuestionnaireClient";
import LoadingFallback from "../generate/page";

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <QuestionnaireClient />
    </Suspense>
  );
} 