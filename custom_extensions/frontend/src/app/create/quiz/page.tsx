"use client";

import { Suspense } from "react";
import QuizClient from "./QuizClient";
import LoadingFallback from "../generate/page";

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <QuizClient />
    </Suspense>
  );
} 