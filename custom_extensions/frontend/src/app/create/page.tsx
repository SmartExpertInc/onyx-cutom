"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { Home as HomeIcon } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import { CustomCard } from "@/components/ui/custom-card";
import { HeadTextCustom } from "@/components/ui/head-text-custom";
import { FeedbackButton } from "@/components/ui/feedback-button";
import { trackCreateProduct } from "../../lib/mixpanelClient"

// ---------------------------------------------------------------------------
// Card shown on the landing page. It tries to mimic the folder-looking cards
// from the reference screenshot (image header + label area).
// ---------------------------------------------------------------------------
interface OptionCardProps {
  Icon: React.ElementType;
  title: string;
  description: string;
  href?: string;
  disabled?: boolean;
  pillLabel?: string;
  gradientFrom: string;
  gradientTo: string;
  iconColor: string;
  labelColor: string;
}

const ImportIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="11.333" y="7.00012" width="37.3333" height="18.6667" rx="6.22222" fill="#90EDE5"/>
  <foreignObject x="-7.33333" y="3.88847" width="74.6667" height="59.1111"><div style={{backdropFilter:'blur(4.67px)',clipPath:'url(#bgblur_0_308_18707_clip_path)',height:'100%',width:'100%'}}></div></foreignObject><g filter="url(#filter0_i_308_18707)" data-figma-bg-blur-radius="9.33333">
  <rect x="2" y="13.2218" width="56" height="40.4444" rx="9.33333" fill="#90EDE5" fill-opacity="0.6"/>
  </g>
  <g filter="url(#filter1_i_308_18707)">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M30.0001 19.4445C31.7183 19.4445 33.1112 20.8373 33.1112 22.5556V36.8225L37.1336 32.8001C38.3485 31.5852 40.3184 31.5852 41.5333 32.8001C42.7483 34.0151 42.7483 35.9849 41.5333 37.1999L32.2 46.5332C30.985 47.7482 29.0152 47.7482 27.8002 46.5332L18.4669 37.1999C17.2519 35.9849 17.2519 34.0151 18.4669 32.8001C19.6819 31.5852 21.6517 31.5852 22.8667 32.8001L26.889 36.8225V22.5556C26.889 20.8373 28.2819 19.4445 30.0001 19.4445Z" fill="white"/>
  </g>
  <defs>
  <filter id="filter0_i_308_18707" x="-7.33333" y="3.88847" width="74.6667" height="59.1111" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="1.55556"/>
  <feGaussianBlur stdDeviation="3.11111"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_308_18707"/>
  </filter>
  <clipPath id="bgblur_0_308_18707_clip_path" transform="translate(7.33333 -3.88847)"><rect x="2" y="13.2218" width="56" height="40.4444" rx="9.33333"/>
  </clipPath><filter id="filter1_i_308_18707" x="17.5557" y="19.4445" width="24.8887" height="29.5556" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="1.55556"/>
  <feGaussianBlur stdDeviation="0.777778"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_308_18707"/>
  </filter>
  </defs>
  </svg>
);

const GenerateIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30.5" cy="30.5" r="16.5625" fill="#0F58F9"/>
  <foreignObject x="-5.9375" y="-5.9375" width="72.875" height="72.875"><div style={{backdropFilter:'blur(4.97px)',clipPath:'url(#bgblur_0_308_18688_clip_path)',height:'100%',width:'100%'}}></div></foreignObject><g filter="url(#filter0_i_308_18688)" data-figma-bg-blur-radius="9.9375">
  <path d="M4 10.625C4 6.96611 6.96611 4 10.625 4H20.5625C24.2214 4 27.1875 6.96611 27.1875 10.625V20.5625C27.1875 24.2214 24.2214 27.1875 20.5625 27.1875H10.625C6.96611 27.1875 4 24.2214 4 20.5625V10.625Z" fill="#0F58F9" fill-opacity="0.6"/>
  <path d="M4 40.4375C4 36.7786 6.96611 33.8125 10.625 33.8125H20.5625C24.2214 33.8125 27.1875 36.7786 27.1875 40.4375V50.375C27.1875 54.0339 24.2214 57 20.5625 57H10.625C6.96611 57 4 54.0339 4 50.375V40.4375Z" fill="#0F58F9" fill-opacity="0.6"/>
  <path d="M33.8125 10.625C33.8125 6.96611 36.7786 4 40.4375 4H50.375C54.0339 4 57 6.96611 57 10.625V20.5625C57 24.2214 54.0339 27.1875 50.375 27.1875H40.4375C36.7786 27.1875 33.8125 24.2214 33.8125 20.5625V10.625Z" fill="#0F58F9" fill-opacity="0.6"/>
  <path d="M33.8125 40.4375C33.8125 36.7786 36.7786 33.8125 40.4375 33.8125H50.375C54.0339 33.8125 57 36.7786 57 40.4375V50.375C57 54.0339 54.0339 57 50.375 57H40.4375C36.7786 57 33.8125 54.0339 33.8125 50.375V40.4375Z" fill="#0F58F9" fill-opacity="0.6"/>
  </g>
  <defs>
  <filter id="filter0_i_308_18688" x="-5.9375" y="-5.9375" width="72.875" height="72.875" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="1.65625"/>
  <feGaussianBlur stdDeviation="3.3125"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_308_18688"/>
  </filter>
  <clipPath id="bgblur_0_308_18688_clip_path" transform="translate(5.9375 5.9375)"><path d="M4 10.625C4 6.96611 6.96611 4 10.625 4H20.5625C24.2214 4 27.1875 6.96611 27.1875 10.625V20.5625C27.1875 24.2214 24.2214 27.1875 20.5625 27.1875H10.625C6.96611 27.1875 4 24.2214 4 20.5625V10.625Z"/>
  <path d="M4 40.4375C4 36.7786 6.96611 33.8125 10.625 33.8125H20.5625C24.2214 33.8125 27.1875 36.7786 27.1875 40.4375V50.375C27.1875 54.0339 24.2214 57 20.5625 57H10.625C6.96611 57 4 54.0339 4 50.375V40.4375Z"/>
  <path d="M33.8125 10.625C33.8125 6.96611 36.7786 4 40.4375 4H50.375C54.0339 4 57 6.96611 57 10.625V20.5625C57 24.2214 54.0339 27.1875 50.375 27.1875H40.4375C36.7786 27.1875 33.8125 24.2214 33.8125 20.5625V10.625Z"/>
  <path d="M33.8125 40.4375C33.8125 36.7786 36.7786 33.8125 40.4375 33.8125H50.375C54.0339 33.8125 57 36.7786 57 40.4375V50.375C57 54.0339 54.0339 57 50.375 57H40.4375C36.7786 57 33.8125 54.0339 33.8125 50.375V40.4375Z"/>
  </clipPath></defs>
  </svg>
);

const TextIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18.5833 6.91711C20.1942 6.91711 21.5 8.22295 21.5 9.83378L21.5 50.6671C21.5 52.2779 20.1942 53.5838 18.5833 53.5838L9.83333 53.5838C6.61167 53.5838 4 50.9721 4 47.7504L4 12.7504C4 9.52879 6.61167 6.91711 9.83333 6.91711L18.5833 6.91711Z" fill="#D817FF"/>
  <foreignObject x="9.83301" y="-4.74988" width="55.417" height="70"><div style={{backdropFilter:'blur(4.38px)',clipPath:'url(#bgblur_0_308_18673_clip_path)',height:'100%',width:'100%'}}></div></foreignObject><g filter="url(#filter0_i_308_18673)" data-figma-bg-blur-radius="8.75">
  <path d="M18.583 9.83346C18.583 7.0836 18.583 5.70867 19.4373 4.85439C20.2916 4.00012 21.6665 4.00012 24.4163 4.00012H44.833C50.3327 4.00012 53.0826 4.00012 54.7911 5.70867C56.4997 7.41721 56.4997 10.1671 56.4997 15.6668V44.8335C56.4997 50.3332 56.4997 53.083 54.7911 54.7916C53.0826 56.5001 50.3327 56.5001 44.833 56.5001H24.4163C21.6665 56.5001 20.2916 56.5001 19.4373 55.6459C18.583 54.7916 18.583 53.4166 18.583 50.6668V9.83346Z" fill="#D817FF" fill-opacity="0.6"/>
  </g>
  <g filter="url(#filter1_i_308_18673)">
  <rect x="24.417" y="15.667" width="17.5" height="5.83333" rx="2.91667" fill="white"/>
  </g>
  <g filter="url(#filter2_i_308_18673)">
  <rect x="24.417" y="27.3331" width="26.25" height="5.83333" rx="2.91667" fill="white"/>
  </g>
  <g filter="url(#filter3_i_308_18673)">
  <rect x="24.417" y="39.0002" width="26.25" height="5.83333" rx="2.91667" fill="white"/>
  </g>
  <defs>
  <filter id="filter0_i_308_18673" x="9.83301" y="-4.74988" width="55.417" height="70" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="1.45833"/>
  <feGaussianBlur stdDeviation="2.91667"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_308_18673"/>
  </filter>
  <clipPath id="bgblur_0_308_18673_clip_path" transform="translate(-9.83301 4.74988)"><path d="M18.583 9.83346C18.583 7.0836 18.583 5.70867 19.4373 4.85439C20.2916 4.00012 21.6665 4.00012 24.4163 4.00012H44.833C50.3327 4.00012 53.0826 4.00012 54.7911 5.70867C56.4997 7.41721 56.4997 10.1671 56.4997 15.6668V44.8335C56.4997 50.3332 56.4997 53.083 54.7911 54.7916C53.0826 56.5001 50.3327 56.5001 44.833 56.5001H24.4163C21.6665 56.5001 20.2916 56.5001 19.4373 55.6459C18.583 54.7916 18.583 53.4166 18.583 50.6668V9.83346Z"/>
  </clipPath><filter id="filter1_i_308_18673" x="24.417" y="15.667" width="17.5" height="7.29171" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="1.45833"/>
  <feGaussianBlur stdDeviation="0.729167"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_308_18673"/>
  </filter>
  <filter id="filter2_i_308_18673" x="24.417" y="27.3331" width="26.25" height="7.29171" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="1.45833"/>
  <feGaussianBlur stdDeviation="0.729167"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_308_18673"/>
  </filter>
  <filter id="filter3_i_308_18673" x="24.417" y="39.0002" width="26.25" height="7.29171" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="1.45833"/>
  <feGaussianBlur stdDeviation="0.729167"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_308_18673"/>
  </filter>
  </defs>
  </svg>
);

const OptionCard: React.FC<OptionCardProps> = ({
  Icon,
  title,
  description,
  href,
  disabled,
  pillLabel,
  gradientFrom: _gradientFrom,
  gradientTo: _gradientTo,
  iconColor,
  labelColor,
}: OptionCardProps) => {
  const router = useRouter();
  
  const handleClick = (e: React.MouseEvent) => {
    if (disabled || !href) return;
    
    // Check if we have lesson/quiz/text-presentation context in sessionStorage
    try {
      const lessonContextData = sessionStorage.getItem('lessonContext');
      if (lessonContextData) {
        const lessonContext = JSON.parse(lessonContextData);
        // Check if data is recent (within 1 hour)
        if (lessonContext.timestamp && (Date.now() - lessonContext.timestamp < 3600000)) {
          e.preventDefault();
          
          // Build URL with lesson/quiz/text-presentation parameters
          const params = new URLSearchParams();
          Object.entries(lessonContext).forEach(([key, value]) => {
            if (key !== 'timestamp') {
              params.set(key, String(value));
            }
          });
          
          const targetUrl = `${href}?${params.toString()}`;
          router.push(targetUrl);
          return;
        }
      }
    } catch (error) {
      console.error('Error handling lesson/quiz/text-presentation context:', error);
    }
    
    // Fallback to normal navigation
  };

  return (
    <CustomCard
      Icon={Icon}
      title={title}
      description={description}
      pillLabel={pillLabel}
      iconColor={iconColor}
      labelColor={labelColor}
      disabled={disabled}
      href={href}
      onClick={handleClick}
    />
  );
};

