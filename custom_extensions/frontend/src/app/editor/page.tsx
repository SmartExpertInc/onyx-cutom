import EditorPage from '@/components/EditorPage';
import { Suspense } from 'react';

function EditorPageWrapper({ searchParams }: { searchParams: { projectId?: string } }) {
  return <EditorPage projectId={searchParams.projectId} />;
}

export default function Editor({ searchParams }: { searchParams: { projectId?: string } }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <EditorPageWrapper searchParams={searchParams} />
    </Suspense>
  );
} 