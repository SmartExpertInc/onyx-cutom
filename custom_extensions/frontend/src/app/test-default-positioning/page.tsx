// app/test-default-positioning/page.tsx
// Test page for default positioning functionality

import DefaultPositioningDemo from '@/components/examples/DefaultPositioningDemo';

export default function TestDefaultPositioningPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl">
        <DefaultPositioningDemo />
      </div>
    </div>
  );
}
