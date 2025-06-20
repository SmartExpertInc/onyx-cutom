import { Suspense } from "react";
import GenerateProductPickerClient from "./GenerateProductPickerClient";

// Keep this page as a Server Component so that static export succeeds; the
// client-only logic (which relies on useSearchParams) lives in a nested Client
// Component that we wrap in <Suspense>.

export default function GenerateProductPickerPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <GenerateProductPickerClient />
    </Suspense>
  );
} 