// Component to handle URL parameters and pass them to all creation paths
function CreatePageHandler() {
  const searchParams = useSearchParams();

  // Store lesson/quiz/text-presentation parameters in sessionStorage for use across all creation paths
  useEffect(() => {
    const product = searchParams?.get('product');
    const lessonType = searchParams?.get('lessonType');
    const lessonTitle = searchParams?.get('lessonTitle');
    const moduleName = searchParams?.get('moduleName');
    const lessonNumber = searchParams?.get('lessonNumber');
    const folderId = searchParams?.get('folderId');

    if ((product === 'lesson' || product === 'quiz' || product === 'text-presentation') && lessonType && lessonTitle && moduleName && lessonNumber) {
      // Store lesson/quiz/text-presentation context in sessionStorage for use across all creation paths
      const lessonContext = {
        product: product,
        lessonType: lessonType,
        lessonTitle: lessonTitle,
        moduleName: moduleName,
        lessonNumber: lessonNumber,
        timestamp: Date.now()
      };
      sessionStorage.setItem('lessonContext', JSON.stringify(lessonContext));
    } else {
      // If no lesson/quiz/text-presentation parameters are present, clear any existing context
      // This ensures that if user navigates directly to /create, they don't carry over old context
      try {
        sessionStorage.removeItem('lessonContext');
        sessionStorage.removeItem('lessonContextForDropdowns');
        sessionStorage.removeItem('activeProductType');
        sessionStorage.removeItem('stylesState');
      } catch (error) {
        console.error('Error clearing lesson context:', error);
      }
    }

    // Store folder context if present
    if (folderId) {
      const folderContext = {
        folderId: folderId,
        timestamp: Date.now()
      };
      sessionStorage.setItem('folderContext', JSON.stringify(folderContext));
    } else {
      // Clear folder context if not present
      try {
        sessionStorage.removeItem('folderContext');
      } catch (error) {
        console.error('Error clearing folder context:', error);
      }
    }
  }, [searchParams]);

  return null;
}

export default function DataSourceLanding() {
  const { t } = useLanguage();

  const handleCreateProductEnd = () => {
    // Check if a "Failed" event has already been tracked
    try {
      const hasFailed = sessionStorage.getItem('createProductFailed');
      if (hasFailed === 'true') {
        // Don't track "Clicked" if "Failed" was already tracked
        return;
      }
    } catch (error) {
      console.error('Error checking failed state:', error);
    }
    
    trackCreateProduct("Clicked", sessionStorage.getItem('lessonContext') != null ? true : false);
  };

  return (
    <>
      <Suspense fallback={null}>
        <CreatePageHandler />
      </Suspense>
      <Suspense fallback={
        <main className="min-h-screen flex flex-col items-center pt-24 pb-20 px-6 bg-white">
          <div className="w-full max-w-6xl flex flex-col gap-10 items-center">
            <HeadTextCustom
              text={t('interface.createWithAI', 'Create with AI')}
              description={t('interface.howToGetStarted', 'How would you like to get started?')}
              className="max-w-2xl"
            />
          </div>
        </main>
      }>
        <CreatePageContent onHomeClick={handleCreateProductEnd} />
      </Suspense>
    </>
  );
}

type CreatePageContentProps = { onHomeClick: () => void };

