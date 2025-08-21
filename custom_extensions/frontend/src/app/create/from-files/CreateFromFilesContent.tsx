"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  FileText,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "../../../contexts/LanguageContext";

// OptionCard component matching the main create page style
interface OptionCardProps {
  Icon: React.ElementType;
  title: string;
  description: string;
  href?: string;
  disabled?: boolean;
  pillLabel?: string;
}

const OptionCard: React.FC<OptionCardProps> = ({
  Icon,
  title,
  description,
  href,
  disabled = false,
  pillLabel,
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || !href) return;
    
    e.preventDefault();
    router.push(href);
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

export default function CreateFromFilesContent() {
  const { t } = useLanguage();

  return (
    <main
      className="min-h-screen flex flex-col items-center pt-24 pb-20 px-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)",
      }}
    >
      {/* Top-left back button */}
      <Link
        href="/create"
        className="absolute top-6 left-6 flex items-center gap-1 text-sm text-black hover:text-black-hover rounded-full px-3 py-1 border border-gray-300 bg-white"
      >
        <ArrowLeft size={14} className="-ml-0.5" />
        {t('interface.generate.back', 'Back')}
      </Link>

      {/* Main content */}
      <div className="w-full max-w-4xl flex flex-col gap-10 items-center">
        {/* Headings */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            {t('interface.fromFiles.createFromFiles', 'Create from Files')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-2">
            {t('interface.fromFiles.chooseMethod', 'How would you like to create content from your files?')}
          </p>
        </div>

        {/* Option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <OptionCard
            Icon={Search}
            title={t('interface.fromFiles.createFromKnowledgeBase', 'Create from Knowledge Base')}
            description={t('interface.fromFiles.knowledgeBaseDescription', 'Generate content by searching your entire Knowledge Base for relevant information')}
            href="/create/generate?fromKnowledgeBase=true"
          />
          <OptionCard
            Icon={FileText}
            title={t('interface.fromFiles.createFromSpecificFiles', 'Create from Specific Files')}
            description={t('interface.fromFiles.specificFilesDescription', 'Select specific files and folders to use as source material')}
            disabled={true}
            pillLabel={t('interface.fromFiles.soon', 'Soon')}
          />
        </div>
      </div>
    </main>
  );
}
