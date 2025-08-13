"use client";
/* eslint-disable */
// @ts-nocheck – this component is compiled by Next.js but lives outside the main
// app dir, so local tsconfig paths/types do not apply. Disable type-checking to
// avoid IDE / build noise until shared tsconfig is wired up.

import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Sparkles, ChevronDown, Settings, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { ThemeSvgs } from "../../../components/theme/ThemeSvgs";
import { useLanguage } from "../../../contexts/LanguageContext";
import PresentationPreview from "../../../components/PresentationPreview";
import { THEME_OPTIONS, getThemeSvg } from "../../../constants/themeConstants";
import { DEFAULT_SLIDE_THEME } from "../../../types/slideThemes";
import { useCreationTheme } from "../../../hooks/useCreationTheme";

// Base URL so frontend can reach custom backend through nginx proxy
const CUSTOM_BACKEND_URL =
  process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

// Simple bouncing dots loading animation (optionally with a status line)
type LoadingProps = { message?: string };
const LoadingAnimation: React.FC<LoadingProps> = ({ message }) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center mt-4" aria-label="Loading">
      <div className="flex gap-1 mb-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block w-3 h-3 bg-[#0066FF] rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      {message && (
        <p className="text-sm text-gray-600 select-none min-h-[1.25rem]">{message || t('interface.generate.loading', 'Generating...')}</p>
      )}
    </div>
  );
};

// Helper to retry fetch up to 2 times on 504 Gateway Timeout
async function fetchWithRetry(input: RequestInfo, init: RequestInit, retries = 2): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add exponential backoff delay for retries
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5 second delay
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Set a reasonable timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout per attempt
      
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Consider 5xx errors as retryable, but not 4xx errors
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on abort errors or client errors (4xx)
      if (error.name === 'AbortError' || (error.message && error.message.includes('4'))) {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === retries) {
        throw error;
      }
      
      console.warn(`Request attempt ${attempt + 1} failed:`, error.message);
    }
  }
  
  throw lastError!;
}

