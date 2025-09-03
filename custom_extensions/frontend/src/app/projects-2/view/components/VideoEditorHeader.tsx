'use client';

import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Play, Undo2, Redo2, Gem } from 'lucide-react';
import PlayModal from './PlayModal';
import GenerateModal from './GenerateModal';
import GenerationCompletedModal from './GenerationCompletedModal';
import UpgradeModal from './UpgradeModal';
import { Avatar, AvatarVariant } from '@/components/AvatarSelector';

interface EmailInput {
  id: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
}

interface VideoEditorHeaderProps {
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
}

export default function VideoEditorHeader({ aspectRatio, onAspectRatioChange }: VideoEditorHeaderProps) {
  const [isResizePopupOpen, setIsResizePopupOpen] = useState(false);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [isEyeVisible, setIsEyeVisible] = useState(false);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerationCompletedModalOpen, setIsGenerationCompletedModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState('Create your first AI video');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [emailInputs, setEmailInputs] = useState<EmailInput[]>([
    { id: '1', email: '', role: 'editor' }
  ]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Video generation state - transferred from VideoDownloadButton
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationJobId, setGenerationJobId] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | undefined>(undefined);
  const [selectedVariant, setSelectedVariant] = useState<AvatarVariant | undefined>(undefined);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  const resizeButtonRef = useRef<HTMLButtonElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const sharePopupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // For resize popup, check if click is outside both button and popup
      if (isResizePopupOpen) {
        const isClickInButton = resizeButtonRef.current?.contains(event.target as Node);
        const resizePopupElement = document.querySelector('[data-resize-popup]');
        const isClickInPopup = resizePopupElement?.contains(event.target as Node);
        
        if (!isClickInButton && !isClickInPopup) {
          setIsResizePopupOpen(false);
        }
      }
      
      // For share popup, check if click is outside both button and popup
      if (isSharePopupOpen) {
        const isClickInButton = shareButtonRef.current?.contains(event.target as Node);
        const isClickInPopup = sharePopupRef.current?.contains(event.target as Node);
        
        if (!isClickInButton && !isClickInPopup) {
          setIsSharePopupOpen(false);
          setOpenDropdownId(null); // Close any open dropdown when share popup closes
        }
      }
      
      // Close dropdown when clicking outside
      if (openDropdownId) {
        const dropdownElement = document.getElementById(`dropdown-${openDropdownId}`);
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setOpenDropdownId(null);
        }
      }
    };

    if (isResizePopupOpen || isSharePopupOpen || openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isResizePopupOpen, isSharePopupOpen, openDropdownId]);

  const handleResizeClick = () => {
    setIsResizePopupOpen(!isResizePopupOpen);
  };

  const handleResizeOptionClick = (ratio: string) => {
    if (ratio !== 'Custom') {
      onAspectRatioChange(ratio);
    }
    setIsResizePopupOpen(false);
  };

  const handleShareClick = () => {
    setIsSharePopupOpen(!isSharePopupOpen);
  };

  const handleEyeToggle = () => {
    setIsEyeVisible(!isEyeVisible);
  };

  const handlePlayClick = () => {
    setIsPlayModalOpen(true);
  };

  const handleGenerateClick = () => {
    setIsGenerateModalOpen(true);
  };

  const handleUpgradeClick = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleEmailChange = (id: string, email: string) => {
    setEmailInputs(prev => prev.map(input => 
      input.id === id ? { ...input, email } : input
    ));
  };

  const handleRoleChange = (id: string, role: 'viewer' | 'editor' | 'admin') => {
    setEmailInputs(prev => prev.map(input => 
      input.id === id ? { ...input, role } : input
    ));
  };

  const addEmailInput = () => {
    const newId = (emailInputs.length + 1).toString();
    setEmailInputs(prev => [...prev, { id: newId, email: '', role: 'editor' }]);
  };

  const deleteEmailInput = (id: string) => {
    // Don't allow deleting the first input
    if (id === '1') return;
    setEmailInputs(prev => prev.filter(input => input.id !== id));
  };

  // Video generation constants and functions - transferred from VideoDownloadButton
  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  // Function to extract actual slide data from current project - transferred from VideoDownloadButton
  const extractSlideData = async (): Promise<{ slides: any[], theme: string, voiceoverTexts: string[] }> => {
    console.log('🎬 [VIDEO_DOWNLOAD] Extracting slide data from current project...');
    
    try {
      // Try to get slide data from the global window object (if SmartSlideDeckViewer exposed it)
      const slideViewerData = (window as any).currentSlideData;
      if (slideViewerData?.deck?.slides) {
        console.log('🎬 [VIDEO_DOWNLOAD] Found slide data in window object:', slideViewerData.deck.slides.length, 'slides');
        
        // Extract voiceover texts from slides
        const voiceoverTexts = slideViewerData.deck.slides
          .map((slide: any) => slide.voiceoverText || slide.props?.voiceoverText)
          .filter((text: string) => text && text.trim().length > 0);
        
        console.log('🎬 [VIDEO_DOWNLOAD] Extracted voiceover texts:', voiceoverTexts);
        
        return {
          slides: slideViewerData.deck.slides,
          theme: slideViewerData.deck.theme || 'dark-purple',
          voiceoverTexts: voiceoverTexts
        };
      }

      // Fallback: Try to extract from the URL by getting project ID and fetching data
      const currentUrl = window.location.href;
      const projectIdMatch = currentUrl.match(/\/projects\/view\/(\d+)/);
      
      if (projectIdMatch) {
        const projectId = projectIdMatch[1];
        console.log('🎬 [VIDEO_DOWNLOAD] Extracted project ID from URL:', projectId);
        
        // Fetch project data from API
        const response = await fetch(`/api/custom/projects/${projectId}`);
        if (response.ok) {
          const projectData = await response.json();
          console.log('🎬 [VIDEO_DOWNLOAD] Fetched project data:', projectData);
          
          if (projectData.details?.slides) {
            // Extract voiceover texts from slides
            const voiceoverTexts = projectData.details.slides
              .map((slide: any) => slide.voiceoverText || slide.props?.voiceoverText)
              .filter((text: string) => text && text.trim().length > 0);
            
            console.log('🎬 [VIDEO_DOWNLOAD] Extracted voiceover texts:', voiceoverTexts);
            
            return {
              slides: projectData.details.slides,
              theme: projectData.details.theme || 'dark-purple',
              voiceoverTexts: voiceoverTexts
            };
          }
        }
      }

      console.log('🎬 [VIDEO_DOWNLOAD] Could not extract slide data');
      return { slides: [], theme: 'dark-purple', voiceoverTexts: [] };
        
    } catch (error) {
      console.error('🎬 [VIDEO_DOWNLOAD] Error extracting slide data:', error);
      return { slides: [], theme: 'dark-purple', voiceoverTexts: [] };
    }
  };

  // Avatar selection handler - transferred from VideoDownloadButton
  const handleAvatarSelect = (avatar: Avatar, variant?: AvatarVariant) => {
    setSelectedAvatar(avatar);
    setSelectedVariant(variant || undefined);
    console.log('🎬 [VIDEO_DOWNLOAD] Avatar selected:', {
      avatar: avatar.name,
      variant: variant?.name,
      code: variant ? `${avatar.code}.${variant.code}` : avatar.code
    });
  };

  // Download video function - transferred from VideoDownloadButton
  const downloadVideo = async (jobId: string) => {
    try {
      console.log('🎬 [VIDEO_DOWNLOAD] Downloading video for job:', jobId);
      
      const downloadResponse = await fetch(`${CUSTOM_BACKEND_URL}/presentations/${jobId}/video`, {
        method: 'GET',
        headers: {
          'Accept': 'video/mp4',
        },
        credentials: 'same-origin',
      });
       
      if (!downloadResponse.ok) {
        throw new Error(`Download failed: ${downloadResponse.status}`);
      }

      // Create blob and download
      const blob = await downloadResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `professional_presentation_${jobId}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('🎬 [VIDEO_DOWNLOAD] Video downloaded successfully');
       
    } catch (error) {
      console.error('🎬 [VIDEO_DOWNLOAD] Download failed:', error);
      setGenerationError(error instanceof Error ? error.message : 'Download failed');
    }
  };

  // Main video generation function - transferred from VideoDownloadButton
  const handleVideoGeneration = async () => {
    if (!selectedAvatar) {
      setGenerationError('Please select an avatar first');
      return;
    }

    try {
      setGenerationStatus('generating');
      setGenerationProgress(0);
      setGenerationError(null);

      console.log('🎬 [VIDEO_DOWNLOAD] Starting video generation with selected avatar:', {
        avatar: selectedAvatar.name,
        variant: selectedVariant?.name,
        avatarCode: selectedVariant ? `${selectedAvatar.code}.${selectedVariant.code}` : selectedAvatar.code
      });

      // Extract slide data
      const slideData = await extractSlideData();
      
      if (!slideData.slides || slideData.slides.length === 0) {
        const errorMsg = 'No slide data found. Please make sure you have a slide open.';
        console.error('🎬 [VIDEO_DOWNLOAD]', errorMsg);
        setGenerationError(errorMsg);
        setGenerationStatus('error');
        return;
      }

      console.log('🎬 [VIDEO_DOWNLOAD] Slide data extracted successfully');
      console.log('🎬 [VIDEO_DOWNLOAD] Slides count:', slideData.slides.length);
      console.log('🎬 [VIDEO_DOWNLOAD] Theme:', slideData.theme);

      // Create the request payload
      const requestPayload = {
        projectName: videoTitle || 'Generated Video',
        voiceoverTexts: slideData.voiceoverTexts.length > 0 ? slideData.voiceoverTexts : [
          "Welcome to this professional presentation. We'll be exploring key concepts and insights that will help you understand the material better."
        ],  // Use actual voiceover texts or fallback
        slidesData: slideData.slides,  // Add the extracted slide data
        theme: slideData.theme,  // Use the extracted theme
        avatarCode: selectedVariant ? `${selectedAvatar.code}.${selectedVariant.code}` : selectedAvatar.code,
        useAvatarMask: true,
        layout: 'picture_in_picture',
        duration: 30.0,
        quality: 'high',
        resolution: [1920, 1080]
      };

      console.log('🎬 [VIDEO_DOWNLOAD] Request payload:', requestPayload);

      // Create presentation
      const createResponse = await fetch(`${CUSTOM_BACKEND_URL}/presentations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(requestPayload)
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Failed to create presentation: ${createResponse.status} - ${errorText}`);
      }

      const createData = await createResponse.json();

      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create presentation');
      }

      const newJobId = createData.jobId;
      setGenerationJobId(newJobId);
      console.log('🎬 [VIDEO_DOWNLOAD] Presentation job created:', newJobId);

      // Close GenerateModal and open GenerationCompletedModal
      setIsGenerateModalOpen(false);
      setIsGenerationCompletedModalOpen(true);

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${CUSTOM_BACKEND_URL}/presentations/${newJobId}`, {
            method: 'GET',
            credentials: 'same-origin',
          });

          if (!statusResponse.ok) {
            throw new Error(`Status check failed: ${statusResponse.status}`);
          }

          const statusData = await statusResponse.json();
          
          if (statusData.success) {
            const currentProgress = statusData.progress || 0;
            setGenerationProgress(currentProgress);
            
            console.log('🎬 [VIDEO_DOWNLOAD] Job progress:', currentProgress);
            
            if (statusData.status === 'completed') {
              clearInterval(pollInterval);
              setGenerationStatus('completed');
              setGenerationProgress(100);
              console.log('🎬 [VIDEO_DOWNLOAD] Video generation completed');
              
              // Auto-download the video
              await downloadVideo(newJobId);
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval);
              setGenerationStatus('error');
              throw new Error(statusData.error || 'Video generation failed');
            }
          } else {
            throw new Error(statusData.error || 'Status check failed');
          }
        } catch (error) {
          console.error('🎬 [VIDEO_DOWNLOAD] Status check error:', error);
          clearInterval(pollInterval);
          setGenerationStatus('error');
          setGenerationError(error instanceof Error ? error.message : 'Status check failed');
        }
      }, 2000);

      // Set a timeout to stop polling after 10 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (generationStatus === 'generating') {
          setGenerationStatus('error');
          setGenerationError('Video generation timed out after 10 minutes. This may indicate a backend issue. Please check the status manually.');
        }
      }, 600000);

    } catch (error) {
      console.error('🎬 [VIDEO_DOWNLOAD] Video generation failed:', error);
      setGenerationStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(errorMsg);
    }
  };

  const handleDropdownToggle = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleRoleSelect = (id: string, role: 'viewer' | 'editor' | 'admin') => {
    handleRoleChange(id, role);
    setOpenDropdownId(null);
  };

  // Envelope icon component
  const EnvelopeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gray-500">
      <path
        d="M2.67 3.33H13.33C14.07 3.33 14.67 3.93 14.67 4.67V11.33C14.67 12.07 14.07 12.67 13.33 12.67H2.67C1.93 12.67 1.33 12.07 1.33 11.33V4.67C1.33 3.93 1.93 3.33 2.67 3.33Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M14.67 4.67L8 8.67L1.33 4.67"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Dropdown icon component
  const DropdownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 12 12" fill="none" className="w-4 h-4 text-gray-500">
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Link icon component
  const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" className="w-4 h-4 text-gray-500">
      <path fill="currentColor" fillRule="evenodd" d="M9.929 3.132a2.078 2.078 0 1 1 2.94 2.94l-.65.648a.75.75 0 0 0 1.061 1.06l.649-.648a3.579 3.579 0 0 0-5.06-5.06L6.218 4.72a3.578 3.578 0 0 0 0 5.06a.75.75 0 0 0 1.061-1.06a2.078 2.078 0 0 1 0-2.94L9.93 3.132Zm-.15 3.086a.75.75 0 0 0-1.057 1.064c.816.81.818 2.13.004 2.942l-2.654 2.647a2.08 2.08 0 0 1-2.94-2.944l.647-.647a.75.75 0 0 0-1.06-1.06l-.648.647a3.58 3.58 0 0 0 5.06 5.066l2.654-2.647a3.575 3.575 0 0 0-.007-5.068Z" clipRule="evenodd"/>
    </svg>
  );

  // Plus icon component
  const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gray-500">
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Garbage bin icon component
  const GarbageIcon = () => (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-gray-700">
      <path
        d="M2 4h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.33 4V2.67a1.33 1.33 0 0 1 1.34-1.34h2.66a1.33 1.33 0 0 1 1.34 1.34V4M12.67 4v9.33a1.33 1.33 0 0 1-1.34 1.34H4.67a1.33 1.33 0 0 1-1.34-1.34V4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.67 7.33v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33 7.33v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const resizeOptions = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-gray-500">
          <rect x="2" y="5" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      ratio: "16:9",
      description: "Desktop video, Youtube"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-gray-500">
          <rect x="5" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      ratio: "9:16",
      description: "Instagram story"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-gray-500">
          <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      ratio: "1:1",
      description: "Square, instagram post"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-gray-500">
          <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" fill="none"/>
        </svg>
      ),
      ratio: "Custom",
      description: "set a custom size"
    }
  ];

  return (
    <header className="w-full bg-white h-[68px] flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        {/* Left section - Logo and tools */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Home button */}
          <button className="bg-white border border-gray-300 text-black hover:bg-gray-50 rounded-[7px] px-3 py-1.5 flex items-center h-8 cursor-pointer ml-2">
            <span className="text-sm font-normal">Home</span>
          </button>

          {/* Tool icons - hidden on mobile, visible on tablet+ */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center cursor-pointer">
              <Undo2 className="w-4 h-4 text-gray-700" />
            </button>

            <button className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center cursor-pointer">
              <Redo2 className="w-4 h-4 text-gray-700" />
            </button>

            <div className="w-0.5 h-[18px] bg-gray-300"></div>

            {/* New button with document SVG - hidden on smaller screens */}
            <div className="hidden lg:flex items-center">
              <button className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 28 28" className="w-4 h-4 text-gray-700">
                  <path fill="currentColor" d="M6.25 4.5A1.75 1.75 0 0 0 4.5 6.25v15.5A1.75 1.75 0 0 0 6 23.482V16.25A2.25 2.25 0 0 1 8.25 14h11.5A2.25 2.25 0 0 1 22 16.25v7.232a1.75 1.75 0 0 0 1.5-1.732V8.786c0-.465-.184-.91-.513-1.238l-2.535-2.535a1.75 1.75 0 0 0-1.238-.513H19v4.25A2.25 2.25 0 0 1 16.75 11h-6.5A2.25 2.25 0 0 1 8 8.75V4.5H6.25Zm3.25 0v4.25c0 .414.336.75.75.75h6.5a.75.75 0 0 0 .75-.75V4.5h-8Zm11 19v-7.25a.75.75 0 0 0-.75-.75H8.25a.75.75 0 0 0-.75.75v7.25h13ZM3 6.25A3.25 3.25 0 0 1 6.25 3h12.965a3.25 3.25 0 0 1 2.298.952l2.535 2.535c.61.61.952 1.437.952 2.299V21.75A3.25 3.25 0 0 1 21.75 25H6.25A3.25 3.25 0 0 1 3 21.75V6.25Z"/>
                </svg>
              </button>
            </div>

            <div className="hidden lg:block w-0.5 h-[18px] bg-gray-300"></div>

            {/* Resize tool - visible on all screens for testing */}
            <div className="flex items-center relative">
              <button
                ref={resizeButtonRef}
                onClick={handleResizeClick}
                className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="w-4 h-4 text-gray-700">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12c0-4.243 0-6.364 1.318-7.682C5.636 3 7.758 3 12 3c4.243 0 6.364 0 7.682 1.318C21 5.636 21 7.758 21 12c0 4.243 0 6.364-1.318 7.682C18.364 21 16.242 21 12 21c-4.243 0-6.364 0-7.682-1.318C3 18.364 3 16.242 3 12Z"/>
                </svg>
                <span className="text-black text-sm font-normal">Resize</span>
              </button>

              {/* Resize popup */}
              {isResizePopupOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg z-50 w-80" data-resize-popup>
                  <div className="py-2">
                    {resizeOptions.map((option, index) => (
                      <button
                        key={index}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left cursor-pointer ${
                          option.ratio === 'Custom' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => handleResizeOptionClick(option.ratio)}
                        disabled={option.ratio === 'Custom'}
                      >
                        <div>
                          {option.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-black">{option.ratio}</span>
                          <span className="text-sm text-gray-500">{option.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Warning text - extends to side borders with bottom spacing */}
                  <div className="pb-3">
                    <div className="bg-amber-50 text-amber-800 text-sm p-3 mx-0">
                      Existing content on the scene will not be reorganised automatically.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:block w-0.5 h-[18px] bg-gray-300"></div>

            {/* Grid tool - hidden on smaller screens */}
            <div className="hidden lg:flex items-center">
              <button 
                onClick={handleEyeToggle}
                className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center cursor-pointer gap-2"
              >
                {isEyeVisible ? (
                  <Eye className="w-4 h-4 text-gray-700" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-700" />
                )}
                <span className="text-black text-sm font-normal">Grid</span>
              </button>
            </div>

            <div className="hidden lg:block w-0.5 h-[20px] bg-gray-300"></div>

            {/* Upgrade button */}
            <button
              onClick={handleUpgradeClick}
              className="bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-[7px] px-3 py-1.5 gap-2 lg:gap-3 flex items-center h-8 cursor-pointer"
            >
              <Gem className="w-4 h-4 text-purple-700" />
              <span className="text-sm font-normal">Upgrade</span>
            </button>
          </div>
        </div>

        {/* Center section - Create video text (hidden on mobile) */}
        <div className="hidden lg:flex flex-1 justify-center">
          <div className="flex items-center gap-3">
            {isEditingTitle ? (
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingTitle(false);
                  }
                }}
                className="text-gray-700 text-sm font-medium bg-transparent border-none outline-none focus:ring-0 px-2 py-1 rounded"
                autoFocus
              />
            ) : (
              <span 
                className="text-black text-sm font-medium whitespace-nowrap cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                onClick={() => setIsEditingTitle(true)}
              >
                {videoTitle}
              </span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="w-4 h-4 text-gray-700">
              <g fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" d="M4 22h16"/>
                <path d="m13.888 3.663l.742-.742a3.146 3.146 0 1 1 4.449 4.45l-.742.74m-4.449-4.448s.093 1.576 1.483 2.966c1.39 1.39 2.966 1.483 2.966 1.483m-4.449-4.45L7.071 10.48c-.462.462-.693.692-.891.947a5.24 5.24 0 0 0-.599.969c-.139.291-.242.601-.449 1.22l-.875 2.626m14.08-8.13l-6.817 6.817c-.462.462-.692.692-.947.891c-.3.234-.625.435-.969.599c-.291.139-.601.242-1.22.448l-2.626.876m0 0l-.641.213a.848.848 0 0 1-1.073-1.073l.213-.641m1.501 1.5l-1.5-1.5"/>
              </g>
            </svg>
          </div>
        </div>

        {/* Right section - Share and Generate buttons */}
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
              onClick={handlePlayClick}
              className="bg-gray-50 border-gray-300 text-black hover:bg-gray-50 rounded-[7px] px-3 py-1.5 border flex items-center h-8 cursor-pointer"
            >
              <Play className="w-4 h-4 text-gray-700" />
            </button>

            <div className="w-0.5 h-[18px] bg-gray-300"></div>

            {/* Share button */}
            <div className="relative">
              <button
                ref={shareButtonRef}
                onClick={handleShareClick}
                className="bg-gray-50 border-gray-300 text-black hover:bg-gray-50 rounded-[7px] px-3 py-1.5 border flex items-center h-8 cursor-pointer"
              >
                <span className="text-sm font-normal">Share</span>
              </button>

              {/* Share popup */}
              {isSharePopupOpen && (
                <div 
                  ref={sharePopupRef}
                  className="fixed top-[76px] right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-[480px] p-4"
                >
                  {/* Title */}
                  <h3 className="text-sm font-medium text-black mb-4">Invite team members</h3>
                  
                  {/* Content wrapper with grey rounded borders */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    {/* Top section */}
                    <div className="space-y-3 mb-4">
                    {emailInputs.map((emailInput) => (
                      <div key={emailInput.id} className="flex items-center gap-2">
                        {/* Email input with envelope icon */}
                        <div className="flex-1 relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <EnvelopeIcon />
                          </div>
                          <input
                            type="email"
                            value={emailInput.email}
                            onChange={(e) => handleEmailChange(emailInput.id, e.target.value)}
                            placeholder="Work email e.g. john@company.com"
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:border-black focus:border-[2px] placeholder-gray-500"
                          />
                        </div>
                        
                        {/* Role dropdown */}
                        <div className="relative" id={`dropdown-${emailInput.id}`}>
                          <button
                            type="button"
                            onClick={() => handleDropdownToggle(emailInput.id)}
                            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-3 pr-2 text-sm focus:outline-none focus:border-black focus:border-[2px] cursor-pointer w-24 text-left flex items-center justify-between"
                          >
                            <span className="capitalize text-black">{emailInput.role}</span>
                            <DropdownIcon />
                          </button>
                          
                          {/* Custom dropdown menu */}
                          {openDropdownId === emailInput.id && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                              {(['viewer', 'editor', 'admin'] as const).map((role) => (
                                <button
                                  key={role}
                                  type="button"
                                  onClick={() => handleRoleSelect(emailInput.id, role)}
                                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors capitalize cursor-pointer ${
                                    emailInput.role === role ? 'bg-gray-50 text-black' : 'text-black'
                                  } ${role === 'viewer' ? 'rounded-t-md' : role === 'admin' ? 'rounded-b-md' : ''}`}
                                >
                                  {role}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Delete button or placeholder space */}
                        {emailInput.id === '1' ? (
                          emailInputs.length > 1 ? (
                            <div className="w-10 h-10 flex items-center justify-center">
                              {/* Empty placeholder to maintain consistent spacing when multiple inputs exist */}
                            </div>
                          ) : null
                        ) : (
                          <button
                            onClick={() => deleteEmailInput(emailInput.id)}
                            className="w-10 h-10 p-2 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                            title="Delete this email input"
                          >
                            <GarbageIcon />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  
                   
                   {/* Horizontal line */}
                   <div className="border-t border-gray-200 mb-4 -mx-4"></div>
                   
                                      {/* Bottom section */}
                   <div className="flex justify-between items-center">
                     <button
                       onClick={addEmailInput}
                       className="text-black hover:text-gray-800 text-sm font-medium flex items-center gap-1 border border-gray-300 hover:border-gray-400 rounded px-3 py-2 transition-colors cursor-pointer"
                     >
                       <PlusIcon />
                       <span>Add another</span>
                     </button>
                     
                     {/* Right side container with link and invite buttons */}
                     <div className="flex items-center gap-2">
                       <button className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                         <LinkIcon />
                       </button>
                       <button className="bg-black text-white hover:bg-gray-800 rounded px-4 py-2 text-sm font-medium transition-colors cursor-pointer">
                         Invite
                       </button>
                     </div>
                   </div>
                  </div>
                </div>
              )}
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerateClick}
              className="bg-black text-white hover:bg-gray-800 rounded-[7px] px-3 py-1.5 flex items-center h-8 border cursor-pointer"
            >
              <span className="text-sm font-normal">Generate</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Play Modal */}
      <PlayModal 
        isOpen={isPlayModalOpen} 
        onClose={() => setIsPlayModalOpen(false)} 
        title={videoTitle}
      />

      {/* Generate Modal */}
      <GenerateModal 
        isOpen={isGenerateModalOpen} 
        onClose={() => setIsGenerateModalOpen(false)} 
        title={videoTitle}
        onGenerationStart={handleVideoGeneration}
        selectedAvatar={selectedAvatar}
        selectedVariant={selectedVariant}
        onAvatarSelect={handleAvatarSelect}
        generationStatus={generationStatus}
        generationError={generationError}
      />

      {/* Generation Completed Modal */}
      <GenerationCompletedModal
        isOpen={isGenerationCompletedModalOpen}
        onClose={() => setIsGenerationCompletedModalOpen(false)}
        videoTitle={videoTitle}
        generationStatus={generationStatus}
        generationProgress={generationProgress}
        generationJobId={generationJobId}
        generationError={generationError}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </header>
  );
}