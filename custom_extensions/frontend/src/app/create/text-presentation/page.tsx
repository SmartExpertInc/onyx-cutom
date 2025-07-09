import { Suspense } from 'react';
import TextPresentationClient from './TextPresentationClient';

export default function TextPresentationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TextPresentationClient />
    </Suspense>
  );
} 