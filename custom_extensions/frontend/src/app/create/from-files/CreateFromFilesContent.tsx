"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Database, FileText, Sparkles } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

// Soon badge component for disabled cards
const SoonBadge: React.FC = () => {
  const { t } = useLanguage();
  return (
    <span className="absolute top-3 right-3 text-xs font-bold bg-gray-100 text-gray-600 rounded-md px-2 py-1 shadow-sm">
      {t("interface.soon", "Soon")}
    </span>
  );
};

// Option card component matching the main create page style
interface OptionCardProps {
  Icon: React.ElementType;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
  pillLabel?: string;
}

const OptionCard: React.FC<OptionCardProps> = ({
  Icon,
  title,
  description,
  onClick,
  disabled,
  pillLabel,
}: OptionCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled || !onClick) return;
    onClick();
  };

  // Card content shared by both enabled and disabled versions
  const cardContent = (
    <div
      className={`flex flex-col items-center justify-start rounded-xl overflow-hidden border transition-colors shadow-sm w-full h-full text-center relative ${
        disabled
          ? "bg-white text-gray-400 cursor-not-allowed border-gray-300 shadow-none"
          : "bg-white hover:bg-gray-50 text-gray-900 cursor-pointer border-gray-200"
      }`}
      onClick={handleClick}
    >
      {/* "Folder" header */}
      <div className={`w-full h-28 flex items-center justify-center relative ${
        disabled 
          ? "bg-gradient-to-tr from-gray-200/60 to-gray-300/60" 
          : "bg-gradient-to-tr from-indigo-300/60 to-pink-200/60"
      }`}>
        <Icon size={40} className={`${disabled ? "text-gray-400" : "text-white"} drop-shadow-md`} />
        {pillLabel && (
          <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-white text-indigo-600 rounded-md px-1.5 py-0.5 shadow">
            {pillLabel}
          </span>
        )}
        {disabled && <SoonBadge />}
      </div>
      {/* Text area */}
      <div className="flex flex-col items-center gap-1 px-4 py-5">
        <h3 className={`font-semibold text-base sm:text-lg leading-tight ${
          disabled ? "text-gray-400" : "text-gray-900"
        }`}>
          {title}
        </h3>
        <p className={`text-xs sm:text-sm max-w-xs leading-normal ${
          disabled ? "text-gray-400" : "text-gray-600"
        }`}>
          {description}
        </p>
      </div>
    </div>
  );

  return cardContent;
};

export default function CreateFromFilesContent() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleCreateFromKnowledgeBase = () => {
    // Check if we have lesson context to pass along
    try {
      const lessonContextData = sessionStorage.getItem("lessonContext");
      if (lessonContextData) {
        const lessonContext = JSON.parse(lessonContextData);
        // Check if data is recent (within 1 hour)
        if (
          lessonContext.timestamp &&
          Date.now() - lessonContext.timestamp < 3600000
        ) {
          const params = new URLSearchParams();
          params.set("fromKnowledgeBase", "true");
          Object.entries(lessonContext).forEach(([key, value]) => {
            if (key !== "timestamp") {
              params.set(key, String(value));
            }
          });
          router.push(`/create/generate?${params.toString()}`);
          return;
        }
      }
    } catch (error) {
      console.error("Error handling lesson context:", error);
    }

    // Fallback to simple redirect
    router.push("/create/generate?fromKnowledgeBase=true");
  };

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)",
      }}
    >
      {/* Header */}
      <div className="p-6 pb-0">
        {/* Back button - absolute positioned */}
        <Link
          href="/create"
          className="absolute top-6 left-6 flex items-center gap-1 text-sm text-black hover:text-black-hover rounded-full px-3 py-1 border border-gray-300 bg-white"
        >
          <ArrowLeft size={14} /> {t("interface.generate.back", "Back")}
        </Link>

        {/* Header Content - positioned below Back button */}
        <div className="pt-16">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("interface.fromFiles.createFromFiles", "Create from Files")}
            </h1>
            <p className="text-gray-600">
              {t(
                "interface.fromFiles.createFromFilesDescription",
                "Choose how you'd like to create content from your files"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        {/* Option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
          <OptionCard
            Icon={Database}
            title={t("interface.fromFiles.createFromKnowledgeBase", "Create from Knowledge Base")}
            description={t(
              "interface.fromFiles.createFromKnowledgeBaseDescription",
              "Use your entire knowledge base to generate comprehensive content with AI"
            )}
            onClick={handleCreateFromKnowledgeBase}
          />
          <OptionCard
            Icon={FileText}
            title={t("interface.fromFiles.createFromSpecificFiles", "Create from Specific Files")}
            description={t(
              "interface.fromFiles.createFromSpecificFilesDescription",
              "Select specific files and folders to create targeted content"
            )}
            disabled={true}
          />
        </div>
      </div>
    </main>
  );
}
