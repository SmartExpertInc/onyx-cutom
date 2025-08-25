import React from 'react';
import StandaloneSlideImageButton from './StandaloneSlideImageButton';

const SlideImageTest: React.FC = () => {
  const handleSuccess = (message: string) => {
    console.log('✅ Success:', message);
    alert(`Success: ${message}`);
  };

  const handleError = (error: string) => {
    console.error('❌ Error:', error);
    alert(`Error: ${error}`);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Slide Image Generation Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        This button will generate a slide image from the current slide without any video generation.
      </p>
      
      <StandaloneSlideImageButton
        projectName="Test Project"
        onSuccess={handleSuccess}
        onError={handleError}
      />
      
      <div className="mt-4 text-xs text-gray-500">
        <p>• Generates PNG image from current slide</p>
        <p>• No video generation or AI avatars</p>
        <p>• Fast and lightweight</p>
        <p>• Perfect for debugging slide content</p>
      </div>
    </div>
  );
};

export default SlideImageTest;
