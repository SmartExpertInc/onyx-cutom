import EditorPage from '@/components/EditorPage';

interface PageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function Editor({ searchParams }: PageProps) {
  const params = await searchParams;
  
  return <EditorPage projectId={params.projectId} />;
} 