// Static SVG preview used for each theme tile
const ThemePreviewSvg: React.FC = () => (
  <svg
    width="214"
    height="116"
    viewBox="0 0 416 253"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <path d="M0 250.141C0 251.72 4.02944 253 9 253H409C412.866 253 416 252.004 416 250.776V192H0V250.141Z" fill="#431423"/>
    <path d="M2 9C2 4.02944 6.01006 0 10.9567 0H409.034C412.881 0 416 3.13401 416 7V192H2V9Z" fill="#431423"/>
    <path d="M414 7C414 4.23858 411.761 2 409 2H9C5.13401 2 2 5.13401 2 9V190H414V7ZM416 192H0V9C0 4.02944 4.02944 1.28851e-07 9 0H409L409.36 0.00878906C413.059 0.19633 416 3.25486 416 7V192Z" fill="#3F1C27"/>
    <path d="M31 32H383V192H31V32Z" fill="#5B2439"/>
    <path d="M205.476 169.69L205.455 165.97H205.985L212.223 159.346H215.871L208.757 166.887H208.278L205.476 169.69ZM202.673 175V154.127H205.72V175H202.673ZM212.559 175L206.953 167.56L209.053 165.43L216.299 175H212.559Z" fill="#CE9998"/>
    <path d="M188.567 165.705V175H185.52V159.345H188.445V161.893H188.639C188.999 161.064 189.563 160.399 190.331 159.896C191.105 159.393 192.08 159.142 193.256 159.142C194.322 159.142 195.257 159.366 196.058 159.814C196.86 160.256 197.482 160.915 197.924 161.791C198.365 162.668 198.586 163.752 198.586 165.043V175H195.539V165.41C195.539 164.275 195.243 163.388 194.652 162.749C194.061 162.104 193.249 161.781 192.216 161.781C191.509 161.781 190.881 161.934 190.331 162.24C189.787 162.546 189.356 162.994 189.036 163.585C188.724 164.17 188.567 164.876 188.567 165.705Z" fill="#CE9998"/>
    <path d="M178.373 175V159.345H181.42V175H178.373ZM179.912 156.93C179.382 156.93 178.927 156.753 178.546 156.4C178.173 156.04 177.986 155.612 177.986 155.116C177.986 154.613 178.173 154.185 178.546 153.832C178.927 153.472 179.382 153.292 179.912 153.292C180.442 153.292 180.894 153.472 181.268 153.832C181.648 154.185 181.838 154.613 181.838 155.116C181.838 155.612 181.648 156.04 181.268 156.4C180.894 156.753 180.442 156.93 179.912 156.93Z" fill="#CE9998"/>
    <path d="M174.274 154.127V175H171.226V154.127H174.274Z" fill="#CE9998"/>
    <path d="M151.011 175.296C149.611 175.296 148.405 175.041 147.393 174.531C146.387 174.022 145.613 173.329 145.069 172.452C144.525 171.569 144.254 170.57 144.254 169.456C144.254 168.606 144.43 167.852 144.784 167.193C145.137 166.527 145.63 165.912 146.261 165.348C146.893 164.784 147.624 164.217 148.453 163.646L151.816 161.272C152.387 160.898 152.832 160.504 153.151 160.089C153.47 159.668 153.63 159.148 153.63 158.53C153.63 158.041 153.419 157.572 152.998 157.124C152.577 156.675 152.013 156.451 151.306 156.451C150.817 156.451 150.386 156.57 150.012 156.808C149.645 157.046 149.356 157.351 149.146 157.725C148.942 158.092 148.84 158.479 148.84 158.887C148.84 159.362 148.969 159.841 149.227 160.324C149.492 160.806 149.832 161.306 150.246 161.822C150.661 162.332 151.096 162.862 151.551 163.412L161.243 175H157.799L149.778 165.573C149.105 164.778 148.48 164.03 147.902 163.33C147.325 162.624 146.856 161.91 146.496 161.19C146.143 160.463 145.966 159.678 145.966 158.836C145.966 157.878 146.183 157.029 146.618 156.288C147.06 155.541 147.675 154.956 148.463 154.535C149.251 154.114 150.175 153.903 151.235 153.903C152.309 153.903 153.229 154.114 153.997 154.535C154.772 154.949 155.366 155.503 155.781 156.196C156.202 156.882 156.412 157.633 156.412 158.449C156.412 159.441 156.164 160.317 155.668 161.078C155.179 161.832 154.503 162.525 153.64 163.157L149.451 166.245C148.636 166.843 148.069 167.434 147.749 168.019C147.437 168.596 147.281 169.048 147.281 169.374C147.281 169.972 147.433 170.526 147.739 171.035C148.052 171.545 148.487 171.953 149.044 172.258C149.608 172.564 150.267 172.717 151.021 172.717C151.796 172.717 152.55 172.551 153.284 172.218C154.024 171.878 154.693 171.392 155.291 170.76C155.896 170.128 156.375 169.371 156.728 168.487C157.082 167.604 157.258 166.616 157.258 165.522H160.01C160.01 166.867 159.857 168.005 159.551 168.936C159.246 169.86 158.875 170.614 158.441 171.198C158.013 171.776 157.608 172.228 157.228 172.554C157.105 172.663 156.99 172.771 156.881 172.88C156.773 172.989 156.657 173.098 156.535 173.206C155.828 173.92 154.972 174.446 153.966 174.786C152.968 175.126 151.982 175.296 151.011 175.296Z" fill="#CE9998"/>
    <path d="M123.011 180.87C122.556 180.87 122.142 180.833 121.768 180.758C121.394 180.69 121.116 180.616 120.932 180.534L121.666 178.037C122.223 178.187 122.719 178.251 123.154 178.231C123.589 178.21 123.973 178.047 124.306 177.742C124.646 177.436 124.945 176.936 125.203 176.243L125.58 175.204L119.852 159.345H123.113L127.078 171.494H127.241L131.206 159.345H134.477L128.026 177.089C127.727 177.905 127.346 178.594 126.884 179.158C126.422 179.729 125.872 180.157 125.233 180.442C124.595 180.728 123.854 180.87 123.011 180.87Z" fill="#CE9998"/>
    <path d="M108.98 175.306C107.716 175.306 106.588 174.983 105.596 174.338C104.611 173.685 103.837 172.758 103.273 171.555C102.715 170.346 102.437 168.895 102.437 167.203C102.437 165.512 102.719 164.064 103.283 162.862C103.854 161.659 104.635 160.738 105.627 160.1C106.619 159.461 107.743 159.142 109 159.142C109.972 159.142 110.753 159.305 111.344 159.631C111.942 159.95 112.404 160.324 112.731 160.752C113.063 161.18 113.322 161.557 113.505 161.883H113.689V154.127H116.736V175H113.76V172.564H113.505C113.322 172.897 113.057 173.278 112.71 173.706C112.37 174.134 111.902 174.507 111.304 174.827C110.706 175.146 109.931 175.306 108.98 175.306ZM109.653 172.707C110.529 172.707 111.27 172.476 111.874 172.014C112.486 171.545 112.948 170.896 113.261 170.067C113.58 169.238 113.74 168.273 113.74 167.173C113.74 166.086 113.583 165.134 113.271 164.319C112.958 163.504 112.5 162.868 111.895 162.413C111.29 161.958 110.543 161.73 109.653 161.73C108.735 161.73 107.971 161.968 107.36 162.444C106.748 162.919 106.286 163.568 105.973 164.39C105.668 165.213 105.515 166.14 105.515 167.173C105.515 168.219 105.671 169.16 105.984 169.996C106.296 170.832 106.758 171.494 107.37 171.983C107.988 172.466 108.749 172.707 109.653 172.707Z" fill="#CE9998"/>
    <path d="M92.421 175.316C90.9533 175.316 89.6726 174.98 88.5787 174.307C87.4847 173.634 86.6354 172.693 86.0307 171.484C85.426 170.274 85.1237 168.861 85.1237 167.244C85.1237 165.62 85.426 164.2 86.0307 162.984C86.6354 161.768 87.4847 160.823 88.5787 160.151C89.6726 159.478 90.9533 159.142 92.421 159.142C93.8886 159.142 95.1693 159.478 96.2633 160.151C97.3572 160.823 98.2065 161.768 98.8112 162.984C99.4159 164.2 99.7183 165.62 99.7183 167.244C99.7183 168.861 99.4159 170.274 98.8112 171.484C98.2065 172.693 97.3572 173.634 96.2633 174.307C95.1693 174.98 93.8886 175.316 92.421 175.316ZM92.4312 172.758C93.3824 172.758 94.1705 172.506 94.7956 172.004C95.4207 171.501 95.8828 170.832 96.1817 169.996C96.4875 169.16 96.6403 168.239 96.6403 167.234C96.6403 166.235 96.4875 165.318 96.1817 164.482C95.8828 163.64 95.4207 162.964 94.7956 162.454C94.1705 161.944 93.3824 161.69 92.4312 161.69C91.4731 161.69 90.6782 161.944 90.0463 162.454C89.4212 162.964 88.9558 163.64 88.65 164.482C88.351 165.318 88.2016 166.235 88.2016 167.234C88.2016 168.239 88.351 169.16 88.65 169.996C88.9558 170.832 89.4212 171.501 90.0463 172.004C90.6782 172.506 91.4731 172.758 92.4312 172.758Z" fill="#CE9998"/>
    <path d="M67.2932 175V154.127H74.937C76.4182 154.127 77.6446 154.372 78.6162 154.861C79.5878 155.344 80.3148 155.999 80.7972 156.828C81.2796 157.65 81.5209 158.578 81.5209 159.61C81.5209 160.48 81.3612 161.214 81.0418 161.812C80.7225 162.403 80.2944 162.879 79.7577 163.239C79.2277 163.592 78.6434 163.85 78.0047 164.013V164.217C78.6977 164.251 79.3738 164.475 80.0329 164.89C80.6987 165.297 81.2491 165.878 81.6839 166.633C82.1188 167.387 82.3362 168.304 82.3362 169.384C82.3362 170.451 82.0848 171.409 81.582 172.258C81.086 173.101 80.3182 173.77 79.2787 174.266C78.2391 174.755 76.9108 175 75.2937 175H67.2932ZM70.4424 172.299H74.9879C76.4963 172.299 77.5766 172.007 78.2289 171.423C78.8812 170.838 79.2073 170.108 79.2073 169.232C79.2073 168.572 79.0409 167.968 78.7079 167.417C78.375 166.867 77.8994 166.429 77.2811 166.103C76.6696 165.777 75.9426 165.613 75.1 165.613H70.4424V172.299ZM70.4424 163.157H74.6618C75.3684 163.157 76.0037 163.021 76.5677 162.75C77.1384 162.478 77.5902 162.097 77.9232 161.608C78.2629 161.112 78.4327 160.528 78.4327 159.855C78.4327 158.992 78.1304 158.269 77.5257 157.684C76.921 157.1 75.9935 156.808 74.7433 156.808H70.4424V163.157Z" fill="#CE9998"/>
    <path d="M152.901 115.509C150.287 115.509 148.029 114.966 146.128 113.88C144.238 112.782 142.784 111.232 141.766 109.229C140.747 107.214 140.238 104.844 140.238 102.116C140.238 99.4344 140.747 97.0806 141.766 95.055C142.795 93.0181 144.233 91.4338 146.077 90.3022C147.922 89.1592 150.089 88.5878 152.578 88.5878C154.185 88.5878 155.702 88.848 157.127 89.3686C158.565 89.8778 159.832 90.67 160.93 91.745C162.039 92.8201 162.91 94.1893 163.544 95.8528C164.178 97.505 164.494 99.474 164.494 101.76V103.644H143.124V99.5023H158.604C158.593 98.3254 158.338 97.2787 157.84 96.3621C157.342 95.4341 156.647 94.7042 155.753 94.1724C154.87 93.6405 153.84 93.3746 152.663 93.3746C151.407 93.3746 150.304 93.6801 149.353 94.2912C148.403 94.8909 147.661 95.6831 147.13 96.6676C146.609 97.6408 146.343 98.7102 146.332 99.8758V103.491C146.332 105.008 146.609 106.309 147.163 107.395C147.718 108.47 148.493 109.297 149.489 109.874C150.485 110.44 151.65 110.722 152.986 110.722C153.88 110.722 154.689 110.598 155.413 110.349C156.137 110.089 156.765 109.71 157.297 109.212C157.829 108.714 158.231 108.097 158.502 107.361L164.24 108.007C163.878 109.523 163.187 110.847 162.169 111.979C161.162 113.099 159.872 113.97 158.299 114.593C156.726 115.204 154.926 115.509 152.901 115.509Z" fill="#E6A18E"/>
    <path d="M135.04 80.2363V115H128.895V80.2363H135.04Z" fill="#E6A18E"/>
    <path d="M123.196 88.9273V93.6801H108.207V88.9273H123.196ZM111.908 82.6807H118.052V107.158C118.052 107.984 118.177 108.618 118.426 109.059C118.686 109.489 119.026 109.783 119.444 109.942C119.863 110.1 120.327 110.179 120.836 110.179C121.221 110.179 121.572 110.151 121.889 110.094C122.217 110.038 122.466 109.987 122.635 109.942L123.671 114.745C123.343 114.859 122.873 114.983 122.262 115.119C121.662 115.255 120.927 115.334 120.055 115.356C118.516 115.402 117.13 115.17 115.897 114.66C114.663 114.14 113.684 113.336 112.96 112.25C112.247 111.164 111.896 109.806 111.908 108.176V82.6807Z" fill="#E6A18E"/>
    <path d="M97.7127 115V88.9273H103.857V115H97.7127ZM100.802 85.2269C99.8289 85.2269 98.9915 84.9043 98.2898 84.2593C97.5882 83.603 97.2374 82.8165 97.2374 81.8999C97.2374 80.9719 97.5882 80.1855 98.2898 79.5404C98.9915 78.8841 99.8289 78.5559 100.802 78.5559C101.787 78.5559 102.624 78.8841 103.314 79.5404C104.016 80.1855 104.367 80.9719 104.367 81.8999C104.367 82.8165 104.016 83.603 103.314 84.2593C102.624 84.9043 101.787 85.2269 100.802 85.2269Z" fill="#E6A18E"/>
    <path d="M64.9011 85.5154V80.2363H92.6373V85.5154H81.8925V115H75.6459V85.5154H64.9011Z" fill="#E6A18E"/>
    <path d="M31 189H383V221H31V189Z" fill="#5B2439"/>
  </svg>
);


