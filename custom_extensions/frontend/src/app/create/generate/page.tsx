// @ts-nocheck
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import the client component without SSR to avoid useSearchParams pre-render issues.
const GenerateProductPickerClient = dynamic(() => import("./GenerateProductPickerClient"));

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <GenerateProductPickerClient />
    </Suspense>
  );
} 