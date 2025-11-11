'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function PlayModal({ isOpen, onClose, title = 'Create your first AI video' }: PlayModalProps) {
  const { t } = useLanguage();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div 
        className="relative shadow-xl w-[85vw] h-[80vh] flex flex-col z-10"
        style={{ borderRadius: '12px', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors z-20 cursor-pointer"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Main content area */}
          <div className="flex gap-4 mb-10">
            {/* Left div with grey background - 70% width */}
            <div className="flex-1 bg-gray-200 rounded-lg min-h-[450px] flex items-center justify-center">
              <span className="text-gray-500">{t('modals.play.videoPreviewArea', 'Video preview area')}</span>
            </div>
            
            {/* Right div with content */}
            <div className="w-[400px] flex-shrink-0 flex flex-col">
              {/* Grey badges */}
              <div className="flex gap-2 mb-4">
                <span className="bg-gray-200 text-[#171718] px-3 py-2 rounded-sm text-[10px] font-medium flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.33301 7.66667V3.33333C1.33301 2.6 1.93301 2 2.66634 2H5.28634C5.50595 2.00114 5.72188 2.0565 5.91494 2.16117C6.10801 2.26585 6.27222 2.41659 6.39301 2.6L6.93967 3.4C7.06046 3.58341 7.22468 3.73415 7.41774 3.83883C7.6108 3.9435 7.82673 3.99886 8.04634 4H13.333C13.6866 4 14.0258 4.14048 14.2758 4.39052C14.5259 4.64057 14.6663 4.97971 14.6663 5.33333V12C14.6663 12.3536 14.5259 12.6928 14.2758 12.9428C14.0258 13.1929 13.6866 13.3333 13.333 13.3333H6.99967M5.61301 7.07333C5.74302 6.94332 5.89736 6.8402 6.06722 6.76984C6.23709 6.69948 6.41915 6.66326 6.60301 6.66326C6.78687 6.66326 6.96893 6.69948 7.13879 6.76984C7.30866 6.8402 7.463 6.94332 7.59301 7.07333C7.72302 7.20334 7.82614 7.35768 7.8965 7.52755C7.96687 7.69741 8.00308 7.87947 8.00308 8.06333C8.00308 8.24719 7.96687 8.42925 7.8965 8.59912C7.82614 8.76898 7.72302 8.92332 7.59301 9.05333L3.96634 12.6667L1.33301 13.3333L1.99301 10.7L5.61301 7.07333Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('modals.play.draft', 'Draft')}
                </span>
                <span className="bg-gray-200 text-[#171718] px-3 py-2 rounded-sm text-[10px] font-medium flex items-center gap-2">
                  <svg width="17" height="10" viewBox="0 0 17 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="0.5" width="16" height="9" rx="2" stroke="#171718"/>
                  </svg>
                  16:9
                </span>
              </div>
              
              <h3 className="text-3xl font-semibold text-gray-900 mb-4 leading-tight">{title}</h3>
              
              {/* Buttons */}
              <div className="flex gap-3 mb-4">
                <button className="bg-white px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium text-xs whitespace-nowrap cursor-pointer" style={{ border: '1px solid #719AF5', color: '#719AF5' }}>
                  {t('modals.play.cancel', 'Cancel')}
                </button>
                <button className="px-3 py-2 rounded-md transition-colors font-medium flex items-center justify-center gap-2 text-xs whitespace-nowrap text-white cursor-pointer" style={{ backgroundColor: '#0F58F9', border: '1px solid #0F58F9' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.5423 11.3905C11.1071 11.557 10.8704 11.7949 10.702 12.2294C10.5353 11.7949 10.297 11.5586 9.86183 11.3905C10.297 11.2241 10.5337 10.9877 10.702 10.5517C10.8688 10.9861 11.1071 11.2224 11.5423 11.3905ZM10.7628 4.58943C11.1399 3.18725 11.6552 2.67169 13.0612 2.29471C11.6568 1.91825 11.1404 1.40376 10.7628 0C10.3858 1.40218 9.87044 1.91774 8.46442 2.29471C9.86886 2.67118 10.3852 3.18567 10.7628 4.58943ZM11.1732 7.48356C11.1732 7.35145 11.1044 7.19195 10.9118 7.13825C9.33637 6.69842 8.34932 6.19628 7.61233 5.4611C6.8754 4.72536 6.37139 3.73983 5.93249 2.1669C5.8787 1.97464 5.71894 1.9059 5.58662 1.9059C5.4543 1.9059 5.29454 1.97464 5.24076 2.1669C4.80022 3.73983 4.29727 4.7253 3.56092 5.4611C2.82291 6.19793 1.83688 6.70005 0.261415 7.13825C0.0688515 7.19195 0 7.35146 0 7.48356C0 7.61567 0.0688515 7.77518 0.261415 7.82888C1.83688 8.26871 2.82393 8.77085 3.56092 9.50602C4.29892 10.2428 4.80186 11.2273 5.24076 12.8002C5.29455 12.9925 5.45431 13.0612 5.58662 13.0612C5.71895 13.0612 5.87871 12.9925 5.93249 12.8002C6.37303 11.2273 6.87598 10.2418 7.61233 9.50602C8.35034 8.7692 9.33637 8.26707 10.9118 7.82888C11.1044 7.77517 11.1732 7.61567 11.1732 7.48356Z" fill="white"/>
                  </svg>
                  {t('modals.play.generate', 'Generate')}
                </button>
              </div>
              
              {/* Blue info box */}
              <div className="rounded-lg p-4 mt-auto max-w-[340px]" style={{ backgroundColor: '#CCDBFC' }}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_1339_30531)">
                        <path d="M8 1.43359C11.6253 1.43365 14.5645 4.37269 14.5645 7.99805C14.5644 11.6234 11.6253 14.5624 8 14.5625C4.37465 14.5625 1.4356 11.6234 1.43555 7.99805C1.43555 4.37266 4.37461 1.43359 8 1.43359ZM8 1.44727C4.38197 1.44727 1.44922 4.38003 1.44922 7.99805C1.44927 11.616 4.382 14.5488 8 14.5488C11.6179 14.5488 14.5507 11.6159 14.5508 7.99805C14.5508 4.38006 11.618 1.44732 8 1.44727ZM8 6.89844C8.01842 6.89844 8.0332 6.91322 8.0332 6.93164V11.165H9.09961V11.2314H6.90039V11.165H7.9668V6.96484H6.90039V6.89844H8ZM8 4.49805C8.16552 4.49809 8.2996 4.63237 8.2998 4.79785C8.2998 4.9635 8.16564 5.09859 8 5.09863C7.83432 5.09863 7.7002 4.96353 7.7002 4.79785C7.7004 4.63234 7.83444 4.49805 8 4.49805Z" fill="#171718" stroke="#171718"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_1339_30531">
                          <rect width="16" height="16" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[#171718] text-sm font-medium">
                      {t('modals.play.noLipMovements', 'The preview has no lip movements.')}
                    </p>
                    <p className="text-[#4D4D4D] text-sm leading-tight">
                      {t('modals.play.needGenerate', 'You need to generate the video to make it visible.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rating section */}
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-3 bg-[#FFFFFF] border border-[#E0E0E0] shadow-lg rounded-md px-3 py-3">
              <span className="text-[#171718] text-xs">{t('modals.play.rateQuality', "How's the video and voice quality?")}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="transition-colors hover:scale-110"
                    onClick={() => console.log(`Rated ${star} stars`)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                  >
                    <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.23047 1.01367L7.25195 1.06738L8.71582 4.58594C8.83392 4.86975 9.10084 5.06328 9.40723 5.08789L13.2061 5.39258L13.2637 5.39746L13.5059 5.41602L13.3213 5.5752L13.2773 5.61328L10.3838 8.09277C10.1503 8.29282 10.0478 8.60627 10.1191 8.90527L11.0029 12.6113L11.0039 12.6123L11.0166 12.6689L11.0723 12.9043L10.8652 12.7783L10.8154 12.748L7.56348 10.7617C7.30116 10.6017 6.97126 10.6016 6.70898 10.7617L3.45703 12.748L3.40723 12.7783L3.19922 12.9053L3.25586 12.668L3.26953 12.6113L4.15332 8.90527C4.22466 8.60628 4.12291 8.2928 3.88965 8.09277L0.995117 5.61328L0.951172 5.5752L0.765625 5.41602L1.00977 5.39746L1.06738 5.39258L4.86523 5.08789C5.17162 5.06333 5.43849 4.86971 5.55664 4.58594L7.02051 1.06738L7.04297 1.01367L7.13574 0.788086L7.23047 1.01367ZM6.6748 2.07227L5.61914 4.61133C5.49149 4.91824 5.20241 5.12763 4.87109 5.1543L2.12988 5.37402L0.931641 5.4707L1.84473 6.25293L3.93262 8.04199C4.18511 8.2583 4.29589 8.5975 4.21875 8.9209L3.58008 11.5957L3.30176 12.7646L4.32715 12.1387L6.67383 10.7051C6.95758 10.5318 7.31488 10.5318 7.59863 10.7051L9.94531 12.1387L10.9717 12.7646L10.6924 11.5957L10.0547 8.9209C9.97756 8.59758 10.0875 8.25831 10.3398 8.04199L12.4287 6.25293L13.3418 5.4707L12.1436 5.37402L9.40234 5.1543C9.07091 5.12772 8.78198 4.91833 8.6543 4.61133L7.59766 2.07227L7.13672 0.961914L6.6748 2.07227Z" fill="#171718" stroke="#171718"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[#878787] text-xs">{t('modals.play.helpImprove', 'Help us improve ContentBuilder')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