// Helper to map ranges back to option labels
const optionForRange = (range?: string): "Short" | "Medium" | "Long" => {
  switch (range) {
    case "400-500 words":
      return "Short";
    case "800+ words":
      return "Long";
    default:
      return "Medium";
  }
};

const lengthRangeForOption = (opt: string) => {
  switch (opt) {
    case "Short":
      return "100-200 words";
    case "Medium":
      return "300-400 words";
    case "Long":
      return "500+ words";
    default:
      return "300-400 words";
  }
};


// Function to calculate credits based on slide count (matching backend logic)
const calculateLessonPresentationCredits = (slideCount: number): number => {
  if (slideCount <= 5) return 3;
  if (slideCount <= 10) return 5;
  return 10;
};

export default function LessonPresentationClient() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const router = useRouter();
  
  // File context for creation from documents
  const isFromFiles = params?.get("fromFiles") === "true";
  const folderIds = params?.get("folderIds")?.split(",").filter(Boolean) || [];
  const fileIds = params?.get("fileIds")?.split(",").filter(Boolean) || [];
  
  // Text context for creation from user text
  const isFromText = params?.get("fromText") === "true";
  const textMode = params?.get("textMode") as 'context' | 'base' | null;
  const [userText, setUserText] = useState('');
  
  // Check for folder context from sessionStorage (when coming from inside a folder)
  const [folderContext, setFolderContext] = useState<{ folderId: string } | null>(null);
  useEffect(() => {
    try {
      const storedFolderContext = sessionStorage.getItem('folderContext');
      if (storedFolderContext) {
        const context = JSON.parse(storedFolderContext);
        // Check if data is recent (within 1 hour)
        if (context.timestamp && (Date.now() - context.timestamp < 3600000)) {
          setFolderContext(context);
        } else {
          // Clean up expired data
          sessionStorage.removeItem('folderContext');
        }
      }
    } catch (error) {
      console.error('Error retrieving folder context:', error);
    }
  }, []);
  
  // Retrieve user text from sessionStorage
  useEffect(() => {
    if (isFromText) {
      try {
        const storedData = sessionStorage.getItem('pastedTextData');
        if (storedData) {
          const textData = JSON.parse(storedData);
          // Check if data is recent (within 1 hour) and matches the current mode
          if (textData.timestamp && (Date.now() - textData.timestamp < 3600000) && textData.mode === textMode) {
            setUserText(textData.text || '');
          }
        }
      } catch (error) {
        console.error('Error retrieving pasted text data:', error);
      }
    }
  }, [isFromText, textMode]);
  
  // Core state for lesson generation
  const [content, setContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>(""); // NEW: Track original content
  const [hasUserEdits, setHasUserEdits] = useState<boolean>(false); // NEW: Track if user made edits
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false); // Used for footer button state
  const [chatId, setChatId] = useState<string | null>(params?.get("chatId") || null);
  


  // Product type for video lesson vs regular presentation
  const productType = params?.get("productType") || "lesson_presentation";
  
  // State for dropdowns
  const [outlines, setOutlines] = useState<{ id: number; name: string }[]>([]);
  const [modulesForOutline, setModulesForOutline] = useState<{ name: string; lessons: string[] }[]>([]);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const [lessonsForModule, setLessonsForModule] = useState<string[]>([]);
  const [selectedOutlineId, setSelectedOutlineId] = useState<number | null>(params?.get("outlineId") ? Number(params.get("outlineId")) : null);
  const [selectedLesson, setSelectedLesson] = useState<string>(params?.get("lesson") || "");
  const [language, setLanguage] = useState<string>(params?.get("lang") || "en");
  


  const [lengthOption, setLengthOption] = useState<"Short" | "Medium" | "Long">(
    optionForRange(params?.get("length") || "600-800 words")
  );
  const [slidesCount, setSlidesCount] = useState<number>(
    params?.get("slidesCount") ? Number(params.get("slidesCount")) : 5
  );
  
  // State for conditional dropdown logic
  const [useExistingOutline, setUseExistingOutline] = useState<boolean | null>(
    params?.get("outlineId") ? true : (params?.get("prompt") ? false : null)
  );
  
  // Theme management with creation-specific persistence
  const { currentTheme: selectedTheme, changeTheme: setSelectedTheme } = useCreationTheme({
    templateType: 'lesson-presentation',
    templateDefaultTheme: DEFAULT_SLIDE_THEME,
    enablePersistence: true
  });
  const [textDensity, setTextDensity] = useState("medium");
  const [imageSource, setImageSource] = useState("ai");
  const [aiModel, setAiModel] = useState("flux-fast");
  const [streamDone, setStreamDone] = useState(false);
  const [textareaVisible, setTextareaVisible] = useState(false);
  const [firstLineRemoved, setFirstLineRemoved] = useState(false);
  
 
  // Refs
  const previewAbortRef = useRef<AbortController | null>(null);
  // Note: textareaRef removed since we're using PresentationPreview instead

  // ---- Inline Advanced Mode ----
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  const lessonExamples: { short: string; detailed: string }[] = [
    {
      short: "Adapt to U.S. industry specifics",
      detailed:
        "Update the Lesson's structure based on U.S. industry and cultural specifics: adjust content, replace topics, examples, and wording that don't align with the American context.",
    },
    {
      short: "Adopt trends and latest practices",
      detailed:
        "Update the lesson's structure by adding content that reflect current trends and best practices in the field. Remove outdated elements and replace them with up-to-date content.",
    },
    {
      short: "Incorporate top industry examples",
      detailed:
        "Analyze the best lessons on the market in this topic and restructure our lesson accordingly: change or add content which others present more effectively. Focus on content flow and clarity.",
    },
    {
      short: "Simplify and restructure the content",
      detailed:
        "Rewrite the lesson's structure to make it more logical and user-friendly. Remove redundant sections, merge overlapping content, and rephrase content for clarity and simplicity.",
    },
    {
      short: "Increase value and depth of content",
      detailed:
        "Strengthen the lesson by adding content that deepen understanding and bring advanced-level value. Refine wording to clearly communicate skills and insights being delivered.",
    },
    {
      short: "Add case studies and applications",
      detailed:
        "Revise the lesson's structure to include applied content — such as real-life cases, examples, or actionable approaches — while keeping the theoretical foundation intact.",
    },
  ];

  const [selectedExamples, setSelectedExamples] = useState<string[]>([]);







  const toggleExample = (ex: typeof lessonExamples[number]) => {
    setSelectedExamples((prev) => {
      if (prev.includes(ex.short)) {
        const updated = prev.filter((s) => s !== ex.short);
        setEditPrompt((p) => {
          return p
            .split("\n")
            .filter((line) => line.trim() !== ex.detailed)
            .join("\n")
            .replace(/^\n+|\n+$/g, "");
        });
        return updated;
      }
      setEditPrompt((p) => (p ? p + "\n" + ex.detailed : ex.detailed));
      return [...prev, ex.short];
    });
  };

  // Fetch all outlines when switching to existing outline mode
  useEffect(() => {
    if (useExistingOutline !== true) return;
    const fetchOutlines = async () => {
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/projects`);
        if (!res.ok) return;
        const data = await res.json();
        const onlyOutlines = data.filter((p: any) => (p?.design_microproduct_type || p?.product_type) === "Training Plan");
        setOutlines(onlyOutlines.map((p: any) => ({ id: p.id, name: p.projectName })));
      } catch (_) {}
    };
    fetchOutlines();
  }, [useExistingOutline]);

  // Fetch lessons when a course outline is selected
  useEffect(() => {
    if (useExistingOutline !== true || selectedOutlineId == null) {
      setModulesForOutline([]);
      setSelectedModuleIndex(null);
      setLessonsForModule([]);
      setSelectedLesson("");
      return;
    };
    const fetchLessons = async () => {
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${selectedOutlineId}`);
        if (!res.ok) return;
        const data = await res.json();
        const sections = data?.details?.sections || [];
        const modules = sections.map((sec: any) => ({
          name: sec.title || "Unnamed module",
          lessons: (sec.lessons || []).map((ls: any) => ls.title || ""),
        }));
        setModulesForOutline(modules);

        // If a lesson was pre-selected via query params, attempt to locate its module
        if (selectedLesson) {
          const modIdx = modules.findIndex((m: { lessons: string[] }) => m.lessons.includes(selectedLesson));
          if (modIdx !== -1) {
            setSelectedModuleIndex(modIdx);
            setLessonsForModule(modules[modIdx].lessons);
          } else {
            // lesson not found in fetched data – clear it
            setSelectedModuleIndex(null);
            setLessonsForModule([]);
            setSelectedLesson("");
          }
        } else {
          // No lesson selected yet – clear downstream selections
          setSelectedModuleIndex(null);
          setLessonsForModule([]);
        }
      } catch (_) {}
    };
    fetchLessons();
  }, [selectedOutlineId, useExistingOutline]);


  // Effect to trigger streaming preview generation
  useEffect(() => {
    
    // Start preview when one of the following is true:
    //   • a lesson was chosen from the outline (old behaviour)
    //   • no lesson chosen, but the user provided a free-form prompt (new behaviour)
    const promptQuery = params?.get("prompt")?.trim() || "";
    if (!selectedLesson && !promptQuery) {
      // Nothing to preview yet – wait for user input
      setLoading(false);
      return;
    }

    // If creating from text but userText not loaded yet, wait
    if (isFromText && !userText) {
      setLoading(false);
      return;
    }

    const startPreview = (attempt: number = 0) => {
      // Reset visibility states for a fresh preview run
      // Only hide textarea if we don't have existing content (first generation)
      if (!content) {
        setTextareaVisible(false);
      }
      setFirstLineRemoved(false);
      // Reset stream completion flag for new preview
      setStreamDone(false);
      const abortController = new AbortController();
      if (previewAbortRef.current) previewAbortRef.current.abort();
      previewAbortRef.current = abortController;

      const fetchPreview = async () => {
        setLoading(true);
        setError(null);
        setContent("");
        setTextareaVisible(true);
        setLoading(false); // Clear previous content
        let gotFirstChunk = false;

        try {
          const requestBody: any = {
            // Only send outlineProjectId when the user actually selected one
            outlineProjectId: selectedOutlineId || undefined,
            // If no lesson was picked, derive a temporary title from the prompt or fallback
            lessonTitle: selectedLesson || (promptQuery ? promptQuery.slice(0, 80) : "Untitled Lesson"),
            lengthRange: lengthRangeForOption(lengthOption),
            language,
            // Always forward the prompt (if any) so backend can generate content
            prompt: promptQuery || undefined,
            chatSessionId: chatId || undefined,
            slidesCount: slidesCount,
            productType: productType, // Pass product type for video lesson vs regular presentation
            // Include selected theme
            theme: selectedTheme,
          };

          // Add file context if creating from files
          if (isFromFiles) {
            requestBody.fromFiles = true;
            if (folderIds.length > 0) requestBody.folderIds = folderIds.join(',');
            if (fileIds.length > 0) requestBody.fileIds = fileIds.join(',');
          }

          // Add text context if creating from text
          if (isFromText) {
            requestBody.fromText = true;
            requestBody.textMode = textMode;
            requestBody.userText = userText;
          }

          const res = await fetchWithRetry(`${CUSTOM_BACKEND_URL}/lesson-presentation/preview`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            signal: abortController.signal,
          });

          if (!res.ok || !res.body) {
            throw new Error(`Failed to generate lesson: ${res.status}`);
          }
          
          if (res.headers.get("X-Chat-Session-Id")) {
            setChatId(res.headers.get("X-Chat-Session-Id"));
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          
          let buffer = "";
          let accumulatedText = "";

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Process any remaining buffer
              if (buffer.trim()) {
                try {
                  const pkt = JSON.parse(buffer.trim());
                  if (pkt.type === "delta") {
                    accumulatedText += pkt.text;
                    setContent(accumulatedText);
                    // NEW: Track original content when first receiving data
                    if (!originalContent) {
                      setOriginalContent(accumulatedText);
                    }
                  }
                } catch (e) {
                  // If not JSON, treat as plain text
                  accumulatedText += buffer;
                  setContent(accumulatedText);
                }
              }
              setStreamDone(true);
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            
            // Split by newlines and process complete chunks
            const lines = buffer.split('\n');
            buffer = lines.pop() || ""; // Keep incomplete line in buffer
            
            for (const line of lines) {
              if (!line.trim()) continue;
              
              try {
                const pkt = JSON.parse(line);
                gotFirstChunk = true;
                
                if (pkt.type === "delta") {
                  accumulatedText += pkt.text;
                  setContent(accumulatedText);
                } else if (pkt.type === "done") {
                  setStreamDone(true);
                  break;
                } else if (pkt.type === "error") {
                  throw new Error(pkt.text || "Unknown error");
                }
              } catch (e) {
                // If not JSON, treat as plain text
                accumulatedText += line + '\n';
                setContent(accumulatedText);
              }
            }

            // Determine if this buffer now contains some real (non-whitespace) text
            const hasMeaningfulText = /\S/.test(accumulatedText);
            // console.log("hasMeaningfulText", hasMeaningfulText);
            // console.log("textareaVisible", textareaVisible);
            if (hasMeaningfulText && !textareaVisible) {
              // console.log("hasMeaningfulText",);
              setTextareaVisible(true);
              setLoading(false); // Hide spinner & show textarea
            }
            
            // Force state update to ensure UI reflects content changes
            if (accumulatedText && accumulatedText !== content) {
              
              setContent(accumulatedText);

            }
          }

        } catch (e: any) {
          if (e.name === "AbortError") return;

          // Retry logic
          if (attempt < 3) {
            const delay = 1500 * (attempt + 1);
            setTimeout(() => startPreview(attempt + 1), delay);
          } else {
            if (e?.message) {
              if (e.message.includes("The user aborted a request")) return;
            }
            setError(e.message);
          }
        } finally {
          if (!abortController.signal.aborted) {
            // If the stream ended but we never displayed content, remove spinner anyway
            if (loading) setLoading(false);
            if (!gotFirstChunk && attempt >= 3) {
              setError("Failed to generate lesson – please try again later.");
            }
          }
        }
      };

      fetchPreview();
    };

    startPreview();

    return () => {
      if (previewAbortRef.current) previewAbortRef.current.abort();
    };
  }, [selectedOutlineId, selectedLesson, lengthOption, language, isFromText, userText, textMode]);

  // Note: Auto-scroll effect removed since we're using PresentationPreview instead of textarea

  // Once streaming is done, strip the first line that contains metadata (project, product type, etc.)
  useEffect(() => {
    if (streamDone && !firstLineRemoved) {
      const parts = content.split('\n');
      if (parts.length > 1) {
        let trimmed = parts.slice(1).join('\n');
        // Remove leading blank lines (one or more) at the very start
        trimmed = trimmed.replace(/^(\s*\n)+/, '');
        setContent(trimmed);
      }
      setFirstLineRemoved(true);
    }
  }, [streamDone, firstLineRemoved, content]);

  // Handler to finalize the lesson and save it
  const handleGenerateFinal = async () => {
    if (isGenerating) return;
    if (previewAbortRef.current) {
      previewAbortRef.current.abort();
    }

    setIsGenerating(true);
    setLoading(false);
    setError(null);

    // Create AbortController for this request
    const abortController = new AbortController();

    // Add timeout safeguard to prevent infinite loading
    const timeoutId = setTimeout(() => {
      abortController.abort();
      setIsGenerating(false);
      setError("Finalization timed out. Please try again.");
    }, 300000); // 5 minutes timeout

    try {
      // Re-use the same fallback title logic we applied in preview
      const promptQuery = params?.get("prompt")?.trim() || "";
      const derivedTitle = selectedLesson || (promptQuery ? promptQuery.slice(0, 80) : "Untitled Lesson");

      const res = await fetch(`${CUSTOM_BACKEND_URL}/lesson-presentation/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlineProjectId: selectedOutlineId || undefined,
          lessonTitle: derivedTitle,
          lengthRange: lengthRangeForOption(lengthOption),
          aiResponse: content,
          chatSessionId: chatId || undefined,
          slidesCount: slidesCount,
          productType: productType, // Pass product type for video lesson vs regular presentation
          folderId: folderContext?.folderId || undefined,
          // Include selected theme
          theme: selectedTheme,
          // NEW: Include edit tracking information
          hasUserEdits: hasUserEdits,
          originalContent: originalContent,
          isCleanContent: false, // We always send full content for lesson presentations
        }),
        signal: abortController.signal
      });

      // Clear timeout since request completed
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      const data = await res.json();
      
      // Ensure we have a valid project ID before navigating
      if (!data?.id) {
        throw new Error("Invalid response: missing project ID");
      }

      // Navigate immediately without delay to prevent cancellation
      router.push(`/projects/view/${data.id}`);

    } catch (e: any) {
      // Clear timeout on error
      clearTimeout(timeoutId);
      
      // Reset generating state on any error
      setIsGenerating(false);
      setLoading(false);
      
      // Handle specific error types
      if (e.name === 'AbortError') {
        console.log('Request was aborted');
        setError("Request was canceled. Please try again.");
      } else if (e.message?.includes('NetworkError') || e.message?.includes('Failed to fetch')) {
        setError("Network error occurred. Please check your connection and try again.");
      } else {
        const errorMessage = e.message || "Failed to finalize lesson. Please try again.";
        setError(errorMessage);
        
        // Fallback: project may have been created despite response error (e.g., 504). Try to locate it.
        try {
          const res = await fetch(`${CUSTOM_BACKEND_URL}/projects`, { cache: 'no-store' });
          if (res.ok) {
            const list = await res.json();
            // Try to find latest Slide Deck or Video Lesson Presentation by title
            const derivedTitle = selectedLesson || (params?.get("prompt")?.trim()?.slice(0, 80) || "Untitled Lesson");
            const isVideo = productType === 'video_lesson_presentation';
            // component_name not always present in list; match by product_type/microproduct type as well
            const candidate = list.find((p: any) => p?.projectName === derivedTitle)
              || list.find((p: any) => (p?.design_microproduct_type || p?.product_type) === (isVideo ? 'Video Lesson Presentation' : 'Slide Deck'));
            if (candidate?.id) {
              router.replace(`/projects/view/${candidate.id}`);
              return;
            }
          }
        } catch (fallbackErr) {
          console.warn('Finalize fallback navigation failed:', fallbackErr);
        }
      }
      
      console.error("Finalization error:", e);
    }
  };

  // ===== Apply incremental edit to lesson =====
  const handleApplyLessonEdit = async () => {
    const trimmed = editPrompt.trim();
    if (!trimmed || loadingEdit) return;

    // Combine existing prompt (if any) with new instruction
    const basePrompt = params?.get("prompt") || "";
    let combined = basePrompt.trim();
    if (combined && !/[.!?]$/.test(combined)) combined += ".";
    combined = combined ? `${combined} ${trimmed}` : trimmed;

    // Update URL param so refreshes keep context (ReadonlyURLSearchParams is immutable)
    const sp = new URLSearchParams(params?.toString() || "");
    sp.set("prompt", combined);
    router.replace(`?${sp.toString()}`, { scroll: false });

    // Start streaming preview similar to startPreview but on demand
    if (previewAbortRef.current) previewAbortRef.current.abort();
    const abortController = new AbortController();
    previewAbortRef.current = abortController;

    setLoadingEdit(true);
    setError(null);
    // Keep existing content visible during edit - only reset streaming states
    setFirstLineRemoved(false);
    setStreamDone(false);
    // Don't clear content - keep sections visible

    try {
      const promptQuery = combined; // already merged new edit into existing prompt
      const derivedTitle = selectedLesson || (promptQuery ? promptQuery.slice(0, 80) : "Untitled Lesson");

      const editRequestBody: any = {
        outlineProjectId: selectedOutlineId || undefined,
        lessonTitle: derivedTitle,
        lengthRange: lengthRangeForOption(lengthOption),
        language,
        prompt: promptQuery,
        chatSessionId: chatId || undefined,
        slidesCount: slidesCount,
        // Include selected theme
        theme: selectedTheme,
      };

      // Add file context if creating from files
      if (isFromFiles) {
        editRequestBody.fromFiles = true;
        if (folderIds.length > 0) editRequestBody.folderIds = folderIds.join(',');
        if (fileIds.length > 0) editRequestBody.fileIds = fileIds.join(',');
      }

      // Add text context if creating from text
      if (isFromText) {
        editRequestBody.fromText = true;
        editRequestBody.textMode = textMode;
        editRequestBody.userText = userText;
      }

      const res = await fetchWithRetry(`${CUSTOM_BACKEND_URL}/lesson-presentation/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editRequestBody),
        signal: abortController.signal,
      });

      if (!res.ok || !res.body) throw new Error(`Failed to apply edit: ${res.status}`);

      if (res.headers.get("X-Chat-Session-Id")) {
        setChatId(res.headers.get("X-Chat-Session-Id"));
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";

      // Clear content only when we start receiving new data
      let hasReceivedData = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) { 
          // Process any remaining buffer
          if (buffer.trim()) {
            try {
              const pkt = JSON.parse(buffer.trim());
              if (pkt.type === "delta") {
                accumulatedText += pkt.text;
                setContent(accumulatedText);
              }
            } catch (e) {
              // If not JSON, treat as plain text
              accumulatedText += buffer;
              setContent(accumulatedText);
            }
          }
          setStreamDone(true); 
          break; 
        }
        
        buffer += decoder.decode(value, { stream: true });
        
        // Split by newlines and process complete chunks
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const pkt = JSON.parse(line);
            if (!hasReceivedData) {
              hasReceivedData = true;
              setLoadingEdit(false); // Stop showing "Applying" once stream starts
            }
            
            if (pkt.type === "delta") {
              accumulatedText += pkt.text;
              setContent(accumulatedText);
            } else if (pkt.type === "done") {
              setStreamDone(true);
              break;
            } else if (pkt.type === "error") {
              throw new Error(pkt.text || "Unknown error");
            }
          } catch (e) {
            // If not JSON, treat as plain text
            if (!hasReceivedData) {
              hasReceivedData = true;
              setLoadingEdit(false);
            }
            accumulatedText += line;
            setContent(accumulatedText);
          }
        }
        
        if (/\S/.test(accumulatedText) && !textareaVisible) {
          setTextareaVisible(true);
          setLoading(false);
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setError(e.message || "Failed to apply edit");
      }
    } finally {
      setLoading(false);
      setLoadingEdit(false);
      setEditPrompt("");
    }
  };

  // ===== Handle section-specific regeneration when user edits title =====
  const handleSectionTitleEdit = async (slideIdx: number, newTitle: string, oldTitle: string) => {
    if (newTitle === oldTitle) return; // No change
    
    // Mark that user has made edits
    setHasUserEdits(true);
    
    // Update the content with new title using language-agnostic pattern
    const slidePattern = /\*\*[^*]+\s+\d+\s*:\s*([^*`\n]+)/.test(content)
      ? new RegExp(`(\\*\\*[^*]+\\s+${slideIdx + 1}\\s*:\\s*)([^*\`\\n]+)`)
      : new RegExp(`\\*\\*${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*`);
    
    const updatedContent = content.replace(slidePattern, 
      /\*\*[^*]+\s+\d+\s*:\s*([^*`\n]+)/.test(content) ? `$1${newTitle}` : `**${newTitle}**`
    );
    
    // Update content immediately with new title
    setContent(updatedContent);
    
    // Call the edit endpoint to regenerate content for this section
    try {
      const editRequestBody: any = {
        currentContent: updatedContent, // Use the updated content, not the old one
        editPrompt: `Update the content for slide ${slideIdx + 1} titled "${newTitle}". The previous title was "${oldTitle}". Please regenerate the content to match the new title while keeping the same educational structure and depth.`,
        outlineProjectId: selectedOutlineId || undefined,
        lessonTitle: selectedLesson || "Untitled Lesson",
        language,
        chatSessionId: chatId || undefined,
        slidesCount: slidesCount,
        theme: selectedTheme,
        isCleanContent: false, // We want full content regeneration
      };

      // Add file context if creating from files
      if (isFromFiles) {
        editRequestBody.fromFiles = true;
        if (folderIds.length > 0) editRequestBody.folderIds = folderIds.join(',');
        if (fileIds.length > 0) editRequestBody.fileIds = fileIds.join(',');
      }

      // Add text context if creating from text
      if (isFromText) {
        editRequestBody.fromText = true;
        editRequestBody.textMode = textMode;
        editRequestBody.userText = userText;
      }

      const res = await fetchWithRetry(`${CUSTOM_BACKEND_URL}/lesson-presentation/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editRequestBody),
      });

      if (!res.ok || !res.body) throw new Error(`Failed to regenerate section: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) { 
          // Process any remaining buffer
          if (buffer.trim()) {
            try {
              const pkt = JSON.parse(buffer.trim());
              if (pkt.type === "delta") {
                accumulatedText += pkt.text;
              }
            } catch (e) {
              // If not JSON, treat as plain text
              accumulatedText += buffer;
            }
          }
          // Update content with regenerated content
          if (accumulatedText) {
            setContent(accumulatedText);
            // Don't update originalContent - it should remain unchanged to track original state
            // setOriginalContent(accumulatedText);
          }
          break; 
        }
        
        buffer += decoder.decode(value, { stream: true });
        
        // Split by newlines and process complete chunks
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const pkt = JSON.parse(line);
            if (pkt.type === "delta") {
              accumulatedText += pkt.text;
            } else if (pkt.type === "error") {
              throw new Error(pkt.text || "Unknown error");
            }
          } catch (e) {
            // If not JSON, treat as plain text
            accumulatedText += line;
          }
        }
      }
    } catch (e: any) {
      console.error("Failed to regenerate section:", e);
      // Don't show error to user for title edits, just log it
    }
  };

  // Use the actual theme options from our theme system
  const themeOptions = THEME_OPTIONS;

  // Cleanup effect to prevent stuck states
  useEffect(() => {
    return () => {
      // Cleanup on unmount to prevent memory leaks and stuck states
      if (previewAbortRef.current) {
        previewAbortRef.current.abort();
      }
      // Reset generating state when component unmounts
      setIsGenerating(false);
      setLoading(false);
    };
  }, []);

  // Auto-reset if stuck in generating state for too long
  useEffect(() => {
    if (isGenerating) {
      const stuckStateTimeout = setTimeout(() => {
        console.warn("Detected stuck finalization state, auto-resetting...");
        setIsGenerating(false);
        setError("Finalization took too long and was reset. Please try again.");
      }, 180000); // 3 minutes failsafe
      
      return () => clearTimeout(stuckStateTimeout);
    }
  }, [isGenerating]);

  // Detect if user navigates away during generation and reset state
  useEffect(() => {
    const handleRouteChange = () => {
      if (isGenerating) {
        setIsGenerating(false);
        setLoading(false);
      }
    };

    // Listen for route changes
    window.addEventListener('beforeunload', handleRouteChange);
    return () => window.removeEventListener('beforeunload', handleRouteChange);
  }, [isGenerating]);

  // Theme configuration for outline colors (matching CourseOutlineClient)
  const themeConfig = {
    cherry: {
      headerBg: "bg-[#E5EEFF]",
      numberColor: "text-gray-600",
      accentBg: "bg-[#0540AB]",
      accentBgHover: "hover:bg-[#043a99]",
      accentText: "text-[#0540AB]",
    },
    lunaria: {
      headerBg: "bg-[#85749E]",
      numberColor: "text-white",
      accentBg: "bg-[#85749E]",
      accentBgHover: "hover:bg-[#6b5d7a]",
      accentText: "text-[#85749E]",
    },
    wine: {
      headerBg: "bg-[#E5EEFF]",
      numberColor: "text-gray-600",
      accentBg: "bg-[#0540AB]",
      accentBgHover: "hover:bg-[#043a99]",
      accentText: "text-[#0540AB]",
    },
    vanilla: {
      headerBg: "bg-[#C4B5D6]",
      numberColor: "text-white",
      accentBg: "bg-[#8776A0]",
      accentBgHover: "hover:bg-[#7a6b92]",
      accentText: "text-[#8776A0]",
    },
    terracotta: {
      headerBg: "bg-[#C4D6B5]",
      numberColor: "text-white",
      accentBg: "bg-[#2D7C21]",
      accentBgHover: "hover:bg-[#26701e]",
      accentText: "text-[#2D7C21]",
    },
    zephyr: {
      headerBg: "bg-[#E5EEFF]",
      numberColor: "text-gray-600",
      accentBg: "bg-[#0540AB]",
      accentBgHover: "hover:bg-[#043a99]",
      accentText: "text-[#0540AB]",
    },
  };

  const currentTheme = themeConfig[selectedTheme as keyof typeof themeConfig] || themeConfig.cherry;

  return (
    <>
    <main
      className="min-h-screen py-4 pb-24 px-4 flex flex-col items-center"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #CBDAFB 35%, #AEE5FA 70%, #FFFFFF 100%)",
      }}
    >
      <div className="w-full max-w-3xl flex flex-col gap-6 text-gray-900 relative">
        <Link
          href="/create/generate"
          className="fixed top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white z-20"
        >
          <ArrowLeft size={14} /> {t('interface.generate.back', 'Back')}
        </Link>

        <h1 className="text-2xl font-semibold text-center text-black mt-2">{t('interface.generate.title', 'Generate')}</h1>

        {/* Step-by-step process */}
        <div className="flex flex-col items-center gap-4 mb-4">
          {/* Step 1: Choose source */}
          {useExistingOutline === null && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-lg font-medium text-gray-700">{t('interface.generate.lessonQuestion', 'Do you want to create a lesson from an existing Course Outline?')}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setUseExistingOutline(true)}
                  className="px-6 py-2 rounded-full border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium"
                >
                  {t('interface.generate.yesContentForLesson', 'Yes, content for the lesson from the outline')}
                </button>
                <button
                  onClick={() => setUseExistingOutline(false)}
                  className="px-6 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  {t('interface.generate.noStandaloneLesson', 'No, I want standalone lesson')}
                </button>
              </div>
            </div>
          )}

          {/* Step 2+: Show dropdowns based on choice */}
          {useExistingOutline !== null && (
            <div className="flex flex-wrap justify-center gap-2">
              {/* Show outline flow if user chose existing outline */}
              {useExistingOutline === true && (
                <>
                  {/* Outline dropdown */}
                  <div className="relative">
                    <select
                      value={selectedOutlineId ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedOutlineId(val ? Number(val) : null);
                        // clear module & lesson selections when outline changes
                        setSelectedModuleIndex(null);
                        setLessonsForModule([]);
                        setSelectedLesson("");
                      }}
                      className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                    >
                      <option value="">{t('interface.generate.selectOutline', 'Select Outline')}</option>
                      {outlines.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>

                  {/* Module dropdown – appears once outline is selected */}
                  {selectedOutlineId && (
                    <div className="relative">
                      <select
                        value={selectedModuleIndex ?? ""}
                        onChange={(e) => {
                          const idx = e.target.value ? Number(e.target.value) : null;
                          setSelectedModuleIndex(idx);
                          setLessonsForModule(idx !== null ? modulesForOutline[idx].lessons : []);
                          setSelectedLesson("");
                        }}
                        disabled={modulesForOutline.length === 0}
                        className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                      >
                        <option value="">{t('interface.generate.selectModule', 'Select Module')}</option>
                        {modulesForOutline.map((m, idx) => (
                          <option key={idx} value={idx}>{m.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                    </div>
                  )}

                  {/* Lesson dropdown – appears when module chosen */}
                  {selectedModuleIndex !== null && (
                    <div className="relative">
                      <select
                        value={selectedLesson}
                        onChange={(e) => setSelectedLesson(e.target.value)}
                        className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                      >
                        <option value="">{t('interface.generate.selectLesson', 'Select Lesson')}</option>
                        {lessonsForModule.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                    </div>
                  )}

                  {/* Show final dropdowns when lesson is selected */}
                  {selectedLesson && (
                    <>
                      <div className="relative">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                        >
                          <option value="en">{t('interface.english', 'English')}</option>
                          <option value="uk">{t('interface.ukrainian', 'Ukrainian')}</option>
                          <option value="es">{t('interface.spanish', 'Spanish')}</option>
                          <option value="ru">{t('interface.russian', 'Russian')}</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select
                          value={slidesCount}
                          onChange={(e) => setSlidesCount(Number(e.target.value))}
                          className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                        >
                          {Array.from({ length: 14 }, (_, i) => i + 2).map((n) => (
                            <option key={n} value={n}>{n} {t('interface.generate.slides', 'slides')}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Show standalone lesson dropdowns if user chose standalone */}
              {useExistingOutline === false && (
                <>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                    >
                      <option value="en">{t('interface.english', 'English')}</option>
                      <option value="uk">{t('interface.ukrainian', 'Ukrainian')}</option>
                      <option value="es">{t('interface.spanish', 'Spanish')}</option>
                      <option value="ru">{t('interface.russian', 'Russian')}</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={slidesCount}
                      onChange={(e) => setSlidesCount(Number(e.target.value))}
                      className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                    >
                      {Array.from({ length: 14 }, (_, i) => i + 2).map((n) => (
                        <option key={n} value={n}>{n} {t('interface.generate.slides', 'slides')}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>
                </>
              )}

              {/* Reset button */}
              <button
                onClick={() => {
                  setUseExistingOutline(null);
                  setSelectedOutlineId(null);
                  setSelectedModuleIndex(null);
                  setLessonsForModule([]);
                  setSelectedLesson("");
                }}
                className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-gray-600 hover:bg-gray-100"
              >
                {t('interface.generate.backButton', '← Back')}
              </button>
            </div>
          )}
        </div>

        {/* Prompt input for standalone lessons */}
        {useExistingOutline === false && (
          <textarea
            value={params?.get("prompt") || ""}
            onChange={(e) => {
              const sp = new URLSearchParams(params?.toString() || "");
              sp.set("prompt", e.target.value);
              router.replace(`?${sp.toString()}`, { scroll: false });
            }}
            placeholder={t('interface.generate.promptPlaceholder', 'Describe what you\'d like to make')}
            rows={1}
            className="w-full border border-gray-300 rounded-md p-3 resize-none overflow-hidden bg-white/90 placeholder-gray-500 min-h-[56px]"
          />
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-[#20355D]">{t('interface.generate.lesson', 'Lesson')} {t('interface.generate.content', 'Content')}</h2>
          {loading && <LoadingAnimation message={t('interface.generate.generatingLessonContent', 'Generating lesson content...')} />}
          {error && <p className="text-red-600 bg-white/50 rounded-md p-4 text-center">{error}</p>}
          
          {/* Main content display - Custom slide titles display matching course outline format */}
          {textareaVisible && (
            <div
              className="bg-white border border-gray-300 rounded-xl p-6 flex flex-col gap-6 relative"
              style={{ animation: 'fadeInDown 0.25s ease-out both' }}
            >
              {loadingEdit && (
                <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
                  <LoadingAnimation message={t('interface.generate.applyingEdit', 'Applying edit...')} />
                </div>
              )}
              
              {/* Parse and display slide titles in course outline format */}
              {(() => {
                // Split slides properly - first try by --- separators, then by language-agnostic patterns
                let slides = [];
                if (content.includes('---')) {
                  // Split by --- separators
                  slides = content.split(/^---\s*$/m).filter(slide => slide.trim());
                } else {
                  // Split by language-agnostic pattern: **[anything] [number]: [title]
                  slides = content.split(/(?=\*\*[^*]+\s+\d+\s*:)/).filter(slide => slide.trim());
                }
                
                // Filter out slides that don't have proper numbered slide pattern (language-agnostic)
                slides = slides.filter(slideContent => {
                  const hasSlidePattern = /\*\*[^*]+\s+\d+\s*:/.test(slideContent);
                  return hasSlidePattern;
                });
                
                return slides.map((slideContent, slideIdx) => {
                  // Extract slide title using language-agnostic pattern: **[word(s)] [number]: [title]
                  const titleMatch = slideContent.match(/\*\*[^*]+\s+\d+\s*:\s*([^*`\n]+)/);
                  let title = '';
                  
                  if (titleMatch) {
                    title = titleMatch[1].trim();
                  } else {
                    // Fallback: look for any **text** pattern at the start
                    const fallbackMatch = slideContent.match(/\*\*([^*]+)\*\*/);
                    title = fallbackMatch ? fallbackMatch[1].trim() : `Slide ${slideIdx + 1}`;
                  }
                  
                  return (
                    <div key={slideIdx} className="flex rounded-xl shadow-sm overflow-hidden">
                      {/* Left colored bar with index - matching course outline styling */}
                      <div className={`w-[60px] ${currentTheme.headerBg} flex items-start justify-center pt-5`}>
                        <span className={`${currentTheme.numberColor} font-semibold text-base select-none`}>{slideIdx + 1}</span>
                      </div>

                      {/* Main card - matching course outline styling */}
                      <div className="flex-1 bg-white border border-gray-300 rounded-r-xl p-5">
                        {/* Slide title */}
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => {
                            const newTitle = e.target.value;
                            // Call the section-specific regeneration function
                            handleSectionTitleEdit(slideIdx, newTitle, title);
                          }}
                          className="w-full font-medium text-lg border-none focus:ring-0 text-gray-900 mb-3"
                          placeholder={`${t('interface.generate.slideTitle', 'Slide')} ${slideIdx + 1} ${t('interface.generate.title', 'title')}`}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </section>

        {/* Inline Advanced section & button */}
        {streamDone && content && (
          <>
            {showAdvanced && (
              <div className="w-full bg-white border border-gray-300 rounded-xl p-4 flex flex-col gap-3 mb-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder={t('interface.generate.describeImprovements', 'Describe what you\'d like to improve...')}
                  className="w-full border border-gray-300 rounded-md p-3 resize-none min-h-[80px] text-black"
                />

                {/* Example prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                  {lessonExamples.map((ex) => (
                    <button
                      key={ex.short}
                      type="button"
                      onClick={() => toggleExample(ex)}
                      className={`relative text-left border border-gray-200 rounded-md px-4 py-3 text-sm w-full cursor-pointer transition-colors ${
                        selectedExamples.includes(ex.short) ? 'bg-white shadow' : 'bg-[#D9ECFF] hover:bg-white'
                      }`}
                    >
                      {ex.short}
                      <Plus size={14} className="absolute right-2 top-2 text-gray-600 opacity-60" />
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={loadingEdit || !editPrompt.trim()}
                    onClick={handleApplyLessonEdit}
                    className={`px-6 py-2 rounded-full ${currentTheme.accentBg} text-white text-sm font-medium ${currentTheme.accentBgHover} disabled:opacity-50 flex items-center gap-1`}
                  >
                    {loadingEdit ? <LoadingAnimation message={t('interface.generate.applying', 'Applying...')} /> : (<>{t('interface.edit', 'Edit')} <Sparkles size={14} /></>)}
                  </button>
                </div>
              </div>
            )}
            <div className="w-full flex justify-center mt-2 mb-6">
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="flex items-center gap-1 text-sm text-[#396EDF] hover:opacity-80 transition-opacity select-none"
              >
                {t('interface.generate.advancedMode', 'Advanced Mode')}
                <Settings size={14} className={`${showAdvanced ? 'rotate-180' : ''} transition-transform`} />
              </button>
            </div>
          </>
        )}

        {streamDone && content && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-[#20355D]">{t('interface.generate.setupContentBuilder', 'Set up your Contentbuilder')}</h2>
            <div className="bg-white border border-gray-300 rounded-xl px-6 pt-5 pb-6 flex flex-col gap-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-[#20355D]">{t('interface.generate.themes', 'Themes')}</h2>
                  <p className="mt-1 text-[#858587] font-medium text-sm">{t('interface.generate.themesDescription', 'Use one of our popular themes below or browse others')}</p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-[#20355D] hover:opacity-80 transition-opacity"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-palette-icon lucide-palette w-4 h-4"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></svg>
                  <span>{t('interface.generate.viewMore', 'View more')}</span>
                </button>
              </div>
              
              <div className="flex flex-col gap-5">
                {/* Themes grid */}
                <div className="grid grid-cols-3 gap-5 justify-items-center">
                  {themeOptions.map((theme) => {
                    const ThemeSvgComponent = getThemeSvg(theme.id);
                    const isSelected = selectedTheme === theme.id;
                    
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`flex flex-col rounded-lg overflow-hidden border border-transparent shadow-sm transition-all p-2 gap-2 ${
                          isSelected 
                            ? 'bg-[#cee2fd]' 
                            : ''
                        }`}
                      >
                        <div className="w-[214px] h-[116px] flex items-center justify-center">
                          <ThemeSvgComponent />
                        </div>
                        <div className="flex items-center gap-1 px-2">
                          <span className={`w-4 ${currentTheme.accentText} ${isSelected ? '' : 'opacity-0'}`}>
                            ✔
                          </span>
                          <span className="text-sm text-[#20355D] font-medium select-none">
                            {theme.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Content section */}
                <div className="border-t border-gray-200 pt-5 flex flex-col gap-4">
                  <h3 className="text-lg font-semibold text-[#20355D]">{t('interface.generate.content', 'Content')}</h3>
                  <p className="text-sm text-[#858587] font-medium">{t('interface.generate.contentDescription', 'Adjust text and image styles for your lesson')}</p>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-800 select-none">{t('interface.generate.amountOfTextPerCard', 'Amount of text per card')}</label>
                    <div className="flex w-full border border-gray-300 rounded-full overflow-hidden text-sm font-medium text-[#20355D] select-none">
                      {[{ id: "brief", label: t('interface.generate.brief', 'Brief'), icon: <AlignLeft size={14} /> }, { id: "medium", label: t('interface.generate.medium', 'Medium'), icon: <AlignCenter size={14} /> }, { id: "detailed", label: t('interface.generate.detailed', 'Detailed'), icon: <AlignRight size={14} /> }].map((opt) => (
                        <button key={opt.id} type="button" onClick={() => setTextDensity(opt.id as any)} className={`flex-1 py-2 flex items-center justify-center gap-1 transition-colors ${textDensity === opt.id ? 'bg-[#d6e6fd]' : 'bg-white'}`}>
                          {opt.icon} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-800 select-none">{t('interface.generate.imageSource', 'Image source')}</label>
                    <div className="relative w-full">
                      <select value={imageSource} onChange={(e) => setImageSource(e.target.value)} className="appearance-none pr-8 w-full px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-black">
                        <option value="ai">{t('interface.generate.aiImages', 'AI images')}</option><option value="stock">{t('interface.generate.stockImages', 'Stock images')}</option><option value="none">{t('interface.generate.noImages', 'No images')}</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-800 select-none">{t('interface.generate.aiImageModel', 'AI image model')}</label>
                    <div className="relative w-full">
                      <select value={aiModel} onChange={(e) => setAiModel(e.target.value)} className="appearance-none pr-8 w-full px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-black">
                        <option value="flux-fast">{t('interface.generate.fluxFast', 'Flux Kontext Fast')}</option><option value="flux-quality">{t('interface.generate.fluxQuality', 'Flux Kontext HQ')}</option><option value="stable">{t('interface.generate.stableDiffusion', 'Stable Diffusion 2.1')}</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {streamDone && content && (
          <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-300 py-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-medium text-[#20355D] select-none">
              {/* Credits calculated based on slide count */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 10.5C14 11.8807 11.7614 13 9 13C6.23858 13 4 11.8807 4 10.5M14 10.5C14 9.11929 11.7614 8 9 8C6.23858 8 4 9.11929 4 10.5M14 10.5V14.5M4 10.5V14.5M20 5.5C20 4.11929 17.7614 3 15 3C13.0209 3 11.3104 3.57493 10.5 4.40897M20 5.5C20 6.42535 18.9945 7.23328 17.5 7.66554M20 5.5V14C20 14.7403 18.9945 15.3866 17.5 15.7324M20 10C20 10.7567 18.9495 11.4152 17.3999 11.755M14 14.5C14 15.8807 11.7614 17 9 17C6.23858 17 4 15.8807 4 14.5M14 14.5V18.5C14 19.8807 11.7614 21 9 21C6.23858 21 4 19.8807 4 18.5V14.5" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>{calculateLessonPresentationCredits(slidesCount)} {t('interface.generate.credits', 'credits')}</span>
            </div>
            <div className="flex items-center gap-[7.5rem]">
              <span className="text-lg text-gray-700 font-medium select-none">
                {/* This can be word count or removed */}
                {content.split(/\s+/).length} {t('interface.generate.words', 'words')}
              </span>
              <button
                type="button"
                onClick={handleGenerateFinal}
                className={`px-24 py-3 rounded-full ${currentTheme.accentBg} text-white text-lg font-semibold ${currentTheme.accentBgHover} active:scale-95 shadow-lg transition-transform disabled:opacity-50 flex items-center justify-center gap-2`}
                disabled={loading || isGenerating}
              >
                <Sparkles size={18} />
                <span className="select-none font-semibold">{t('interface.generate.generate', 'Generate')}</span>
              </button>
            </div>
            <button type="button" disabled className="w-9 h-9 rounded-full border-[0.5px] border-[#63A2FF] text-[#000d4e] flex items-center justify-center opacity-60 cursor-not-allowed select-none font-bold" aria-label="Help (coming soon)">?</button>
          </div>
        )}
      </div>
    </main>
    <style jsx global>{`
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      button, select, input[type="checkbox"], label[role="button"], label[for] { cursor: pointer; }
    `}</style>
    {isGenerating && (
      <div className="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-50">
        <LoadingAnimation message="Finalizing lesson..." />
      </div>
    )}
    </>
  );
} 