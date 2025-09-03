// custom_extensions/frontend/src/app/projects-2/view/components/VideoGenerationExample.tsx

'use client';

import { useState } from 'react';
import VideoGenerationModals from './VideoGenerationModals';

export default function VideoGenerationExample() {
  const [showVideoModals, setShowVideoModals] = useState(false);
  const [projectTitle, setProjectTitle] = useState('My Presentation');

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Video Generation Example</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Title
          </label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter project title"
          />
        </div>
        
        <button
          onClick={() => setShowVideoModals(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Generate Video
        </button>
      </div>

      {/* Video Generation Modals */}
      <VideoGenerationModals
        isOpen={showVideoModals}
        onClose={() => setShowVideoModals(false)}
        title={projectTitle}
      />
    </div>
  );
}
