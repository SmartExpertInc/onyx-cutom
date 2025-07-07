"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { FileText, Sparkles, UploadCloud, Home as HomeIcon } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

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
  return <Link href={href}>{cardContent}</Link>;
};

// Component to handle URL parameters and redirects
function CreatePageHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle URL parameters for pre-selecting product and options
  useEffect(() => {
    const product = searchParams?.get('product');
    const lessonType = searchParams?.get('lessonType');
    const lessonTitle = searchParams?.get('lessonTitle');
    const moduleName = searchParams?.get('moduleName');
    const lessonNumber = searchParams?.get('lessonNumber');

    if (product === 'lesson' && lessonType && lessonTitle && moduleName && lessonNumber) {
      // Redirect to generate page with pre-selected lesson options
      const params = new URLSearchParams({
        product: 'lesson',
        lessonType: lessonType,
        lessonTitle: lessonTitle,
        moduleName: moduleName,
        lessonNumber: lessonNumber
      });
      
      router.push(`/create/generate?${params.toString()}`);
    }
  }, [searchParams, router]);

  return null;
}

export default function DataSourceLanding() {
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
        className="fixed top-4 left-4 flex items-center gap-1 text-sm font-medium bg-white/70 hover:bg-white text-gray-900 backdrop-blur rounded-full px-3 py-1 shadow border border-gray-200"
      >
        {/* Home icon */}
        <HomeIcon size={14} className="-ml-0.5" />
        Home
      </Link>

      {/* Main content */}
      <div className="w-full max-w-4xl flex flex-col gap-10 items-center">
        {/* Headings */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Create with AI</h1>
          <p className="text-base sm:text-lg text-gray-600">How would you like to get started?</p>
        </div>

        {/* Option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <OptionCard
            Icon={FileText}
            title="Paste in text"
            description="Create from notes, an outline, or existing content"
            href="/create/paste-text"
          />
          <OptionCard
            Icon={Sparkles}
            title="Generate"
            description="Create from a one-line prompt in a few seconds"
            href="/create/generate"
            pillLabel="POPULAR"
          />
          <OptionCard
            Icon={UploadCloud}
            title="Import file or URL"
            description="Enhance existing docs, presentations, or webpages"
            href="/create/from-files"
          />
        </div>

        {/* Recent prompts section removed as per request */}
      </div>
    </main>
    </>
  );
} 