"use client";

import { Suspense } from "react";
import TextPresentationClient from "./TextPresentationClient";
import LoadingFallback from "../generate/page";

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TextPresentationClient />
    </Suspense>
  );
} 