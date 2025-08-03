import { Suspense } from 'react';
import VideoLessonClient from './VideoLessonClient';

export default function VideoLessonPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VideoLessonClient />
    </Suspense>
  );
} 