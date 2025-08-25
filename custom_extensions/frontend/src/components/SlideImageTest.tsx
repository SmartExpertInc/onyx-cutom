import React from 'react';
import StandaloneSlideImageButton from './StandaloneSlideImageButton';

const SlideImageTest: React.FC = () => {
  const handleSuccess = (message: string) => {
    console.log('✅ Success:', message);
    alert(`✅ Success: ${message}\n\nPlease check the downloaded image to verify:\n1. Text size is proportional to original slide\n2. Avatar placeholder is a simple blank space\n3. Background fills the entire frame`);
  };

  const handleError = (error: string) => {
    console.error('❌ Error:', error);
    alert(`❌ Error: ${error}\n\nPlease check the browser console for more details.`);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Slide Image Generation Test - Fixed Version</h3>
      <p className="text-sm text-gray-600 mb-4">
        This button will generate a slide image from the current slide with the following fixes:
      </p>
      
      <div className="mb-4 text-xs text-gray-700 bg-blue-50 p-3 rounded">
        <h4 className="font-semibold mb-2">Applied Fixes:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>✅ Reduced font sizes for proportional scaling</li>
          <li>✅ Replaced detailed avatar placeholder with simple blank space</li>
          <li>✅ Ensured background fills entire 1920x1080 frame</li>
          <li>✅ Improved HTML-to-image conversion settings</li>
        </ul>
      </div>
      
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
        <p>• <strong>Fixed:</strong> Proper text scaling and background filling</p>
      </div>
    </div>
  );
};

export default SlideImageTest;
