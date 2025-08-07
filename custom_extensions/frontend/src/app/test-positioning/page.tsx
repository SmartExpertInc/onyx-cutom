// app/test-positioning/page.tsx
// Test page for positioning functionality

import QuickPositioningTest from '@/components/examples/QuickPositioningTest';

export default function TestPositioningPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl">
        <QuickPositioningTest />
      </div>
    </div>
  );
}
