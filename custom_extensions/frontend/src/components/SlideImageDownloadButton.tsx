import React from 'react';

interface SlideImageDownloadButtonProps {
  jobId: string;
  disabled?: boolean;
  className?: string;
}

const SlideImageDownloadButton: React.FC<SlideImageDownloadButtonProps> = ({
  jobId,
  disabled = false,
  className = ''
}) => {
  const handleDownload = async () => {
    try {
      // Construct the download URL
      const downloadUrl = `/api/custom/presentations/${jobId}/slide-image`;
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `slide_image_${jobId}.png`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Slide image download initiated for job: ${jobId}`);
    } catch (error) {
      console.error('Failed to download slide image:', error);
      alert('Failed to download slide image. Please try again.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled}
      className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
      title="Download generated slide image for debugging"
    >
      📷 Download Slide Image
    </button>
  );
};

export default SlideImageDownloadButton;
