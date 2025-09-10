"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { FileText, Sparkles, UploadCloud, Home as HomeIcon } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import { CustomCard } from "@/components/ui/custom-card";

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

const OptionCard: React.FC<OptionCardProps> = ({
  Icon,
  title,
  description,
  href,
  disabled,
  pillLabel,
  gradientFrom,
  gradientTo,
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
      gradientFrom={gradientFrom}
      gradientTo={gradientTo}
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
        className="min-h-screen flex flex-col items-center pt-24 pb-20 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      >
      {/* Top-left home button */}
      <Link
        href="/projects"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-full px-4 py-2 border border-gray-200 bg-white/60 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <HomeIcon size={16} />
        {t('interface.home', 'Home')}
      </Link>

      {/* Main content */}
      <div className="w-full max-w-4xl flex flex-col gap-10 items-center">
        {/* Headings */}
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
            {t('interface.createWithAI', 'Create with AI')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed">
            {t('interface.howToGetStarted', 'How would you like to get started?')}
          </p>
        </div>

        {/* Option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-5xl">
          <OptionCard
            Icon={FileText}
            title={t('interface.pasteInText', 'Paste in text')}
            description={t('interface.pasteInTextDescription', 'Create from notes, an outline, or existing content')}
            href="/create/paste-text"
            gradientFrom="from-blue-300"
            gradientTo="to-purple-200"
            iconColor="text-blue-600"
            labelColor="text-blue-600"
          />
          <OptionCard
            Icon={Sparkles}
            title={t('interface.generate.title', 'Generate')}
            description={t('interface.generateDescription', 'Create from a one-line prompt in a few seconds')}
            href="/create/generate"
            pillLabel={t('interface.popular', 'POPULAR')}
            gradientFrom="from-orange-300"
            gradientTo="to-pink-200"
            iconColor="text-orange-600"
            labelColor="text-orange-600"
          />
          <OptionCard
            Icon={UploadCloud}
            title={t('interface.importFileOrUrl', 'Import file or URL')}
            description={t('interface.importFileOrUrlDescription', 'Enhance existing docs, presentations, or webpages')}
            href="/create/from-files"
            gradientFrom="from-purple-300"
            gradientTo="to-pink-200"
            iconColor="text-purple-600"
            labelColor="text-purple-600"
          />
        </div>

        {/* Recent prompts section removed as per request */}
      </div>
    </main>
    </>
  );
} 