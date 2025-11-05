"use client";

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X } from 'lucide-react';

interface ApplyAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplyAvatarModal({
  isOpen,
  onClose,
}: ApplyAvatarModalProps) {
  const { t } = useLanguage();
  const [selectedAction, setSelectedAction] = React.useState<'add' | 'replace'>('add');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurry Background overlay */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal content with semi-transparent background */}
      <div 
        className="relative shadow-xl w-[650px] max-w-[95vw] flex flex-col z-10"
        style={{ 
          borderRadius: '12px', 
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors z-20 cursor-pointer"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Header */}
        <div className="p-8">
          <div className="flex justify-center items-center">
            <h2 className="text-xl font-medium text-[#171718]">
              {t('applyAvatarModal.title', 'Apply avatar to all scenes')}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Toggle buttons */}
          <div className="flex gap-1 px-1 py-1.5 rounded-lg mb-6 mx-auto" style={{ backgroundColor: '#F4F4F5', maxWidth: '400px' }}>
            <button
              onClick={() => setSelectedAction('add')}
              className="flex-1 px-4 py-1.5 text-md rounded-lg transition-all"
              style={{
                backgroundColor: selectedAction === 'add' ? 'white' : 'transparent',
                boxShadow: selectedAction === 'add' ? '0px 1px 3px 0px #0000001A, 0px 1px 2px -1px #0000001A' : 'none',
                color: selectedAction === 'add' ? '#171718' : '#878787'
              }}
            >
              {t('applyAvatarModal.addToAllScenes', 'Add to all scenes')}
            </button>
            <button
              onClick={() => setSelectedAction('replace')}
              className="flex-1 px-4 py-1.5 text-md rounded-lg transition-all"
              style={{
                backgroundColor: selectedAction === 'replace' ? 'white' : 'transparent',
                boxShadow: selectedAction === 'replace' ? '0px 1px 3px 0px #0000001A, 0px 1px 2px -1px #0000001A' : 'none',
                color: selectedAction === 'replace' ? '#171718' : '#878787'
              }}
            >
              {t('applyAvatarModal.replaceOnAllScenes', 'Replace on all scenes')}
            </button>
          </div>

          {/* Visual representation */}
          <div className="rounded-lg p-6 mb-6 relative mx-auto" style={{ backgroundColor: '#F4F4F5', maxWidth: '400px' }}>
            <div className="flex items-center justify-center gap-2 relative">
              {/* Left rectangle */}
              <div 
                className="w-32 h-18 rounded-sm flex items-center justify-end"
                style={{ 
                  backgroundColor: 'white',
                  border: '1px solid #E0E0E0'
                }}
              >
                {/* Circle for avatar - only visible when replace is selected */}
                {selectedAction === 'replace' && (
                  <div
                    className="rounded-full"
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '1px solid #E0E0E0',
                      marginRight: '8px'
                    }}
                  />
                )}
              </div>
              
              {/* Right rectangle */}
              <div 
                className="w-32 h-18 rounded-sm flex items-center justify-center"
                style={{ 
                  backgroundColor: 'white',
                  border: '1px solid #E0E0E0'
                }}
              >
                {/* Circle for avatar */}
                <div
                  className="rounded-full"
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '1px solid #E0E0E0',
                    marginLeft: '58px'
                  }}
                />
              </div>

              {/* Overlapping circle with arrow - positioned absolute to overlap */}
              <div 
                className="absolute flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0px 10px 10px 0px #0000001A, 0px 4px 4px 0px #0000000D, 0px 1px 0px 0px #0000000D',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.09082 3.70898L13.3574 7.97559C13.3703 7.98854 13.3702 8.00942 13.3574 8.02246L9.09082 12.2891C9.0778 12.3021 9.05697 12.3021 9.04395 12.2891C9.03094 12.276 9.0309 12.2552 9.04395 12.2422L12.3994 8.88574L13.2529 8.03223H2.66699C2.64865 8.03216 2.63379 8.01739 2.63379 7.99902C2.6339 7.98075 2.64871 7.96589 2.66699 7.96582H13.2529L12.3994 7.1123L9.04395 3.75586C9.0374 3.74932 9.03415 3.74099 9.03418 3.73242L9.04395 3.70898C9.05049 3.70254 9.05885 3.69915 9.06738 3.69922L9.09082 3.70898Z" fill="#0F58F9" stroke="#0F58F9"/>
                </svg>
              </div>
            </div>
            
            {/* Description text */}
            <div className="text-center text-sm mt-4" style={{ color: '#171718' }}>
              {selectedAction === 'add' ? (
                <>
                  You are going to add <span className="font-semibold">Riley</span> to all your <span className="font-semibold">3 scenes</span>
                </>
              ) : (
                <>
                  You are going to replace avatars with <span className="font-semibold">Riley</span> on <span className="font-semibold">0 scene</span> overall
                </>
              )}
            </div>
          </div>

          {/* Modal content will go here */}
          
          {/* Bottom buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="bg-white px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium text-xs cursor-pointer"
              style={{ border: '1px solid #719AF5', color: '#719AF5' }}
            >
              {t('applyAvatarModal.cancel', 'Cancel')}
            </button>
            <button 
              onClick={() => {
                // TODO: Implement apply functionality
                console.log('Apply avatar to all scenes');
                onClose();
              }}
              className="px-4 py-2 rounded-md transition-colors font-medium text-xs flex items-center gap-2 text-white hover:bg-[#0D4CD4] cursor-pointer"
              style={{ backgroundColor: '#0F58F9' }}
            >
              {t('applyAvatarModal.apply', 'Apply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