function CreatePageContent({ onHomeClick }: CreatePageContentProps) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  // Check if we have lesson/quiz/text-presentation parameters from course outline
  const product = searchParams?.get('product');
  const lessonType = searchParams?.get('lessonType');
  const lessonTitle = searchParams?.get('lessonTitle');
  const moduleName = searchParams?.get('moduleName');
  const lessonNumber = searchParams?.get('lessonNumber');

  const isFromCourseOutline = product && lessonType && lessonTitle && moduleName && lessonNumber;

  // Map product types to display names
  const getProductDisplayName = (product: string, _lessonType: string) => {
    switch (product) {
      case 'lesson':
        return 'Presentation';
      case 'quiz':
        return 'Quiz';
      case 'text-presentation':
        return 'One-Pager';
      case 'video-lesson':
        return 'Video Lesson';
      default:
        return 'Content';
    }
  };

  const productDisplayName = isFromCourseOutline ? getProductDisplayName(product, lessonType) : '';
  const title = isFromCourseOutline 
    ? `Create ${productDisplayName} with AI`
    : t('interface.createWithAI', 'Create with AI');
  const description = isFromCourseOutline
    ? 'How would you like to proceed?'
    : t('interface.howToGetStarted', 'How would you like to get started?');

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 bg-white relative overflow-hidden"
    >
      {/* Decorative gradient background */}
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '1100px',
          height: '2100px',
          left: '60%',
          top: '60%',
          borderRadius: '999px',
          background: 'linear-gradient(360deg, #90EDE5 10%, #5D72F4 70%, #D817FF 100%)',
          transform: 'translate(-50%, -50%) rotate(120deg)',
          filter: 'blur(100px)',
        }}
      />
      
      {/* Top-left back button */}
      <Link
        href="/projects"
        onClick={onHomeClick}
        className="absolute top-6 left-6 flex items-center gap-1 text-sm rounded-lg px-3 py-1 backdrop-blur-sm transition-all duration-200 border border-white/60 shadow-md hover:shadow-xl active:shadow-xl transition-shadow cursor-pointer z-10"
        style={{ 
          color: '#000000',
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.5))'
        }}
      >
        <span>&lt;</span>
        <span>{t('interface.generate.back', 'Back')}</span>
      </Link>

      {/* Main content */}
      <div className="w-full max-w-6xl flex flex-col gap-10 items-center relative z-10">
        {/* Headings */}
        <HeadTextCustom
          text={title}
          description={description}
          className="max-w-2xl"
        />

        {/* Option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16 w-full max-w-6xl">
          <OptionCard
            Icon={TextIcon}
            title={t('interface.pasteInText', 'Paste in text')}
            description={t('interface.pasteInTextDescription', 'Create from notes, an outline, or existing content')}
            href="/create/paste-text-new"
            gradientFrom="from-blue-300"
            gradientTo="to-purple-200"
            iconColor="text-blue-600"
            labelColor="text-blue-600"
          />
          <OptionCard
            Icon={GenerateIcon}
            title={t('interface.generate.title', 'Generate')}
            description={t('interface.generateDescription', 'Create from a one-line prompt in a few seconds')}
            href="/create/generate"
            pillLabel={t('interface.popular', 'Popular')}
            gradientFrom="from-orange-300"
            gradientTo="to-pink-200"
            iconColor="text-orange-600"
            labelColor="text-orange-600"
          />
          <OptionCard
            Icon={ImportIcon}
            title={t('interface.importFileOrUrl', 'Create from files')}
            description={t('interface.importFileOrUrlDescription', 'Enhance existing docs, presentations, or webpages')}
            href="/create/from-files-new"
            gradientFrom="from-purple-300"
            gradientTo="to-pink-200"
            iconColor="text-purple-600"
            labelColor="text-purple-600"
          />
        </div>

      </div>

      <FeedbackButton />
    </main>
  );
} 