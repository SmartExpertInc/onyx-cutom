"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { FileText, Sparkles, UploadCloud, Home as HomeIcon } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";

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
  pillLabel?: string; // e.g. "POPULAR"
}

const OptionCard: React.FC<OptionCardProps> = ({
  Icon,
  title,
  description,
  href,
  disabled,
  pillLabel,
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

  // Card content shared by both link and non-link versions
  const cardContent = (
    <div
      className={`flex flex-col items-center justify-start rounded-xl overflow-hidden border transition-colors shadow-sm w-full h-full text-center ${
        disabled
          ? "bg-white text-gray-400 cursor-not-allowed border-gray-300 shadow-none"
          : "bg-white hover:bg-gray-50 text-gray-900 cursor-pointer border-gray-200"
      }`}
    >
      {/* "Folder" header */}
      <div className="w-full h-28 bg-gradient-to-tr from-indigo-300/60 to-pink-200/60 flex items-center justify-center relative">
        <Icon size={40} className="text-white drop-shadow-md" />
        {pillLabel && (
          <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-white text-indigo-600 rounded-md px-1.5 py-0.5 shadow">
            {pillLabel}
          </span>
        )}
      </div>
      {/* Text area */}
      <div className="flex flex-col items-center gap-1 px-4 py-5">
        <h3 className="font-semibold text-base sm:text-lg leading-tight text-gray-900">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xs leading-normal">
          {description}
        </p>
      </div>
    </div>
  );

  if (disabled || !href) return cardContent;
  return <Link href={href} onClick={handleClick}>{cardContent}</Link>;
};

// Component to handle URL parameters and pass them to all creation paths
function CreatePageHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  return (
    <>
      <Suspense fallback={null}>
        <CreatePageHandler />
      </Suspense>
      <main
        className="min-h-screen flex flex-col items-center pt-24 pb-20 px-6"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)",
        }}
      >
      {/* Top-left home button */}
      <Link
        href="/projects"
        className="absolute top-6 left-6 flex items-center gap-1 text-sm text-black hover:text-black-hover rounded-full px-3 py-1 border border-gray-300 bg-white"
      >
        {/* Home icon */}
        <HomeIcon size={14} className="-ml-0.5" />
        {t('interface.home', 'Home')}
      </Link>

      {/* Main content */}
      <div className="w-full max-w-4xl flex flex-col gap-10 items-center">
        {/* Headings */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">{t('interface.createWithAI', 'Create with AI')}</h1>
          <p className="text-base sm:text-lg text-gray-600">{t('interface.howToGetStarted', 'How would you like to get started?')}</p>
        </div>

        {/* Option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <OptionCard
            Icon={FileText}
            title={t('interface.pasteInText', 'Paste in text')}
            description={t('interface.pasteInTextDescription', 'Create from notes, an outline, or existing content')}
            href="/create/paste-text"
          />
          <OptionCard
            Icon={Sparkles}
            title={t('interface.generate.title', 'Generate')}
            description={t('interface.generateDescription', 'Create from a one-line prompt in a few seconds')}
            href="/create/generate"
            pillLabel={t('interface.popular', 'POPULAR')}
          />
          <OptionCard
            Icon={UploadCloud}
            title={t('interface.importFileOrUrl', 'Import file or URL')}
            description={t('interface.importFileOrUrlDescription', 'Enhance existing docs, presentations, or webpages')}
            href="/create/from-files"
          />
        </div>

        {/* Recent prompts section removed as per request */}
      </div>
    </main>
    </>
  );
} 