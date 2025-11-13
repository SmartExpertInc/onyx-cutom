"use client";
/* eslint-disable */
// @ts-nocheck – this component is compiled by Next.js but lives outside the main
// app dir, so local tsconfig paths/types do not apply. Disable type-checking to
// avoid IDE / build noise until shared tsconfig is wired up.

import React, { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Plus, Sparkles, ChevronDown, Settings, AlignLeft, AlignCenter, AlignRight, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, CustomPillSelector } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter } from "next/navigation";
import { ThemeSvgs } from "../../../components/theme/ThemeSvgs";
import { useLanguage } from "../../../contexts/LanguageContext";
import PresentationPreview from "../../../components/PresentationPreview";
import { THEME_OPTIONS, getThemeSvg, getFilteredThemeOptions } from "../../../constants/themeConstants";
import { DEFAULT_SLIDE_THEME } from "../../../types/slideThemes";
import { useCreationTheme } from "../../../hooks/useCreationTheme";
import { getPromptFromUrlOrStorage, generatePromptId } from "../../../utils/promptUtils";
import { trackCreateProduct } from "../../../lib/mixpanelClient"
import useFeaturePermission from "../../../hooks/useFeaturePermission";
import { FeedbackButton } from "@/components/ui/feedback-button";
import { AiAgent } from "@/components/ui/ai-agent";
import { BackButton } from "../components/BackButton";
import InsufficientCreditsModal from "../../../components/InsufficientCreditsModal";
import ManageAddonsModal from "../../../components/AddOnsModal";

// Base URL so frontend can reach custom backend through nginx proxy
const CUSTOM_BACKEND_URL =
  process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

// Simple bouncing dots loading animation (optionally with a status line)
type LoadingProps = { message?: string; showFallback?: boolean };
const LoadingAnimation: React.FC<LoadingProps> = ({ message, showFallback = true }) => {
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
        <p className="text-sm text-gray-600 select-none min-h-[1.25rem]">{showFallback ? (message || t('interface.generate.loading', 'Generating...')) : message}</p>
      )}
    </div>
  );
};

// Compact radial progress ring (16×16) used for char-count indicator
const RadialProgress: React.FC<{ progress: number; theme: string }> = ({ progress, theme }) => {
  const size = 16;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(progress, 0), 1));
  
  // Theme-specific colors for the progress ring
  const progressColors = {
    cherry: { bg: "#E5EEFF", fill: "#0540AB" },
    lunaria: { bg: "#C4B5D6", fill: "#85749E" },
    wine: { bg: "#E5EEFF", fill: "#0540AB" },
    vanilla: { bg: "#C4B5D6", fill: "#8776A0" },
    terracotta: { bg: "#C4D6B5", fill: "#2D7C21" },
    zephyr: { bg: "#E5EEFF", fill: "#0540AB" },
  };
  
  const colors = progressColors[theme as keyof typeof progressColors] || progressColors.cherry;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="inline-block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colors.bg}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colors.fill}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
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
    <path d="M0 250.141C0 251.72 4.02944 253 9 253H409C412.866 253 416 252.004 416 250.776V192H0V250.141Z" fill="#431423" />
    <path d="M2 9C2 4.02944 6.01006 0 10.9567 0H409.034C412.881 0 416 3.13401 416 7V192H2V9Z" fill="#431423" />
    <path d="M414 7C414 4.23858 411.761 2 409 2H9C5.13401 2 2 5.13401 2 9V190H414V7ZM416 192H0V9C0 4.02944 4.02944 1.28851e-07 9 0H409L409.36 0.00878906C413.059 0.19633 416 3.25486 416 7V192Z" fill="#3F1C27" />
    <path d="M31 32H383V192H31V32Z" fill="#5B2439" />
    <path d="M205.476 169.69L205.455 165.97H205.985L212.223 159.346H215.871L208.757 166.887H208.278L205.476 169.69ZM202.673 175V154.127H205.72V175H202.673ZM212.559 175L206.953 167.56L209.053 165.43L216.299 175H212.559Z" fill="#CE9998" />
    <path d="M188.567 165.705V175H185.52V159.345H188.445V161.893H188.639C188.999 161.064 189.563 160.399 190.331 159.896C191.105 159.393 192.08 159.142 193.256 159.142C194.322 159.142 195.257 159.366 196.058 159.814C196.86 160.256 197.482 160.915 197.924 161.791C198.365 162.668 198.586 163.752 198.586 165.043V175H195.539V165.41C195.539 164.275 195.243 163.388 194.652 162.749C194.061 162.104 193.249 161.781 192.216 161.781C191.509 161.781 190.881 161.934 190.331 162.24C189.787 162.546 189.356 162.994 189.036 163.585C188.724 164.17 188.567 164.876 188.567 165.705Z" fill="#CE9998" />
    <path d="M178.373 175V159.345H181.42V175H178.373ZM179.912 156.93C179.382 156.93 178.927 156.753 178.546 156.4C178.173 156.04 177.986 155.612 177.986 155.116C177.986 154.613 178.173 154.185 178.546 153.832C178.927 153.472 179.382 153.292 179.912 153.292C180.442 153.292 180.894 153.472 181.268 153.832C181.648 154.185 181.838 154.613 181.838 155.116C181.838 155.612 181.648 156.04 181.268 156.4C180.894 156.753 180.442 156.93 179.912 156.93Z" fill="#CE9998" />
    <path d="M174.274 154.127V175H171.226V154.127H174.274Z" fill="#CE9998" />
    <path d="M151.011 175.296C149.611 175.296 148.405 175.041 147.393 174.531C146.387 174.022 145.613 173.329 145.069 172.452C144.525 171.569 144.254 170.57 144.254 169.456C144.254 168.606 144.43 167.852 144.784 167.193C145.137 166.527 145.63 165.912 146.261 165.348C146.893 164.784 147.624 164.217 148.453 163.646L151.816 161.272C152.387 160.898 152.832 160.504 153.151 160.089C153.47 159.668 153.63 159.148 153.63 158.53C153.63 158.041 153.419 157.572 152.998 157.124C152.577 156.675 152.013 156.451 151.306 156.451C150.817 156.451 150.386 156.57 150.012 156.808C149.645 157.046 149.356 157.351 149.146 157.725C148.942 158.092 148.84 158.479 148.84 158.887C148.84 159.362 148.969 159.841 149.227 160.324C149.492 160.806 149.832 161.306 150.246 161.822C150.661 162.332 151.096 162.862 151.551 163.412L161.243 175H157.799L149.778 165.573C149.105 164.778 148.48 164.03 147.902 163.33C147.325 162.624 146.856 161.91 146.496 161.19C146.143 160.463 145.966 159.678 145.966 158.836C145.966 157.878 146.183 157.029 146.618 156.288C147.06 155.541 147.675 154.956 148.463 154.535C149.251 154.114 150.175 153.903 151.235 153.903C152.309 153.903 153.229 154.114 153.997 154.535C154.772 154.949 155.366 155.503 155.781 156.196C156.202 156.882 156.412 157.633 156.412 158.449C156.412 159.441 156.164 160.317 155.668 161.078C155.179 161.832 154.503 162.525 153.64 163.157L149.451 166.245C148.636 166.843 148.069 167.434 147.749 168.019C147.437 168.596 147.281 169.048 147.281 169.374C147.281 169.972 147.433 170.526 147.739 171.035C148.052 171.545 148.487 171.953 149.044 172.258C149.608 172.564 150.267 172.717 151.021 172.717C151.796 172.717 152.55 172.551 153.284 172.218C154.024 171.878 154.693 171.392 155.291 170.76C155.896 170.128 156.375 169.371 156.728 168.487C157.082 167.604 157.258 166.616 157.258 165.522H160.01C160.01 166.867 159.857 168.005 159.551 168.936C159.246 169.86 158.875 170.614 158.441 171.198C158.013 171.776 157.608 172.228 157.228 172.554C157.105 172.663 156.99 172.771 156.881 172.88C156.773 172.989 156.657 173.098 156.535 173.206C155.828 173.92 154.972 174.446 153.966 174.786C152.968 175.126 151.982 175.296 151.011 175.296Z" fill="#CE9998" />
    <path d="M123.011 180.87C122.556 180.87 122.142 180.833 121.768 180.758C121.394 180.69 121.116 180.616 120.932 180.534L121.666 178.037C122.223 178.187 122.719 178.251 123.154 178.231C123.589 178.21 123.973 178.047 124.306 177.742C124.646 177.436 124.945 176.936 125.203 176.243L125.58 175.204L119.852 159.345H123.113L127.078 171.494H127.241L131.206 159.345H134.477L128.026 177.089C127.727 177.905 127.346 178.594 126.884 179.158C126.422 179.729 125.872 180.157 125.233 180.442C124.595 180.728 123.854 180.87 123.011 180.87Z" fill="#CE9998" />
    <path d="M108.98 175.306C107.716 175.306 106.588 174.983 105.596 174.338C104.611 173.685 103.837 172.758 103.273 171.555C102.715 170.346 102.437 168.895 102.437 167.203C102.437 165.512 102.719 164.064 103.283 162.862C103.854 161.659 104.635 160.738 105.627 160.1C106.619 159.461 107.743 159.142 109 159.142C109.972 159.142 110.753 159.305 111.344 159.631C111.942 159.95 112.404 160.324 112.731 160.752C113.063 161.18 113.322 161.557 113.505 161.883H113.689V154.127H116.736V175H113.76V172.564H113.505C113.322 172.897 113.057 173.278 112.71 173.706C112.37 174.134 111.902 174.507 111.304 174.827C110.706 175.146 109.931 175.306 108.98 175.306ZM109.653 172.707C110.529 172.707 111.27 172.476 111.874 172.014C112.486 171.545 112.948 170.896 113.261 170.067C113.58 169.238 113.74 168.273 113.74 167.173C113.74 166.086 113.583 165.134 113.271 164.319C112.958 163.504 112.5 162.868 111.895 162.413C111.29 161.958 110.543 161.73 109.653 161.73C108.735 161.73 107.971 161.968 107.36 162.444C106.748 162.919 106.286 163.568 105.973 164.39C105.668 165.213 105.515 166.14 105.515 167.173C105.515 168.219 105.671 169.16 105.984 169.996C106.296 170.832 106.758 171.494 107.37 171.983C107.988 172.466 108.749 172.707 109.653 172.707Z" fill="#CE9998" />
    <path d="M92.421 175.316C90.9533 175.316 89.6726 174.98 88.5787 174.307C87.4847 173.634 86.6354 172.693 86.0307 171.484C85.426 170.274 85.1237 168.861 85.1237 167.244C85.1237 165.62 85.426 164.2 86.0307 162.984C86.6354 161.768 87.4847 160.823 88.5787 160.151C89.6726 159.478 90.9533 159.142 92.421 159.142C93.8886 159.142 95.1693 159.478 96.2633 160.151C97.3572 160.823 98.2065 161.768 98.8112 162.984C99.4159 164.2 99.7183 165.62 99.7183 167.244C99.7183 168.861 99.4159 170.274 98.8112 171.484C98.2065 172.693 97.3572 173.634 96.2633 174.307C95.1693 174.98 93.8886 175.316 92.421 175.316ZM92.4312 172.758C93.3824 172.758 94.1705 172.506 94.7956 172.004C95.4207 171.501 95.8828 170.832 96.1817 169.996C96.4875 169.16 96.6403 168.239 96.6403 167.234C96.6403 166.235 96.4875 165.318 96.1817 164.482C95.8828 163.64 95.4207 162.964 94.7956 162.454C94.1705 161.944 93.3824 161.69 92.4312 161.69C91.4731 161.69 90.6782 161.944 90.0463 162.454C89.4212 162.964 88.9558 163.64 88.65 164.482C88.351 165.318 88.2016 166.235 88.2016 167.234C88.2016 168.239 88.351 169.16 88.65 169.996C88.9558 170.832 89.4212 171.501 90.0463 172.004C90.6782 172.506 91.4731 172.758 92.4312 172.758Z" fill="#CE9998" />
    <path d="M67.2932 175V154.127H74.937C76.4182 154.127 77.6446 154.372 78.6162 154.861C79.5878 155.344 80.3148 155.999 80.7972 156.828C81.2796 157.65 81.5209 158.578 81.5209 159.61C81.5209 160.48 81.3612 161.214 81.0418 161.812C80.7225 162.403 80.2944 162.879 79.7577 163.239C79.2277 163.592 78.6434 163.85 78.0047 164.013V164.217C78.6977 164.251 79.3738 164.475 80.0329 164.89C80.6987 165.297 81.2491 165.878 81.6839 166.633C82.1188 167.387 82.3362 168.304 82.3362 169.384C82.3362 170.451 82.0848 171.409 81.582 172.258C81.086 173.101 80.3182 173.77 79.2787 174.266C78.2391 174.755 76.9108 175 75.2937 175H67.2932ZM70.4424 172.299H74.9879C76.4963 172.299 77.5766 172.007 78.2289 171.423C78.8812 170.838 79.2073 170.108 79.2073 169.232C79.2073 168.572 79.0409 167.968 78.7079 167.417C78.375 166.867 77.8994 166.429 77.2811 166.103C76.6696 165.777 75.9426 165.613 75.1 165.613H70.4424V172.299ZM70.4424 163.157H74.6618C75.3684 163.157 76.0037 163.021 76.5677 162.75C77.1384 162.478 77.5902 162.097 77.9232 161.608C78.2629 161.112 78.4327 160.528 78.4327 159.855C78.4327 158.992 78.1304 158.269 77.5257 157.684C76.921 157.1 75.9935 156.808 74.7433 156.808H70.4424V163.157Z" fill="#CE9998" />
    <path d="M152.901 115.509C150.287 115.509 148.029 114.966 146.128 113.88C144.238 112.782 142.784 111.232 141.766 109.229C140.747 107.214 140.238 104.844 140.238 102.116C140.238 99.4344 140.747 97.0806 141.766 95.055C142.795 93.0181 144.233 91.4338 146.077 90.3022C147.922 89.1592 150.089 88.5878 152.578 88.5878C154.185 88.5878 155.702 88.848 157.127 89.3686C158.565 89.8778 159.832 90.67 160.93 91.745C162.039 92.8201 162.91 94.1893 163.544 95.8528C164.178 97.505 164.494 99.474 164.494 101.76V103.644H143.124V99.5023H158.604C158.593 98.3254 158.338 97.2787 157.84 96.3621C157.342 95.4341 156.647 94.7042 155.753 94.1724C154.87 93.6405 153.84 93.3746 152.663 93.3746C151.407 93.3746 150.304 93.6801 149.353 94.2912C148.403 94.8909 147.661 95.6831 147.13 96.6676C146.609 97.6408 146.343 98.7102 146.332 99.8758V103.491C146.332 105.008 146.609 106.309 147.163 107.395C147.718 108.47 148.493 109.297 149.489 109.874C150.485 110.44 151.65 110.722 152.986 110.722C153.88 110.722 154.689 110.598 155.413 110.349C156.137 110.089 156.765 109.71 157.297 109.212C157.829 108.714 158.231 108.097 158.502 107.361L164.24 108.007C163.878 109.523 163.187 110.847 162.169 111.979C161.162 113.099 159.872 113.97 158.299 114.593C156.726 115.204 154.926 115.509 152.901 115.509Z" fill="#E6A18E" />
    <path d="M135.04 80.2363V115H128.895V80.2363H135.04Z" fill="#E6A18E" />
    <path d="M123.196 88.9273V93.6801H108.207V88.9273H123.196ZM111.908 82.6807H118.052V107.158C118.052 107.984 118.177 108.618 118.426 109.059C118.686 109.489 119.026 109.783 119.444 109.942C119.863 110.1 120.327 110.179 120.836 110.179C121.221 110.179 121.572 110.151 121.889 110.094C122.217 110.038 122.466 109.987 122.635 109.942L123.671 114.745C123.343 114.859 122.873 114.983 122.262 115.119C121.662 115.255 120.927 115.334 120.055 115.356C118.516 115.402 117.13 115.17 115.897 114.66C114.663 114.14 113.684 113.336 112.96 112.25C112.247 111.164 111.896 109.806 111.908 108.176V82.6807Z" fill="#E6A18E" />
    <path d="M97.7127 115V88.9273H103.857V115H97.7127ZM100.802 85.2269C99.8289 85.2269 98.9915 84.9043 98.2898 84.2593C97.5882 83.603 97.2374 82.8165 97.2374 81.8999C97.2374 80.9719 97.5882 80.1855 98.2898 79.5404C98.9915 78.8841 99.8289 78.5559 100.802 78.5559C101.787 78.5559 102.624 78.8841 103.314 79.5404C104.016 80.1855 104.367 80.9719 104.367 81.8999C104.367 82.8165 104.016 83.603 103.314 84.2593C102.624 84.9043 101.787 85.2269 100.802 85.2269Z" fill="#E6A18E" />
    <path d="M64.9011 85.5154V80.2363H92.6373V85.5154H81.8925V115H75.6459V85.5154H64.9011Z" fill="#E6A18E" />
    <path d="M31 189H383V221H31V189Z" fill="#5B2439" />
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
  const storedCreditsData = sessionStorage.getItem('creditsReference');
  if (storedCreditsData) {
    if (slideCount < 10) {
      return JSON.parse(storedCreditsData).credits_reference.find(
        (item: any) => item.content_type === "presentation_under_10"
      )?.credits_amount;
    } else if (slideCount <= 20) {
      return JSON.parse(storedCreditsData).credits_reference.find(
        (item: any) => item.content_type === "presentation_10_20"
      )?.credits_amount;
    } else if (slideCount <= 30) {
      return JSON.parse(storedCreditsData).credits_reference.find(
        (item: any) => item.content_type === "presentation_30"
      )?.credits_amount;
    } else if (slideCount <= 40) {
      return JSON.parse(storedCreditsData).credits_reference.find(
        (item: any) => item.content_type === "presentation_40"
      )?.credits_amount;
    } else if (slideCount <= 50) {
      return JSON.parse(storedCreditsData).credits_reference.find(
        (item: any) => item.content_type === "presentation_50"
      )?.credits_amount;
    }
  }
  return 7;
};

export default function LessonPresentationClient() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const router = useRouter();
  
  // Process prompt from URL or sessionStorage and create local state
  const [currentPrompt, setCurrentPrompt] = useState(getPromptFromUrlOrStorage(params?.get("prompt") || ""));

  // File context for creation from documents
  const isFromFiles = params?.get("fromFiles") === "true";
  const folderIds = params?.get("folderIds")?.split(",").filter(Boolean) || [];
  const fileIds = params?.get("fileIds")?.split(",").filter(Boolean) || [];

  // Temp file context for one-time uploads (bypassing SmartDrive)
  const isFromTempFiles = params?.get("fromTempFiles") === "true";
  const tempFileContextId = params?.get("tempFileContextId") || null;

  // Text context for creation from user text
  const isFromText = params?.get("fromText") === "true";
  const textMode = params?.get("textMode") as 'context' | 'base' | null;
  
  // Knowledge Base context for creation from Knowledge Base search
  const isFromKnowledgeBase = params?.get("fromKnowledgeBase") === "true";
  const [userText, setUserText] = useState('');

  // Connector context for creation from selected connectors
  const isFromConnectors = params?.get("fromConnectors") === "true";
  const connectorIds = params?.get("connectorIds")?.split(",").filter(Boolean) || [];
  const connectorSources = params?.get("connectorSources")?.split(",").filter(Boolean) || [];
  const selectedFiles = params?.get("selectedFiles")?.split(",").filter(Boolean).map(file => decodeURIComponent(file)) || [];

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false); // Used for footer button state
  const [chatId, setChatId] = useState<string | null>(params?.get("chatId") || null);
  
  // Retry state for error handling
  const [retryCount, setRetryCount] = useState(0);
  const [retryTrigger, setRetryTrigger] = useState(0);
  
  // Modal states for insufficient credits
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [isHandlingInsufficientCredits, setIsHandlingInsufficientCredits] = useState(false);



  // Product type for video lesson vs regular presentation
  const productType = params?.get("productType") || "lesson_presentation";
  
  // Avatar carousel state for video lessons
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const avatarCarouselRef = useRef<HTMLDivElement>(null);
  
  // Content section dropdowns state
  const [selectedImageSource, setSelectedImageSource] = useState("Ai images");
  const [selectedAiModel, setSelectedAiModel] = useState("Nano banana");

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
  
  // Force regeneration when slides count changes
  const handleSlidesCountChange = (value: string) => {
    const newCount = Number(value);
    setSlidesCount(newCount);
  };

  // State for conditional dropdown logic
  const [useExistingOutline, setUseExistingOutline] = useState<boolean | null>(
    params?.get("outlineId") ? true : (currentPrompt ? false : null)
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
  // Auto-restart guard for malformed previews (no slides parsed)
  const [formatRetryCounter, setFormatRetryCounter] = useState(0);

  // Add debugging state to track restart attempts
  const [debugInfo, setDebugInfo] = useState<{
    attempts: number;
    lastAttemptTime: string;
    contentLength: number;
    slidesFound: number;
  } | null>(null);


  // Refs
  const previewAbortRef = useRef<AbortController | null>(null);
  // Note: textareaRef removed since we're using PresentationPreview instead

  // ---- AI Agent Side Panel ----
  const [showAiAgent, setShowAiAgent] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [advancedModeState, setAdvancedModeState] = useState<string | undefined>(undefined);
  const [advancedModeClicked, setAdvancedModeClicked] = useState(false);
  const advancedSectionRef = useRef<HTMLDivElement>(null);
  const [aiAgentChatStarted, setAiAgentChatStarted] = useState(false);
  const [aiAgentLastMessage, setAiAgentLastMessage] = useState("");
  
  
  const handleAdvancedModeClick = () => {
    if (advancedModeClicked == false) {
      setAdvancedModeState("Clicked");
      setAdvancedModeClicked(true);
    }
  };

  const lessonExamples: { short: string; detailed: string }[] = [
    {
      short: t('interface.generate.lessonExamples.adaptIndustry.short', 'Adapt to U.S. industry specifics'),
      detailed: t('interface.generate.lessonExamples.adaptIndustry.detailed', "Update the Lesson's structure based on U.S. industry and cultural specifics: adjust content, replace topics, examples, and wording that don't align with the American context."),
    },
    {
      short: t('interface.generate.lessonExamples.adoptTrends.short', 'Adopt trends and latest practices'),
      detailed: t('interface.generate.lessonExamples.adoptTrends.detailed', "Update the lesson's structure by adding content that reflect current trends and best practices in the field. Remove outdated elements and replace them with up-to-date content."),
    },
    {
      short: t('interface.generate.lessonExamples.topExamples.short', 'Incorporate top industry examples'),
      detailed: t('interface.generate.lessonExamples.topExamples.detailed', 'Analyze the best lessons on the market in this topic and restructure our lesson accordingly: change or add content which others present more effectively. Focus on content flow and clarity.'),
    },
    {
      short: t('interface.generate.lessonExamples.simplify.short', 'Simplify and restructure the content'),
      detailed: t('interface.generate.lessonExamples.simplify.detailed', "Rewrite the lesson's structure to make it more logical and user-friendly. Remove redundant sections, merge overlapping content, and rephrase content for clarity and simplicity."),
    },
    {
      short: t('interface.generate.lessonExamples.increaseDepth.short', 'Increase value and depth of content'),
      detailed: t('interface.generate.lessonExamples.increaseDepth.detailed', 'Strengthen the lesson by adding content that deepen understanding and bring advanced-level value. Refine wording to clearly communicate skills and insights being delivered.'),
    },
    {
      short: t('interface.generate.lessonExamples.addApplications.short', 'Add case studies and applications'),
      detailed: t('interface.generate.lessonExamples.addApplications.detailed', "Revise the lesson's structure to include applied content — such as real-life cases, examples, or actionable approaches — while keeping the theoretical foundation intact."),
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
      } catch (_) { }
    };
    fetchOutlines();
  }, [useExistingOutline]);


  const makeThoughts = () => {
    const list: string[] = [];
            list.push(`Analyzing lesson request for "${currentPrompt?.slice(0, 40) || "Untitled"}"...`);
    list.push(`Detected language: ${language.toUpperCase()}`);
    list.push(`Planning ${slidesCount} slides with ${lengthOption} content...`);
    // shuffle little filler line
    list.push("Consulting lesson knowledge base...");

    // Add a diverse set of informative yet playful status lines for quiz generation
    const extra = [
      "Crafting engaging content...",
      "Balancing information density...",
      "Selecting visual elements...",
      "Integrating learning objectives...",
      "Cross-checking content accuracy...",
      "Curating slide variety...",
      "Weaving narrative flow...",
      "Injecting practical examples...",
      "Sequencing learning logic...",
      "Optimizing engagement...",
      "Aligning with learning outcomes...",
      "Ensuring clear structure...",
      "Connecting concepts...",
      "Drafting comprehensive content...",
      "Incorporating real-world examples...",
      "Adding contextual scenarios...",
      "Scanning content relevance...",
      "Validating slide clarity...",
      "Polishing presentation flow...",
      "Finalizing lesson structure...",
    ];
    list.push(...extra);
    return list;
  };

  const [thoughts, setThoughts] = useState<string[]>(makeThoughts());
  const [thoughtIdx, setThoughtIdx] = useState(0);
  const thoughtTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null); // Backend progress updates

  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  const delayForThought = (text: string): number => {
    if (text.startsWith("Analyzing")) return rand(2500, 5000);
    if (text.startsWith("Detected language")) return rand(1200, 2000);
    if (text.startsWith("Planning")) return rand(4000, 7000);
    if (text.startsWith("Consulting")) return rand(3500, 6000);
    if (text.startsWith("Finalizing")) return rand(3000, 5000);
    return rand(2000, 4000);
  };

  useEffect(() => {
    if (loading) {
      setThoughts(makeThoughts());
      setThoughtIdx(0);

      const scheduleNext = (index: number) => {
        const txt = thoughts[index];
        const delay = delayForThought(txt);
        if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
        if (txt.startsWith("Finalizing lesson")) return; // keep until loading finishes
        thoughtTimerRef.current = setTimeout(() => {
          setThoughtIdx((prev) => {
            const next = prev + 1;
            if (next < thoughts.length) {
              scheduleNext(next);
              return next;
            }
            // reached end, stay on last (finalizing)
            return prev;
          });
        }, delay);
      };

      scheduleNext(0);
    } else {
      if (thoughtTimerRef.current) {
        clearTimeout(thoughtTimerRef.current);
        thoughtTimerRef.current = null;
      }
    }
    return () => {
      if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
    };
     
  }, [loading, slidesCount, lengthOption, params, language]);

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
      } catch (_) { }
    };
    fetchLessons();
  }, [selectedOutlineId, useExistingOutline]);


  // Effect to trigger streaming preview generation
  useEffect(() => {
    // Skip while AI Agent edit is in progress to prevent content from disappearing
    if (loadingEdit) return;

    // Start preview when one of the following is true:
    //   • a lesson was chosen from the outline (old behaviour)
    //   • no lesson chosen, but the user provided a free-form prompt (new behaviour)
    const promptQuery = currentPrompt?.trim() || "";
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
        setProgressMessage(null); // Reset progress message
        setTextareaVisible(true);
        let gotFirstChunk = false;
        let lastDataTime = Date.now();
        let heartbeatInterval: NodeJS.Timeout | null = null;
        let heartbeatStarted = false;
        
        // Timeout settings
        const STREAM_TIMEOUT = 30000; // 30 seconds without data
        const HEARTBEAT_INTERVAL = 5000; // Check every 5 seconds

        // Cleanup function
        const cleanup = () => {
          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
          }
        };

        // Setup heartbeat to check for stream timeout
        const setupHeartbeat = () => {
          heartbeatInterval = setInterval(() => {
            const timeSinceLastData = Date.now() - lastDataTime;
            if (timeSinceLastData > STREAM_TIMEOUT) {
              console.warn('Stream timeout: No data received for', timeSinceLastData, 'ms');
              cleanup();
              abortController.abort();
              
              // Retry the request if we haven't exceeded max attempts
              if (attempt < 3) {
                console.log(`Retrying due to stream timeout (attempt ${attempt + 1}/3)`);
                setTimeout(() => startPreview(attempt + 1), 1500 * (attempt + 1));
                return;
              }
              
              setError("Failed to generate lesson – please try again later.");
              setLoading(false);
            }
          }, HEARTBEAT_INTERVAL);
        };

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

          // Add Knowledge Base context if creating from Knowledge Base
          if (isFromKnowledgeBase) {
            requestBody.fromKnowledgeBase = true;
          }

          // Add connector context if creating from connectors
          if (isFromConnectors) {
            requestBody.fromConnectors = true;
            requestBody.connectorIds = connectorIds.join(',');
            requestBody.connectorSources = connectorSources.join(',');
            if (selectedFiles.length > 0) {
              requestBody.selectedFiles = selectedFiles.join(',');
            }
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

            // Update last data time and reset timeout on any data received
            lastDataTime = Date.now();

            if (done) {
              // Update last data time for final buffer processing
              lastDataTime = Date.now();
              
              // Process any remaining buffer
              if (buffer.trim()) {
                try {
                  const pkt = JSON.parse(buffer.trim());
                  if (pkt.type === "delta") {
                    // Start heartbeat only after receiving first delta package
                    if (!heartbeatStarted) {
                      heartbeatStarted = true;
                      setupHeartbeat();
                    }
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
                gotFirstChunk = true;

                if (pkt.type === "delta") {
                  // Start heartbeat only after receiving first delta package
                  if (!heartbeatStarted) {
                    heartbeatStarted = true;
                    setupHeartbeat();
                  }
                  accumulatedText += pkt.text;
                  setContent(accumulatedText);
                } else if (pkt.type === "info") {
                  // Handle progress updates from backend
                  if (pkt.message) {
                    setProgressMessage(pkt.message);
                  }
                } else if (pkt.type === "done") {
                  setStreamDone(true);
                  setProgressMessage(null); // Clear progress when done
                  break;
                } else if (pkt.type === "error") {
                  setProgressMessage(null); // Clear progress on error
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
          // Always cleanup timeouts
          cleanup();
          
          // Always set loading to false when stream completes or is aborted
          setLoading(false);
          if (!abortController.signal.aborted && !gotFirstChunk && attempt >= 3) {
            setError("Failed to generate lesson – please try again later.");
          }
        }
      };

      fetchPreview();
    };

    startPreview();

    return () => {
      if (previewAbortRef.current) previewAbortRef.current.abort();
      // Reset JSON tracking state for new preview
      jsonConvertedRef.current = false;
      setOriginalJsonResponse(null);
    };
  }, [selectedOutlineId, selectedLesson, lengthOption, language, isFromText, userText, textMode, formatRetryCounter, slidesCount, retryTrigger]);

  // Note: Auto-scroll effect removed since we're using PresentationPreview instead of textarea

  // Track if we've converted a JSON preview to markdown to avoid loops
  const jsonConvertedRef = useRef<boolean>(false);
  // Store original JSON response to send during finalization instead of converted markdown
  const [originalJsonResponse, setOriginalJsonResponse] = useState<string | null>(null);
  // Editable state for titles and preview bullets
  const [editedTitles, setEditedTitles] = useState<Record<number, string>>({});
  const [editedBullets, setEditedBullets] = useState<Record<number, string[]>>({});

  const setTitleForSlide = (idx: number, value: string) => {
    setEditedTitles((prev) => ({ ...prev, [idx + 1]: value }));
  };
  const setBulletForSlide = (idx: number, bulletIdx: number, value: string) => {
    setEditedBullets((prev) => {
      const key = idx + 1;
      const arr = Array.isArray(prev[key]) ? [...prev[key]] : [];
      arr[bulletIdx] = value;
      return { ...prev, [key]: arr };
    });
  };
  const addBulletForSlide = (idx: number) => {
    setEditedBullets((prev) => {
      const key = idx + 1;
      const arr = Array.isArray(prev[key]) ? [...prev[key]] : [];
      arr.push("");
      return { ...prev, [key]: arr };
    });
  };

  // Helper: detect if a string is a single JSON object with slides
  // Handles large JSON, video lesson fields (voiceoverText, hasVoiceover), and various formatting
  const tryParsePresentationJson = (text: string): any | null => {
    if (!text || !text.trim()) return null;
    
    try {
      // Step 1: Clean and prepare text for parsing
      let cleaned = text.trim();
      
      // Remove markdown code blocks if present (```json ... ``` or ``` ... ```)
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
      cleaned = cleaned.trim();
      
      // Step 2: Try to find JSON object if it doesn't start with {
      // Sometimes JSON might be embedded in other text
      let jsonText = cleaned;
      if (!cleaned.startsWith("{")) {
        // Try to find JSON object boundaries
        const firstBrace = cleaned.indexOf('{');
        if (firstBrace >= 0) {
          // Find matching closing brace
          let depth = 0;
          let lastBrace = -1;
          for (let i = firstBrace; i < cleaned.length; i++) {
            if (cleaned[i] === '{') depth++;
            else if (cleaned[i] === '}') {
              depth--;
              if (depth === 0) {
                lastBrace = i;
                break;
              }
            }
          }
          if (lastBrace > firstBrace) {
            jsonText = cleaned.substring(firstBrace, lastBrace + 1);
          }
        } else {
          return null; // No JSON object found
        }
      }
      
      // Step 3: Parse JSON with improved error handling
      const obj = JSON.parse(jsonText);
      
      // Step 4: Validate structure - must be object with slides array
      if (!obj || typeof obj !== "object") return null;
      if (!Array.isArray(obj.slides)) return null;
      
      // Step 5: Additional validation for video lessons
      // Video lessons should have hasVoiceover field, but don't require it for parsing
      // Video lesson slides may have voiceoverText field
      
      // Log detection for debugging large JSON
      if (text.length > 10000) {
        console.log(`[JSON_PARSE] Large JSON detected: ${text.length} chars, ${obj.slides?.length || 0} slides`);
        console.log(`[JSON_PARSE] Has voiceover flag: ${!!obj.hasVoiceover}`);
        console.log(`[JSON_PARSE] Slides with voiceover: ${obj.slides?.filter((s: any) => s.voiceoverText).length || 0}`);
      }
      
      return obj;
    } catch (error) {
      // Enhanced error logging for debugging
      if (text.length > 10000) {
        console.warn(`[JSON_PARSE] Failed to parse large JSON (${text.length} chars):`, 
          error instanceof Error ? error.message : String(error));
        console.warn(`[JSON_PARSE] First 200 chars:`, text.substring(0, 200));
        console.warn(`[JSON_PARSE] Last 200 chars:`, text.substring(Math.max(0, text.length - 200)));
      }
      return null;
    }
  };

  // Helper: convert JSON SlideDeckDetails to markdown for current preview UI
  const convertPresentationJsonToMarkdown = (data: any): string => {
    if (!data || !Array.isArray(data.slides)) return content;
    const slidesMd: string[] = data.slides.map((s: any, idx: number) => {
      const num = s?.slideNumber || idx + 1;
      const title = (s?.slideTitle || `Slide ${num}`).toString();
      const templateId = (s?.templateId || "content-slide").toString();
      const props = s?.props || {};

      const lines: string[] = [];
      // Title line with layout hint
      lines.push(`**Slide ${num}: ${title}** \`${templateId}\``);

      // Preview key points (for preview UI only)
      if (Array.isArray(s?.previewKeyPoints) && s.previewKeyPoints.length) {
        lines.push(...s.previewKeyPoints.map((b: any) => `- ${String(b)}`));
      }

      // Minimal content reconstruction per common templates
      if (props.title && typeof props.title === "string") {
        lines.push(`## ${props.title}`);
      }

      if (Array.isArray(props.bullets) && props.bullets.length) {
        lines.push(...props.bullets.map((b: any) => `- ${String(b)}`));
      }

      if ((props.leftTitle || props.rightTitle) || (props.leftContent || props.rightContent)) {
        if (props.leftTitle) lines.push(`### ${props.leftTitle}`);
        if (props.leftContent) lines.push(String(props.leftContent));
        if (props.rightTitle) lines.push(`### ${props.rightTitle}`);
        if (props.rightContent) lines.push(String(props.rightContent));
      }

      // Big numbers or metrics-like content
      if (Array.isArray(props.boxes) && props.boxes.length) {
        // four-box-grid style
        props.boxes.forEach((box: any, i: number) => {
          if (box?.title) lines.push(`- ${i + 1}. ${box.title}`);
          if (box?.description) lines.push(`${box.description}`);
        });
      }

      if (Array.isArray(props.steps) && props.steps.length) {
        props.steps.forEach((step: any, i: number) => {
          const t = step?.title || step?.label || `Step ${i + 1}`;
          const d = step?.description || step?.text || "";
          lines.push(`${i + 1}. ${t}${d ? ": " + d : ""}`);
        });
      }

      if (props.subtitle && typeof props.subtitle === "string") {
        lines.push(String(props.subtitle));
      }

      // Image placeholder hint if present
      if (props.imagePrompt) {
        lines.push(`[IMAGE_PLACEHOLDER: MEDIUM | CENTER | ${String(props.imagePrompt).slice(0, 140)}]`);
      }

      return lines.join("\n\n");
    });

    return slidesMd.join("\n\n---\n\n");
  };

  // If stream completed and preview is JSON, convert it to markdown once
  useEffect(() => {
    if (!streamDone) return;
    if (jsonConvertedRef.current) return;
    
    // Check if content looks like JSON (starts with {)
    const looksLikeJson = content.trim().startsWith("{");
    
    // CRITICAL: Store original JSON response even if parsing fails (for recovery in backend)
    // This ensures we can send the raw JSON to backend even if it's truncated
    if (looksLikeJson && !originalJsonResponse) {
      console.log(`[ORIGINAL_JSON_STORE] Storing original JSON response (${content.length} chars) for finalization`);
      setOriginalJsonResponse(content);
    }
    
    const json = tryParsePresentationJson(content);
    if (json) {
      // 🔍 CRITICAL DEBUG: Log the raw AI response from API before conversion
      console.log("🔍 [AI_API_RESPONSE] Raw AI response received:");
      console.log("🔍 [AI_API_RESPONSE] Response length:", content.length, "characters");
      console.log("🔍 [AI_API_RESPONSE] Full JSON response:", content);
      
      // 🔍 CRITICAL DEBUG: Log parsed JSON structure
      try {
        const parsedJson = JSON.parse(content);
        console.log("🔍 [AI_API_RESPONSE] Parsed JSON structure:");
        console.log("🔍 [AI_API_RESPONSE] JSON keys:", Object.keys(parsedJson));
        console.log("🔍 [AI_API_RESPONSE] lessonTitle:", parsedJson.lessonTitle);
        console.log("🔍 [AI_API_RESPONSE] hasVoiceover:", parsedJson.hasVoiceover);
        console.log("🔍 [AI_API_RESPONSE] detectedLanguage:", parsedJson.detectedLanguage);
        console.log("🔍 [AI_API_RESPONSE] Number of slides:", parsedJson.slides?.length);
        
        // 🔍 CRITICAL DEBUG: Log each slide from AI response
        if (Array.isArray(parsedJson.slides)) {
          console.log("🔍 [AI_API_RESPONSE] === SLIDES FROM AI API ===");
          parsedJson.slides.forEach((slide: any, index: number) => {
            console.log(`🔍 [AI_API_RESPONSE] Slide ${index + 1}:`, {
              slideId: slide.slideId,
              slideNumber: slide.slideNumber,
              slideTitle: slide.slideTitle,
              templateId: slide.templateId,
              hasVoiceover: !!slide.voiceoverText,
              propsKeys: Object.keys(slide.props || {}),
            });
            
            // Log specific template props
            if (slide.templateId === 'course-overview-slide') {
              console.log(`🔍 [AI_API_RESPONSE] Slide ${index + 1} [course-overview-slide] props:`, {
                title: slide.props?.title,
                subtitle: slide.props?.subtitle,
                imagePath: slide.props?.imagePath,
              });
            } else if (slide.templateId === 'impact-statements-slide') {
              console.log(`🔍 [AI_API_RESPONSE] Slide ${index + 1} [impact-statements-slide] statements:`, slide.props?.statements);
            } else if (slide.templateId === 'phishing-definition-slide') {
              console.log(`🔍 [AI_API_RESPONSE] Slide ${index + 1} [phishing-definition-slide] definitions:`, slide.props?.definitions);
            } else if (slide.templateId === 'soft-skills-assessment-slide') {
              console.log(`🔍 [AI_API_RESPONSE] Slide ${index + 1} [soft-skills-assessment-slide] tips:`, slide.props?.tips);
            } else if (slide.templateId === 'work-life-balance-slide') {
              console.log(`🔍 [AI_API_RESPONSE] Slide ${index + 1} [work-life-balance-slide] content:`, slide.props?.content?.substring(0, 100) + '...');
            }
            
            if (slide.voiceoverText) {
              console.log(`🔍 [AI_API_RESPONSE] Slide ${index + 1} voiceover:`, slide.voiceoverText.substring(0, 100) + '...');
            }
          });
          console.log("🔍 [AI_API_RESPONSE] === END SLIDES FROM AI API ===");
        }
      } catch (e) {
        console.error("🔍 [AI_API_RESPONSE] Failed to parse JSON:", e);
        console.warn("🔍 [AI_API_RESPONSE] JSON may be truncated, but originalJsonResponse is stored for backend recovery");
      }
      
      const md = convertPresentationJsonToMarkdown(json);
      if (md && md.trim()) {
        jsonConvertedRef.current = true;
        // Ensure originalJsonResponse is set (may have been set above if looksLikeJson)
        if (!originalJsonResponse) {
          setOriginalJsonResponse(content);
        }
        setContent(md);
        // Initialize editable state from full JSON
        try {
          const obj = JSON.parse(content);
          if (Array.isArray(obj?.slides)) {
            const titles: Record<number, string> = {};
            const bullets: Record<number, string[]> = {};
            obj.slides.forEach((s: any, i: number) => {
              const num = s?.slideNumber || i + 1;
              if (typeof s?.slideTitle === 'string') titles[num] = s.slideTitle;
              if (Array.isArray(s?.previewKeyPoints)) bullets[num] = [...s.previewKeyPoints];
            });
            setEditedTitles(titles);
            setEditedBullets(bullets);
          }
        } catch {}
      }
    } else if (looksLikeJson) {
      // JSON detected but parsing failed - might be truncated
      // originalJsonResponse is already set above, so backend can attempt recovery
      console.warn("[JSON_CONVERSION] JSON detected but parsing failed, storing raw content for backend recovery");
      
      // CRITICAL: Even if JSON parsing fails, try to extract preview bullets from partial JSON
      // This ensures bullets are visible even when JSON is truncated
      try {
        // Try to extract slides from partial JSON using the extraction function
        const partialSlides = extractSlidesFromPartialJson(content);
        if (Array.isArray(partialSlides) && partialSlides.length > 0) {
          const titles: Record<number, string> = {};
          const bullets: Record<number, string[]> = {};
          partialSlides.forEach((s: any, i: number) => {
            const num = s?.slideNumber || i + 1;
            if (typeof s?.slideTitle === 'string') titles[num] = s.slideTitle;
            if (Array.isArray(s?.previewKeyPoints)) bullets[num] = [...s.previewKeyPoints];
          });
          setEditedTitles(titles);
          setEditedBullets(bullets);
          console.log(`[JSON_CONVERSION] Extracted ${partialSlides.length} slides with preview bullets from partial JSON`);
        }
      } catch (e) {
        console.warn("[JSON_CONVERSION] Failed to extract preview bullets from partial JSON:", e);
      }
    }
  }, [streamDone, content, originalJsonResponse]);

  // Once streaming is done, strip the first line that contains metadata (project, product type, etc.)
  useEffect(() => {
    if (streamDone && !firstLineRemoved) {
      // Do not strip first line if this is JSON or was converted from JSON
      const looksLikeJson = (content || "").trim().startsWith("{");
      if (!looksLikeJson && !jsonConvertedRef.current) {
      const parts = content.split('\n');
      if (parts.length > 1) {
        let trimmed = parts.slice(1).join('\n');
        // Remove leading blank lines (one or more) at the very start
        trimmed = trimmed.replace(/^(\s*\n)+/, '');
        setContent(trimmed);
        }
      }
      setFirstLineRemoved(true);
    }
  }, [streamDone, firstLineRemoved, content]);

  // If the stream completed but no slides were parsed (preview empty), automatically restart generation
  useEffect(() => {
    if (!streamDone) return;

    // Don't trigger restart logic if we're already loading or generating
    if (loading || isGenerating) return;

    // Don't restart if there's already an error showing
    if (error) return;

    // Clean up content before parsing to handle malformed AI responses
    const cleanContent = (text: string): string => {
      return text;
    };

    // Replicate slide parsing logic used in the UI to count slides
    // Enhanced to handle large JSON, video lesson fields, and various formats
    const countParsedSlides = (text: string): number => {
      if (!text || !text.trim()) {
        console.log(`[SLIDE_COUNT] Empty or whitespace-only text`);
        return 0;
      }

      // Step 1: Try JSON parsing first (handles both regular and video lesson presentations)
      const json = tryParsePresentationJson(text);
      if (json && Array.isArray(json.slides)) {
        const slideCount = json.slides.length;
        const isVideoLesson = json.hasVoiceover === true || 
                             json.slides.some((s: any) => s.voiceoverText);
        
        console.log(`[SLIDE_COUNT] JSON detected: ${slideCount} slides, ` +
                    `isVideoLesson: ${isVideoLesson}, contentLength: ${text.length}`);
        
        // Additional validation for video lessons with many slides
        if (isVideoLesson && slideCount > 15) {
          const slidesWithVoiceover = json.slides.filter((s: any) => 
            s.voiceoverText && s.voiceoverText.trim().length > 0
          ).length;
          console.log(`[SLIDE_COUNT] Video lesson validation: ${slidesWithVoiceover}/${slideCount} slides have voiceover`);
          
          // Warn if many slides are missing voiceover (but don't fail - might be partial stream)
          if (slidesWithVoiceover < slideCount * 0.5 && slideCount > 10) {
            console.warn(`[SLIDE_COUNT] Warning: Only ${slidesWithVoiceover}/${slideCount} slides have voiceover text`);
          }
        }
        
        return slideCount;
      }

      // Step 2: Try partial JSON extraction (works during streaming)
      try {
        const partialSlides = extractSlidesFromPartialJson(text);
        if (partialSlides.length > 0) {
          return partialSlides.length;
        }
      } catch {
        // Fall through to markdown parsing
      }

      // Step 3: Check if JSON was already converted to markdown (check jsonConvertedRef)
      if (jsonConvertedRef.current) {
        console.log(`[SLIDE_COUNT] JSON was already converted to markdown, parsing markdown format`);
      }

      // Step 4: Fallback to markdown parsing
      const cleanedText = cleanContent(text);
      if (!cleanedText || !cleanedText.trim()) {
        console.log(`[SLIDE_COUNT] Cleaned text is empty`);
        return 0;
      }

      let slides: string[] = [];
      if (cleanedText.includes('---')) {
        slides = cleanedText.split(/^---\s*$/m).filter((s) => s.trim());
      } else {
        slides = cleanedText.split(/(?=\*\*[^*]+\s+\d+\s*:)/).filter((s) => s.trim());
      }
      slides = slides.filter((slideContent) => /\*\*[^*]+\s+\d+\s*:/.test(slideContent));
      
      const markdownCount = slides.length;
      if (markdownCount > 0) {
        console.log(`[SLIDE_COUNT] Markdown format detected: ${markdownCount} slides`);
      } else {
        console.warn(`[SLIDE_COUNT] No slides found in markdown format. Content preview: ${text.substring(0, 200)}...`);
      }
      
      return markdownCount;
    };

    const slideCount = countParsedSlides(content);
    
    // Check if we have JSON content that hasn't been converted yet
    const hasJsonButNotConverted = !jsonConvertedRef.current && 
                                   content.trim().length > 0 && 
                                   (content.trim().startsWith('{') || content.includes('"slides"'));
    
    console.log(`[RESTART_CHECK] Stream done. Content length: ${content.length}, Slides found: ${slideCount}, ` +
                `Retry counter: ${formatRetryCounter}, JSON converted: ${jsonConvertedRef.current}, ` +
                `Has JSON but not converted: ${hasJsonButNotConverted}`);

    // Update debug info
    setDebugInfo({
      attempts: formatRetryCounter,
      lastAttemptTime: new Date().toLocaleTimeString(),
      contentLength: content.length,
      slidesFound: slideCount
    });

    // Don't trigger regeneration if we're handling insufficient credits
    if (isHandlingInsufficientCredits) {
      console.log(`[RESTART_SKIP] Skipping regeneration due to insufficient credits handling`);
      return;
    }

    // Don't restart if we have successfully parsed JSON (originalJsonResponse exists)
    // This means JSON was valid even if slide count is 0 (might be converting to markdown)
    if (originalJsonResponse && slideCount === 0) {
      console.log(`[RESTART_SKIP] JSON was successfully parsed (originalJsonResponse exists), ` +
                  `but slide count is 0. This may be a conversion issue, not a parsing issue.`);
      // Try to parse the original JSON to get actual slide count
      try {
        const parsed = JSON.parse(originalJsonResponse);
        if (parsed.slides && Array.isArray(parsed.slides)) {
          console.log(`[RESTART_SKIP] Original JSON has ${parsed.slides.length} slides. ` +
                      `Markdown conversion may have failed, but JSON is valid.`);
          return; // Don't restart - JSON is valid
        }
      } catch (e) {
        console.warn(`[RESTART_SKIP] Failed to re-parse originalJsonResponse:`, e);
      }
    }

    // Don't restart if we have JSON content that hasn't been converted yet
    // The JSON conversion useEffect should run and convert it to markdown
    if (hasJsonButNotConverted && slideCount === 0) {
      console.log(`[RESTART_SKIP] JSON content detected (${content.length} chars) but not yet converted. ` +
                  `This may be a timing issue - JSON conversion useEffect should handle this.`);
      console.log(`[RESTART_SKIP] Content preview: ${content.substring(0, 300)}...`);
      
      // If we have substantial JSON content, don't restart immediately
      // The JSON conversion useEffect will process it on next render
      if (content.length > 5000) {
        console.log(`[RESTART_SKIP] Large JSON content detected, skipping restart to allow conversion to complete`);
        return;
      }
    }

    if (slideCount === 0) {
      if (formatRetryCounter < 2) {
        console.log(`[RESTART_TRIGGER] Triggering restart attempt ${formatRetryCounter + 1}/2`);
        setError(null);
        setContent(""); // Clear malformed content
        setLoading(true); // Show loading state during retry
        setFormatRetryCounter((c) => c + 1);
      } else {
        console.log(`[RESTART_EXHAUSTED] All restart attempts exhausted. Setting error.`);
        setError("The preview appears to be empty or malformed. This can happen when the AI generates content in an unexpected format. Please try adjusting your prompt or try again.");
      }
    } else {
      console.log(`[RESTART_SUCCESS] Preview generated successfully with ${slideCount} slides`);
      // Reset retry counter on successful generation
      if (formatRetryCounter > 0) {
        setFormatRetryCounter(0);
      }
      // Ensure loading is false when slides are successfully generated
      setLoading(false);
    }
  }, [streamDone, content, formatRetryCounter, loading, isGenerating, error, isHandlingInsufficientCredits, originalJsonResponse]);

  // Handler to finalize the lesson and save it
  const handleGenerateFinal = async () => {
    if (isGenerating) return;
    if (previewAbortRef.current) {
      previewAbortRef.current.abort();
    }

    // Lightweight credits pre-check to avoid starting finalization when balance is 0
    try {
      const creditsRes = await fetch(`${CUSTOM_BACKEND_URL}/credits/me`, { cache: 'no-store', credentials: 'same-origin' });
      if (creditsRes.ok) {
        const credits = await creditsRes.json();
        if (!credits || typeof credits.credits_balance !== 'number' || credits.credits_balance <= 0) {
          setShowInsufficientCreditsModal(true);
          setIsGenerating(false);
          setIsHandlingInsufficientCredits(true);
          return;
        }
      }
    } catch (_) {
      // On pre-check failure, proceed to server-side validation (will still 402 if insufficient)
    }

    setIsGenerating(true);
    setLoading(false);
    setError(null);

    // Create AbortController for this request
    const abortController = new AbortController();
    let caughtError: any = null;

    // Add timeout safeguard to prevent infinite loading
    const timeoutId = setTimeout(() => {
      abortController.abort();
      setIsGenerating(false);
      setError("Finalization timed out. Please try again.");
    }, 300000); // 5 minutes timeout

    const activeProductType = sessionStorage.getItem('activeProductType');

    try {
      // Re-use the same fallback title logic we applied in preview
      const promptQuery = currentPrompt?.trim() || "";
      const derivedTitle = selectedLesson || (promptQuery ? promptQuery.slice(0, 80) : "Untitled Lesson");

      // Log what we're sending for debugging
      const responseToSend = originalJsonResponse || content;
      const isUsingJson = !!originalJsonResponse;
      console.log(`[FINALIZE] Sending ${isUsingJson ? 'original JSON' : 'markdown'} response (${responseToSend.length} chars)`);

      // Build edits payload if any
      let edits: Array<{ slideNumber: number; newTitle?: string; previewKeyPoints?: string[] }> = [];
      try {
        if (originalJsonResponse) {
          const obj = JSON.parse(originalJsonResponse);
          if (Array.isArray(obj?.slides)) {
            obj.slides.forEach((s: any, i: number) => {
              const num = s?.slideNumber || i + 1;
              const origTitle = typeof s?.slideTitle === 'string' ? s.slideTitle : '';
              const origBullets: string[] = Array.isArray(s?.previewKeyPoints) ? s.previewKeyPoints : [];
              const newTitle = editedTitles[num];
              const newBullets = editedBullets[num];
              const titleChanged = typeof newTitle === 'string' && newTitle !== '' && newTitle !== origTitle;
              const bulletsChanged = Array.isArray(newBullets) && JSON.stringify(newBullets) !== JSON.stringify(origBullets);
              if (titleChanged || bulletsChanged) {
                edits.push({ slideNumber: num, ...(titleChanged ? { newTitle } : {}), ...(bulletsChanged ? { previewKeyPoints: newBullets } : {}) });
              }
            });
          }
        }
      } catch {}

      const res = await fetch(`${CUSTOM_BACKEND_URL}/lesson-presentation/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlineProjectId: selectedOutlineId || undefined,
          lessonTitle: derivedTitle,
          lengthRange: lengthRangeForOption(lengthOption),
          // Send original JSON if available, otherwise send markdown content
          aiResponse: originalJsonResponse || content,
          prompt: currentPrompt,
          chatSessionId: chatId || undefined,
          slidesCount: slidesCount,
          productType: productType, // Pass product type for video lesson vs regular presentation
          folderId: folderContext?.folderId || undefined,
          // Include selected theme
          theme: selectedTheme,
          // Edits tracking
          hasUserEdits: edits.length > 0,
          originalContent: originalJsonResponse || null,
          editedSlides: edits,
          // Send original JSON response for fast-path parsing (prevents AI parser usage)
          originalJsonResponse: originalJsonResponse || undefined,
          // Add connector context if creating from connectors
          ...(isFromConnectors && {
            fromConnectors: true,
            connectorIds: connectorIds.join(','),
            connectorSources: connectorSources.join(','),
            ...(selectedFiles.length > 0 && {
              selectedFiles: selectedFiles.join(','),
            }),
          }),
          // Add temp file context if creating from one-time uploads
          ...(isFromTempFiles && tempFileContextId && {
            fromTempFiles: true,
            tempFileContextId: tempFileContextId,
          }),
        }),
        signal: abortController.signal
      });

      // Clear timeout since request completed
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        // Check for insufficient credits (402)
        if (res.status === 402) {
          setIsGenerating(false); // Stop the finalization animation
          setIsHandlingInsufficientCredits(true); // Prevent regeneration
          setShowInsufficientCreditsModal(true);
          // Clear timeout since we're not proceeding
          clearTimeout(timeoutId);
          return;
        }
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      const data = await res.json();

      // Ensure we have a valid project ID before navigating
      if (!data?.id) {
        throw new Error("Invalid response: missing project ID");
      }

      await trackCreateProduct(
        "Completed",
        sessionStorage.getItem('lessonContext') != null ? true : useExistingOutline === true ? true : false,
        isFromFiles,
        isFromText,
        isFromKnowledgeBase,
        isFromConnectors,
        language, 
        activeProductType ?? undefined,
        undefined,
        advancedModeState
      );
      
      // Clear the failed state since we successfully completed
      try {
        if (sessionStorage.getItem('createProductFailed')) {
          sessionStorage.removeItem('createProductFailed');
        }
      } catch (error) {
        console.error('Error clearing failed state:', error);
      }
      
      // Clean up temporary file context after successful creation
      if (isFromTempFiles && tempFileContextId) {
        try {
          await fetch(`/api/custom-projects-backend/files/temp-context/${tempFileContextId}`, {
            method: 'DELETE',
          });
          console.log(`[TEMP_FILE_CLEANUP] Deleted temporary context ${tempFileContextId}`);
          
          // Also clean up session storage
          sessionStorage.removeItem('tempFileContextId');
          sessionStorage.removeItem('tempFileContextSummary');
        } catch (cleanupError) {
          // Non-critical error, just log it
          console.error('[TEMP_FILE_CLEANUP] Failed to delete temporary context:', cleanupError);
        }
      }

      // Navigate immediately without delay to prevent cancellation
      // Use new interface for Video Lessons, old interface for regular presentations
      const isVideoLesson = productType === "video_lesson_presentation";
      const redirectPath = isVideoLesson ? `/projects-2-new/view/${data.id}?from=create` : `/projects/view/${data.id}?from=create`;
      if (typeof window !== 'undefined') {
        try { sessionStorage.setItem('last_created_product_id', String(data.id)); } catch (_) {}
      }
      router.push(redirectPath);

    } catch (error: any) {
      try {
        // Mark that a "Failed" event has been tracked to prevent subsequent "Clicked" events
        if (!sessionStorage.getItem('createProductFailed')) {
          await trackCreateProduct(
            "Failed",
            sessionStorage.getItem('lessonContext') != null ? true : useExistingOutline === true ? true : false,
            isFromFiles,
            isFromText,
            isFromKnowledgeBase,
            isFromConnectors,
            language, 
            activeProductType ?? undefined,
            undefined, 
            advancedModeState
          );
          sessionStorage.setItem('createProductFailed', 'true');
        }
      } catch (error) {
        console.error('Error setting failed state:', error);
      }
      
      caughtError = error;
      // Clear timeout on error
      clearTimeout(timeoutId);

      // Handle specific error types
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        setError("Request was canceled. Please try again.");
      } else if (error.message?.includes('504') || error.message?.includes('Gateway Time-out')) {
        // Handle 504 Gateway Timeout specifically
        console.log('504 Gateway Timeout detected, implementing fallback strategy...');

        // Keep loading animation and wait 10 seconds before checking for new projects
        setTimeout(async () => {
          try {
            // Fetch user's projects to check if a new slide deck was created
            const projectsResponse = await fetch(`${CUSTOM_BACKEND_URL}/projects`, {
              headers: { 'Content-Type': 'application/json' },
              cache: 'no-store',
              credentials: 'same-origin'
            });

            if (projectsResponse.ok) {
              const projects = await projectsResponse.json();

              // Check if the newest project is a slide deck (within last 2 minutes)
              const now = new Date();
              const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

              const newestProject = projects.find((project: any) => {
                const createdAt = new Date(project.created_at);
                const isRecentlyCreated = createdAt >= twoMinutesAgo;
                const isSlideType = project.design_microproduct_type === 'Slide Deck' ||
                  project.design_microproduct_type === 'VideoLessonPresentationDisplay';
                return isRecentlyCreated && isSlideType;
              });

              if (newestProject) {
                // Found a newly created slide deck, redirect to it
                console.log('Found newly created slide deck, redirecting...', newestProject.id);
                // Use new interface for Video Lessons, old interface for regular presentations
                const isVideoLesson = newestProject.design_microproduct_type === 'VideoLessonPresentationDisplay';
                const redirectPath = isVideoLesson ? `/projects-2-new/view/${newestProject.id}?from=create` : `/projects/view/${newestProject.id}?from=create`;
                if (typeof window !== 'undefined') {
                  try { sessionStorage.setItem('last_created_product_id', String(newestProject.id)); } catch (_) {}
                }
                router.push(redirectPath);
              } else {
                // No new slide deck found, redirect to products page
                console.log('No new slide deck found, redirecting to products page');
                router.push('/projects');
              }
            } else {
              // Failed to fetch projects, redirect to products page
              router.push('/projects');
            }
          } catch (checkError) {
            // Error checking for new projects, redirect to products page
            console.error('Error checking for new projects:', checkError);
            router.push('/projects');
          } finally {
            setIsGenerating(false);
          }
        }, 20000); // Wait 10 seconds

        // Don't show error immediately for 504 timeouts
        return;
      } else if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        setError("Network error occurred. Please check your connection and try again.");
      } else {
        console.error('Finalization failed:', error);
        setError(error instanceof Error ? error.message : 'Failed to finalize lesson presentation');
      }
    } finally {
      // Only set isGenerating to false if we're not handling a 504 timeout
      if (!caughtError?.message?.includes('504') && !caughtError?.message?.includes('Gateway Time-out')) {
        setIsGenerating(false);
      }
    }
  };

  // ===== Apply incremental edit to lesson =====
  const handleApplyLessonEdit = async () => {
    const trimmed = editPrompt.trim();
    if (!trimmed || loadingEdit) return;

    // Combine existing prompt (if any) with new instruction
    const basePrompt = currentPrompt || "";
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
    jsonConvertedRef.current = false; // Reset JSON conversion tracking for new edit
    setOriginalJsonResponse(null); // Clear previous JSON
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
              } else if (pkt.type === "done") {
                // Set final content from done packet if available
                if (pkt.content && typeof pkt.content === "string") {
                  setContent(pkt.content);
                } else if (accumulatedText) {
                  setContent(accumulatedText);
                }
              }
            } catch (e) {
              // If not JSON, treat as plain text
              accumulatedText += buffer;
              setContent(accumulatedText);
            }
          }
          // Ensure content is set even if buffer was empty
          if (accumulatedText && !buffer.trim()) {
            setContent(accumulatedText);
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
              // Set final content from done packet if available, otherwise use accumulated
              if (pkt.content && typeof pkt.content === "string") {
                setContent(pkt.content);
              } else if (accumulatedText) {
                setContent(accumulatedText);
              }
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

  // Check ChudoMarket themes feature flag
  const { isEnabled: hasChudoMarketThemes } = useFeaturePermission('chudo_market_themes');
  
  // Use filtered theme options based on feature flags
  const themeOptions = getFilteredThemeOptions(hasChudoMarketThemes);

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

  // Extract slide objects from partial JSON streaming buffer
  const extractSlidesFromPartialJson = (text: string): any[] => {
    try {
      const s = (text || "");
      const slidesKeyIdx = s.indexOf('"slides"');
      if (slidesKeyIdx < 0) return [];
      const arrayStart = s.indexOf('[', slidesKeyIdx);
      if (arrayStart < 0) return [];

      const slides: any[] = [];
      let i = arrayStart + 1;
      const n = s.length;
      while (i < n) {
        while (i < n && (s[i] === ' ' || s[i] === '\n' || s[i] === '\r' || s[i] === '\t' || s[i] === ',')) i++;
        if (i >= n) break;
        if (s[i] === ']') break;
        if (s[i] !== '{') {
          const nextObj = s.indexOf('{', i);
          if (nextObj < 0) break;
          i = nextObj;
        }
        let depth = 0;
        let start = i;
        let end = -1;
        while (i < n) {
          const ch = s[i];
          if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) { end = i + 1; break; }
          }
          i++;
        }
        if (end > 0) {
          const objStr = s.slice(start, end);
          try {
            const slideObj = JSON.parse(objStr);
            slides.push(slideObj);
          } catch { /* ignore */ }
        } else {
          break;
        }
      }
      return slides;
    } catch { return []; }
  };

  // Build a live preview markdown from partial JSON during streaming
  const getPreviewTextFromPartialJson = (text: string): string | null => {
    try {
      const slides = extractSlidesFromPartialJson(text);
      if (!slides.length) return null;
      const tmp = { slides };
      return convertPresentationJsonToMarkdown(tmp);
    } catch (_) {
      return null;
    }
  };

  // Decide what to render in the preview during streaming
  const getLivePreviewText = (text: string): string => {
    if (jsonConvertedRef.current) return text;
    const md = getPreviewTextFromPartialJson(text);
    if (md && md.trim()) return md;
    return text;
  };

  return (
    <>
      <main
      className="min-h-screen pt-16 pb-24 bg-white relative overflow-hidden"
    >
      {/* Decorative gradient backgrounds */}
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '980px',
          height: '1100px',
          top: '-500px',
          left: '-350px',
          borderRadius: '450px',
          background: 'linear-gradient(180deg, rgba(144, 237, 229, 0.24) 0%, rgba(56, 23, 255, 0.24) 100%)',
          transform: 'rotate(-300deg)',
          filter: 'blur(100px)',
        }}
      />
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '2260px',
          height: '2800px',
          top: '358px',
          left: '433px',
          borderRadius: '450px',
          background: 'linear-gradient(180deg, rgba(144, 237, 229, 0.24) 0%, rgba(216, 23, 255, 0.24) 80%)',
          transform: 'rotate(-110deg)',
          filter: 'blur(100px)',
        }}
      />

        {/* Back button */}
        <BackButton href="/create/generate" />

      {/* Main content wrapper with flex layout */}
      <div className="flex h-full relative">
        {/* Main content area - shrinks when panel is open */}
        <div 
          className="flex-1 px-4 flex flex-col items-center transition-all duration-300 ease-in-out relative z-10"
          style={{
            marginRight: showAiAgent ? '400px' : '0'
          }}
        >
        <div className="w-full max-w-4xl flex flex-col gap-6 text-gray-900">

          {/* Page title */}
          <h2 className="text-center text-2xl font-semibold text-[#4B4B51] mb-2">
            {productType === "video_lesson_presentation" ? t('interface.lessonPresentation.videoOutlinePreview', 'Video outline preview') : t('interface.lessonPresentation.presentationOutlinePreview', 'Presentation outline preview')}
          </h2>

          {/* Step-by-step process */}
          <div className="flex flex-col gap-4" style={{ display: 'none' }}>
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
              <div className="w-full">
                {/* Show outline flow if user chose existing outline */}
                {useExistingOutline === true && (
                  <>
                    {/* Course Structure dropdowns - Outline, Module, Lesson */}
                    {(selectedOutlineId || selectedModuleIndex !== null || selectedLesson) && (
                      <div className="w-full bg-white rounded-lg py-3 px-8 shadow-sm hover:shadow-lg transition-shadow duration-200 mb-4">
                        <div className="flex items-center">
                    {/* Outline dropdown */}
                          <div className="flex-1 flex items-center justify-center">
                            <Select
                              value={selectedOutlineId?.toString() ?? ""}
                              onValueChange={(value: string) => {
                                const val = value ? Number(value) : null;
                                setSelectedOutlineId(val);
                          // clear module & lesson selections when outline changes
                          setSelectedModuleIndex(null);
                          setLessonsForModule([]);
                          setSelectedLesson("");
                        }}
                            >
                              <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                                <div className="flex items-center gap-2">
                                  <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 3H16C16.5523 3 17 3.44772 17 4V14C17 14.5523 16.5523 15 16 15H3C2.44772 15 2 14.5523 2 14V4C2 3.44772 2.44772 3 3 3Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 7H12" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 10H12" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span className="text-[#09090B] opacity-50">{t('interface.generate.outline', 'Outline')}:</span>
                                  <span className="text-[#09090B] truncate max-w-[100px]">{outlines.find(o => o.id === selectedOutlineId)?.name || ''}</span>
                                </div>
                              </SelectTrigger>
                              <SelectContent className="border-[#CCCCCC]" sideOffset={15}>
                        {outlines.map((o) => (
                                  <SelectItem key={o.id} value={o.id.toString()}>{o.name}</SelectItem>
                        ))}
                              </SelectContent>
                            </Select>
                    </div>

                          {/* Divider */}
                          <div className="w-px h-6 bg-[#E0E0E0] mx-4"></div>

                          {/* Module dropdown */}
                          <div className="flex-1 flex items-center justify-center">
                            <Select
                              value={selectedModuleIndex?.toString() ?? ""}
                              onValueChange={(value: string) => {
                                const idx = value ? Number(value) : null;
                            setSelectedModuleIndex(idx);
                            setLessonsForModule(idx !== null ? modulesForOutline[idx].lessons : []);
                            setSelectedLesson("");
                          }}
                          disabled={modulesForOutline.length === 0}
                            >
                              <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                                <div className="flex items-center gap-2">
                                  <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 3H16C16.5523 3 17 3.44772 17 4V14C17 14.5523 16.5523 15 16 15H3C2.44772 15 2 14.5523 2 14V4C2 3.44772 2.44772 3 3 3Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 7H12" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 10H12" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span className="text-[#09090B] opacity-50">{t('interface.generate.module', 'Module')}:</span>
                                  <span className="text-[#09090B] truncate max-w-[100px]">{selectedModuleIndex !== null ? modulesForOutline[selectedModuleIndex]?.name || '' : ''}</span>
                                </div>
                              </SelectTrigger>
                              <SelectContent className="border-[#CCCCCC]" sideOffset={15}>
                          {modulesForOutline.map((m, idx) => (
                                  <SelectItem key={idx} value={idx.toString()}>{m.name}</SelectItem>
                          ))}
                              </SelectContent>
                            </Select>
                      </div>

                          {/* Divider */}
                          <div className="w-px h-6 bg-[#E0E0E0] mx-4"></div>

                          {/* Lesson dropdown */}
                          <div className="flex-1 flex items-center justify-center">
                            <Select
                          value={selectedLesson}
                              onValueChange={setSelectedLesson}
                            >
                              <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                                <div className="flex items-center gap-2">
                                  <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 3H16C16.5523 3 17 3.44772 17 4V14C17 14.5523 16.5523 15 16 15H3C2.44772 15 2 14.5523 2 14V4C2 3.44772 2.44772 3 3 3Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 7H12" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 10H12" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span className="text-[#09090B] opacity-50">{t('interface.generate.lesson', 'Lesson')}:</span>
                                  <span className="text-[#09090B] truncate max-w-[100px]">{selectedLesson}</span>
                                </div>
                              </SelectTrigger>
                              <SelectContent className="border-[#CCCCCC]" sideOffset={15}>
                          {lessonsForModule.map((l) => (
                                  <SelectItem key={l} value={l}>{l}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Initial Outline dropdown - shows when no outline is selected yet */}
                    {!selectedOutlineId && (
                      <Select
                        value={selectedOutlineId?.toString() ?? ""}
                        onValueChange={(value: string) => {
                          const val = value ? Number(value) : null;
                          setSelectedOutlineId(val);
                          // clear module & lesson selections when outline changes
                          setSelectedModuleIndex(null);
                          setLessonsForModule([]);
                          setSelectedLesson("");
                        }}
                      >
                        <SelectTrigger className="px-4 py-2 rounded-full border border-[#CCCCCC] bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9">
                          <SelectValue placeholder={t('interface.generate.selectOutline', 'Select Outline')} />
                        </SelectTrigger>
                        <SelectContent className="border-[#CCCCCC]">
                          {outlines.map((o) => (
                            <SelectItem key={o.id} value={o.id.toString()}>{o.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Show final dropdowns when lesson is selected */}
                    {selectedLesson && (
                      <div className="flex flex-wrap justify-center gap-4">
                        <CustomPillSelector
                          value={language === 'en' ? t('interface.english', 'English') : language === 'uk' ? t('interface.ukrainian', 'Ukrainian') : language === 'es' ? t('interface.spanish', 'Spanish') : t('interface.russian', 'Russian')}
                          onValueChange={(value) => {
                            if (value === t('interface.english', 'English')) setLanguage('en');
                            else if (value === t('interface.ukrainian', 'Ukrainian')) setLanguage('uk');
                            else if (value === t('interface.spanish', 'Spanish')) setLanguage('es');
                            else if (value === t('interface.russian', 'Russian')) setLanguage('ru');
                          }}
                          options={[
                            { value: t('interface.english', 'English'), label: t('interface.english', 'English') },
                            { value: t('interface.ukrainian', 'Ukrainian'), label: t('interface.ukrainian', 'Ukrainian') },
                            { value: t('interface.spanish', 'Spanish'), label: t('interface.spanish', 'Spanish') },
                            { value: t('interface.russian', 'Russian'), label: t('interface.russian', 'Russian') }
                          ]}
                          label={t('interface.language', 'Language')}
                        />
                        <CustomPillSelector
                          value={`${slidesCount} ${t('interface.generate.slides', 'slides')}`}
                          onValueChange={(value) => {
                            const slidesText = t('interface.generate.slides', 'slides');
                            const num = Number(value.replace(` ${slidesText}`, '').trim());
                            handleSlidesCountChange(num.toString());
                          }}
                          options={Array.from({ length: 14 }, (_, i) => ({
                            value: `${i + 2} ${t('interface.generate.slides', 'slides')}`,
                            label: `${i + 2} ${t('interface.generate.slides', 'slides')}`
                          }))}
                          label={t('interface.generate.slides', 'Slides')}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Show standalone lesson dropdowns if user chose standalone */}
                {useExistingOutline === false && (
                  <div className="flex flex-wrap justify-center gap-4">
                    <CustomPillSelector
                      value={language === 'en' ? t('interface.english', 'English') : language === 'uk' ? t('interface.ukrainian', 'Ukrainian') : language === 'es' ? t('interface.spanish', 'Spanish') : t('interface.russian', 'Russian')}
                      onValueChange={(value) => {
                        if (value === t('interface.english', 'English')) setLanguage('en');
                        else if (value === t('interface.ukrainian', 'Ukrainian')) setLanguage('uk');
                        else if (value === t('interface.spanish', 'Spanish')) setLanguage('es');
                        else if (value === t('interface.russian', 'Russian')) setLanguage('ru');
                      }}
                      options={[
                        { value: t('interface.english', 'English'), label: t('interface.english', 'English') },
                        { value: t('interface.ukrainian', 'Ukrainian'), label: t('interface.ukrainian', 'Ukrainian') },
                        { value: t('interface.spanish', 'Spanish'), label: t('interface.spanish', 'Spanish') },
                        { value: t('interface.russian', 'Russian'), label: t('interface.russian', 'Russian') }
                      ]}
                      label={t('interface.language', 'Language')}
                    />
                    <CustomPillSelector
                      value={`${slidesCount} ${t('interface.generate.slides', 'slides')}`}
                      onValueChange={(value) => {
                        const slidesText = t('interface.generate.slides', 'slides');
                        const num = Number(value.replace(` ${slidesText}`, '').trim());
                        setSlidesCount(num);
                      }}
                      options={Array.from({ length: 14 }, (_, i) => ({
                        value: `${i + 2} ${t('interface.generate.slides', 'slides')}`,
                        label: `${i + 2} ${t('interface.generate.slides', 'slides')}`
                      }))}
                      label={t('interface.generate.slides', 'Slides')}
                    />
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Prompt input for standalone lessons */}
          {useExistingOutline === false && (
            <div className="relative group" style={{ display: 'none' }}>
              <Textarea
              value={currentPrompt || ""}
              onChange={(e) => {
                const newPrompt = e.target.value;
                setCurrentPrompt(newPrompt);
                
                // Handle prompt storage for long prompts
                const sp = new URLSearchParams(params?.toString() || "");
                if (newPrompt.length > 500) {
                  const promptId = generatePromptId();
                  sessionStorage.setItem(promptId, newPrompt);
                  sp.set("prompt", promptId);
                } else {
                  sp.set("prompt", newPrompt);
                }
                router.replace(`?${sp.toString()}`, { scroll: false });
              }}
              placeholder={t('interface.generate.promptPlaceholder', 'Describe what you\'d like to make')}
              rows={1}
                className="w-full px-7 py-5 rounded-lg bg-white text-lg text-black resize-none overflow-hidden min-h-[56px] border border-[#E0E0E0] focus:border-blue-300 focus:outline-none transition-all duration-200 placeholder-gray-400 shadow-lg cursor-pointer"
                style={{ background: "rgba(255,255,255,0.95)" }}
            />
            </div>
          )}

          <section className="flex flex-col gap-3">
            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center gap-4 py-8">
                <LoadingAnimation message={progressMessage || thoughts[thoughtIdx]} showFallback={false} />
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-2 text-red-800 font-semibold mb-3">
                  <XCircle className="h-5 w-5" />
                  {t('interface.error', 'Error')}
                </div>
                <div className="text-sm text-red-700 mb-4">
                  <p>{error}</p>
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    setRetryCount(0);
                    setRetryTrigger(prev => prev + 1);
                  }}
                  className="px-4 py-2 rounded-full border border-red-300 bg-white text-red-700 hover:bg-red-50 text-sm font-medium transition-colors"
                >
                  {t('interface.generate.retryGeneration', 'Retry Generation')}
                </button>
              </div>
            )}

            {/* Main content display - Custom slide titles display matching course outline format */}
            {textareaVisible && (
              <div
                className="border border-[#CCCCCC] rounded-lg flex flex-col relative"
                style={{ 
                  animation: 'fadeInDown 0.25s ease-out both',
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
                }}
              >
                {/* Header with lesson title */}
                <div 
                  className="px-10 py-4 rounded-t-[8px] text-white text-lg font-medium"
                  style={{ backgroundColor: '#0F58F999' }}
                >
                  {productType === "video_lesson_presentation" 
                    ? t('interface.generate.videoLessonPresentation', 'Video Lesson Presentation')
                    : t('interface.generate.presentation', 'Presentation')
                  }
                </div>
                
                {/* Slides container */}
                <div className="px-10 py-5 flex flex-col gap-[15px] shadow-lg">
                {loadingEdit && (
                  <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
                    <LoadingAnimation message={t('interface.generate.applyingEdit', 'Applying edit...')} />
                  </div>
                )}

                {/* Parse and display slide titles in course outline format */}
                {(() => {
                  // Helper function to clean content (same as in restart logic)
                  const cleanContent = (text: string): string => {
                    return text;
                  };

                  // Clean the content first to handle malformed AI responses
                  const cleanedContent = cleanContent(getLivePreviewText(content));

                  // Split slides properly - first try by --- separators, then by language-agnostic patterns
                  let slides = [];
                  if (cleanedContent.includes('---')) {
                    // Split by --- separators
                    slides = cleanedContent.split(/^---\s*$/m).filter(slide => slide.trim());
                  } else {
                    // Split by language-agnostic pattern: **[anything] [number]: [title]
                    slides = cleanedContent.split(/(?=\*\*[^*]+\s+\d+\s*:)/).filter(slide => slide.trim());
                  }

                  // Filter out slides that don't have proper numbered slide pattern (language-agnostic)
                  slides = slides.filter(slideContent => /\*\*[^*]+\s+\d+\s*:/.test(slideContent));

                  // Fallback: if no slides detected, try alternative extraction strategies
                  if (slides.length === 0) {
                    const lines = cleanedContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                    // Prefer markdown headings first
                    let altTitles = lines
                      .filter(l => /^#{1,3}\s+/.test(l))
                      .map(l => l.replace(/^#{1,3}\s+/, ''));

                    // If still empty, use numbered/bulleted items as slide titles
                    if (altTitles.length === 0) {
                      altTitles = lines
                        .filter(l => /^(?:\d+\.\s+|[-*]\s+)/.test(l))
                        .map(l => l.replace(/^(?:\d+\.\s+|[-*]\s+)/, ''));
                    }

                    // If still empty, derive from paragraphs (first sentence of each block)
                    if (altTitles.length === 0) {
                      const paragraphs = cleanedContent.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
                      altTitles = paragraphs.map(p => {
                        const m = p.match(/^([^\.!?`\n]{4,120}?)[\.!?](\s|$)/);
                        return (m && m[1]) ? m[1] : p.slice(0, 80);
                      });
                    }

                    // Limit to a reasonable number of slides for preview
                    altTitles = altTitles.slice(0, 20);
                    if (altTitles.length > 0) {
                      slides = altTitles.map((title, i) => `**Slide ${i + 1}: ${title}**`);
                    }
                  }

                  return slides.map((slideContent, slideIdx) => {
                    // Extract slide title using language-agnostic pattern: **[word(s)] [number]: [title]
                    const titleMatch = slideContent.match(/\*\*[^*]+\s+\d+\s*:\s*([^*`\n]+)/);
                    let title = '';

                    if (titleMatch) {
                      title = titleMatch[1]; // do not trim to allow trailing spaces
                    } else {
                      // Fallback: look for any **text** pattern at the start
                      const fallbackMatch = slideContent.match(/\*\*([^*]+)\*\*/);
                      title = fallbackMatch ? fallbackMatch[1] : `Slide ${slideIdx + 1}`;
                    }

                    return (
                      <div key={slideIdx} className="bg-white rounded-md overflow-hidden border border-[#CCCCCC] hover:shadow-sm transition-shadow duration-200">
                        {/* Header with number and title */}
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-[#CCCCCC]">
                          <span className="font-semibold text-lg text-[#0D001B] select-none flex-shrink-0">
                            {slideIdx + 1}.
                          </span>
                          <input
                            type="text"
                            value={editedTitles[slideIdx + 1] ?? title}
                            onChange={(e) => {
                              const newTitle = e.target.value;
                              setTitleForSlide(slideIdx, newTitle);
                            }}
                            disabled={!streamDone}
                            className="flex-1 font-semibold text-lg border-none focus:ring-0 text-[#0D001B] px-0 py-0"
                            placeholder={`${t('interface.generate.slideTitle', 'Slide')} ${slideIdx + 1} ${t('interface.generate.title', 'title')}`}
                          />
                        </div>

                        {/* Bullet points section */}
                        {(() => {
                          try {
                            // Prefer full original JSON (post-stream). Otherwise, use partial slides during stream
                            let bullets: string[] = [];
                            if (originalJsonResponse) {
                              const obj = JSON.parse(originalJsonResponse);
                              const slideObj = Array.isArray(obj?.slides)
                                ? obj.slides.find((s: any, i: number) => (s?.slideNumber || i + 1) === (slideIdx + 1))
                                : null;
                              bullets = Array.isArray(slideObj?.previewKeyPoints) ? slideObj.previewKeyPoints : [];
                            }
                            if (!bullets.length) {
                              const partialSlides = extractSlidesFromPartialJson(content);
                              const slideObj = Array.isArray(partialSlides)
                                ? partialSlides.find((s: any, i: number) => (s?.slideNumber || i + 1) === (slideIdx + 1))
                                : null;
                              bullets = Array.isArray(slideObj?.previewKeyPoints) ? slideObj.previewKeyPoints : [];
                            }
                            // Use edited bullets if present
                            const edited = editedBullets[slideIdx + 1];
                            if (Array.isArray(edited) && edited.length) bullets = edited;
                            if (!bullets.length) return null;
                            return (
                              <div className="px-5 py-4 flex flex-col gap-2" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
                                {bullets.slice(0, 5).map((b, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <span className="inline-block w-1 h-1 bg-[#6091F9] rounded-full mt-2 flex-shrink-0" />
                                    <input
                                      type="text"
                                      value={String(b)}
                                      onChange={(e) => setBulletForSlide(slideIdx, i, e.target.value)}
                                      disabled={!streamDone}
                                      className="text-sm text-[#171718] border-0 px-0 py-0 focus:outline-none focus:ring-0 flex-1"
                                      placeholder={t('interface.generate.topic', 'Topic') as string}
                                    />
                                  </div>
                                ))}
                                {/* Add bullet button removed from preview */}
                                {false && (
                                <button type="button" onClick={() => addBulletForSlide(slideIdx)} disabled={!streamDone} className="self-start text-xs text-[#396EDF] hover:opacity-80">
                                  + {t('interface.generate.addBullet', 'Add bullet')}
                                </button>
                                )}
                              </div>
                            );
                          } catch (_) { return null; }
                        })()}
                      </div>
                    );
                  });
                })()}
                {/* Status row - estimated time and character count */}
                {(() => {
                  // Count slides
                  const cleanedContent = content;
                  let slides = [];
                  if (cleanedContent.includes('---')) {
                    slides = cleanedContent.split(/^---\s*$/m).filter(slide => slide.trim());
                  } else {
                    slides = cleanedContent.split(/(?=\*\*[^*]+\s+\d+\s*:)/).filter(slide => slide.trim());
                  }
                  slides = slides.filter(slideContent => /\*\*[^*]+\s+\d+\s*:/.test(slideContent));
                  const slideCount = slides.length;
                  
                  // Calculate character count from content
                  const charCount = content.length;
                  
                  // Estimate presentation time (2.5 minutes per slide on average)
                  const totalMinutes = Math.round(slideCount * 2.5);
                  const minutes = Math.floor(totalMinutes);
                  const seconds = Math.round((totalMinutes - minutes) * 60);
                  
                  return (
                    <div className="flex items-center justify-between text-sm text-[#A5A5A5] mb-2">
                      <span className="select-none">
                        {minutes} m {seconds} s
                      </span>
                      <span className="flex items-center gap-1">
                        <RadialProgress progress={charCount / 50000} theme={selectedTheme} />
                        {charCount}/50000
                      </span>
                    </div>
                  );
                })()}
                </div>
              </div>
            )}
          </section>

          {streamDone && content && (
            <section className="flex flex-col gap-3">
              <div className="rounded-lg px-10 py-5 border border-[#CCCCCC] shadow-lg" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)' }}>

                {/* Avatars section for Video Lesson */}
                {productType === "video_lesson_presentation" && (
                  <div className="bg-white rounded-lg border border-[#E0E0E0] pb-6 flex flex-col gap-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
                    <div className="flex items-center py-2 border-b border-[#E0E0E0] px-6">
                      <div className="flex flex-col">
                        <h2 className="text-md font-medium text-[#171718]">{t('interface.generate.avatars', 'Avatars')}</h2>
                        <p className="text-[#A5A5A5] text-sm">{t('interface.generate.chooseVirtualTrainer', 'Choose the virtual trainer')}</p>
                      </div>
                    </div>
                    <div className="px-3 py-3 flex-1">
                      <div className="w-full h-full border border-[#E0E0E0] rounded-md relative pt-6 pb-12">
                        {/* Portal container for names */}
                        <div id="avatar-names-portal" className="absolute inset-0 pointer-events-none"></div>
                        
                        {/* Avatar Cards Carousel */}
                        <div 
                          ref={avatarCarouselRef}
                          className="flex gap-5 overflow-x-hidden transition-all duration-300 ease-in-out px-2"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          {/* Static card slots with changing content */}
                          {[0, 1, 2].map((slotIndex) => {
                            // Calculate which avatar to show in this slot
                            const avatarIndex = (scrollPosition + slotIndex + 6) % 6;
                            const avatarNumber = avatarIndex + 1;
                            const isCenterSlot = slotIndex === 1;
                            
                            return (
                              <div
                                key={slotIndex}
                                onClick={() => isCenterSlot && setSelectedAvatar(avatarNumber)}
                                className={`flex-shrink-0 rounded-md transition-all duration-300 ease-in-out flex items-center justify-center relative ${
                                  isCenterSlot 
                                    ? 'border-2 border-[#0F58F9] bg-gray-600 opacity-100 cursor-pointer' 
                                    : 'border border-transparent bg-gray-600 opacity-40 cursor-default'
                                }`}
                                style={{ width: '245px', aspectRatio: '16/9' }}
                              >
                                <span className="text-gray-500">Avatar {avatarNumber}</span>
                                
                                {/* Avatar name using portal */}
                                {typeof window !== 'undefined' && document.getElementById('avatar-names-portal') && createPortal(
                                  <div 
                                    className="absolute text-sm font-medium whitespace-nowrap" 
                                    style={{ 
                                      color: '#000000',
                                      left: `${50 + (slotIndex - 1) * 33.33}%`,
                                      transform: 'translateX(-50%)',
                                      bottom: '19px'
                                    }}
                                  >
                                    Name {avatarNumber}
                                  </div>,
                                  document.getElementById('avatar-names-portal')!
                                )}
                                
                                {/* Navigation buttons - only show on center slot */}
                                {isCenterSlot && (
                                  <>
                                    {/* Left Navigation Button - Scroll left */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setScrollPosition(scrollPosition - 1);
                                        // Update selected avatar to match center slot
                                        const newAvatar = scrollPosition === 0 ? 6 : scrollPosition;
                                        setSelectedAvatar(newAvatar);
                                      }}
                                      className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#0F58F9] flex items-center justify-center hover:opacity-80 transition-all duration-200 ease-in-out"
                                    >
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </button>

                                    {/* Right Navigation Button - Scroll right */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setScrollPosition(scrollPosition + 1);
                                        // Update selected avatar to match center slot
                                        const newAvatar = (scrollPosition + 2) % 6 + 1;
                                        setSelectedAvatar(newAvatar);
                                      }}
                                      className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#0F58F9] flex items-center justify-center hover:opacity-80 transition-all duration-200 ease-in-out"
                                    >
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              <div className="bg-white rounded-lg pb-6 border border-[#E0E0E0] flex flex-col gap-4 mt-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
                <div className="flex items-center justify-between py-2 border-b border-[#E0E0E0] px-6">
                  <div className="flex flex-col">
                    <h2 className="text-md font-medium text-[#171718]">{t('interface.generate.themes', 'Themes')}</h2>
                    <p className="text-[#A5A5A5] text-sm">{t('interface.generate.themesDescription', 'Use one of our popular themes below or browse others')}</p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm text-[#71717AB2] hover:opacity-80 transition-opacity border border-[#878787] rounded-lg px-3 py-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717AB2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-palette-icon lucide-palette w-4 h-4"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" /><circle cx="13.5" cy="6.5" r=".5" fill="#71717AB2" /><circle cx="17.5" cy="10.5" r=".5" fill="#71717AB2" /><circle cx="6.5" cy="12.5" r=".5" fill="#71717AB2" /><circle cx="8.5" cy="7.5" r=".5" fill="#71717AB2" /></svg>
                    <span>{t('interface.generate.viewMore', 'View more')}</span>
                  </button>
                </div>

                <div className="flex flex-col gap-5 px-6">
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
                          className={`relative flex flex-col rounded-lg overflow-hidden transition-all p-2 gap-2 ${isSelected
                            ? 'bg-[#F2F8FF] border-2 border-[#0F58F9]'
                            : 'bg-[#FFFFFF] border border-[#E0E0E0] hover:shadow-lg'
                            }`}
                        >
                          {/* Status indicator circle - top right */}
                          <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${isSelected
                            ? 'bg-[#0F58F9]'
                            : 'bg-white border border-[#E0E0E0]'
                            }`}>
                            {isSelected && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          
                          <div className="w-[214px] h-[116px] flex items-center justify-center">
                            <ThemeSvgComponent />
                          </div>
                          <div className="flex items-center justify-left px-3">
                            <span className="text-sm text-[#20355D] font-medium select-none">
                              {theme.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                    </div>
                  </div>
                </div>

                {/* Content section */}
                  <div className="bg-white rounded-lg pb-6 border border-[#E0E0E0] flex flex-col gap-4 mt-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
                    <div className="flex items-center py-2 border-b border-[#E0E0E0] px-6">
                      <div className="flex flex-col">
                      <h2 className="text-md font-medium text-[#171718]">{t('interface.generate.content', 'Content')}</h2>
                      <p className="text-[#A5A5A5] text-sm">{t('interface.generate.adjustImageStyles', 'Adjust image styles')}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-6">
                    {/* Image Source */}
                      <div className="px-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {t('interface.generate.imageSource', 'Image source')}
                        </label>
                        <CustomPillSelector
                          value={selectedImageSource}
                          onValueChange={setSelectedImageSource}
                          options={[
                            { value: "Ai images", label: "Ai images" }
                          ]}
                          label={t('interface.generate.imageSource', 'Image source')}
                          className="w-full"
                        />
                      </div>
                      </div>
                    </div>

              </div>
            </section>
          )}
          </div> {/* end max-w-4xl wrapper */}
        </div> {/* end main content area */}

        {/* AI Agent Side Panel - slides from right */}
        <div 
          className="fixed top-0 right-0 h-full transition-transform duration-300 ease-in-out z-30 flex flex-col"
          style={{
            width: '400px',
            backgroundColor: '#F9F9F9',
            transform: showAiAgent ? 'translateX(0)' : 'translateX(100%)',
            borderLeft: '1px solid #CCCCCC'
          }}
        >
          <AiAgent
            editPrompt={editPrompt}
            setEditPrompt={setEditPrompt}
            examples={lessonExamples}
            selectedExamples={selectedExamples}
            toggleExample={toggleExample}
            loadingEdit={loadingEdit}
            onApplyEdit={() => {
              handleApplyLessonEdit();
              setAdvancedModeState("Used");
            }}
            onClose={() => setShowAiAgent(false)}
            advancedSectionRef={advancedSectionRef}
            placeholder={t('interface.generate.describeImprovements', 'Describe what you\'d like to improve...')}
            buttonText="Edit"
            hasStartedChat={aiAgentChatStarted}
            setHasStartedChat={setAiAgentChatStarted}
            lastUserMessage={aiAgentLastMessage}
            setLastUserMessage={setAiAgentLastMessage}
          />
        </div>
      </div> {/* end flex container */}

      {/* Full-width generate footer bar */}
          {streamDone && content && (
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white py-4 px-6 flex items-center justify-center transition-all duration-300 ease-in-out border-t border-[#E0E0E0]">
              {/* Credits required */}
              <div className="absolute left-6 flex items-center gap-2 text-base font-medium text-[#A5A5A5] select-none">
                {/* custom credits svg */}
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_476_6531)">
                    <path d="M12.0597 6.91301C12.6899 7.14796 13.2507 7.53803 13.6902 8.04714C14.1297 8.55625 14.4337 9.16797 14.5742 9.82572C14.7146 10.4835 14.6869 11.166 14.4937 11.8102C14.3005 12.4545 13.9479 13.0396 13.4686 13.5114C12.9893 13.9833 12.3988 14.3267 11.7517 14.5098C11.1045 14.693 10.4216 14.71 9.76613 14.5593C9.11065 14.4086 8.50375 14.0951 8.00156 13.6477C7.49937 13.2003 7.1181 12.6335 6.89301 11.9997M4.66634 3.99967H5.33301V6.66634M11.1397 9.25301L11.6063 9.72634L9.72634 11.6063M9.33301 5.33301C9.33301 7.54215 7.54215 9.33301 5.33301 9.33301C3.12387 9.33301 1.33301 7.54215 1.33301 5.33301C1.33301 3.12387 3.12387 1.33301 5.33301 1.33301C7.54215 1.33301 9.33301 3.12387 9.33301 5.33301Z" stroke="#A5A5A5" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_476_6531">
                      <rect width="16" height="16" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                <span>{calculateLessonPresentationCredits(slidesCount)} {t('interface.generate.credits', 'credits')}</span>
              </div>

              {/* AI Agent + generate */}
              <div className="flex items-center gap-[10px]">
                {!showAiAgent && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAiAgent(!showAiAgent);
                      handleAdvancedModeClick();
                    }}
                    className="px-4 py-2 rounded-md border border-[#0F58F9] bg-white text-[#0F58F9] text-lg font-medium hover:bg-blue-50 active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.1986 4.31106L9.99843 6.11078M2.79912 3.71115V6.11078M11.1983 8.51041V10.91M5.79883 1.31152V2.51134M3.99901 4.91097H1.59924M12.3982 9.71022H9.99843M6.39877 1.91143H5.19889M12.7822 2.29537L12.0142 1.52749C11.9467 1.45929 11.8664 1.40515 11.7778 1.3682C11.6893 1.33125 11.5942 1.31223 11.4983 1.31223C11.4023 1.31223 11.3073 1.33125 11.2188 1.3682C11.1302 1.40515 11.0498 1.45929 10.9823 1.52749L1.21527 11.294C1.14707 11.3615 1.09293 11.4418 1.05598 11.5304C1.01903 11.6189 1 11.7139 1 11.8099C1 11.9059 1.01903 12.0009 1.05598 12.0894C1.09293 12.178 1.14707 12.2583 1.21527 12.3258L1.9832 13.0937C2.05029 13.1626 2.13051 13.2174 2.21912 13.2548C2.30774 13.2922 2.40296 13.3115 2.49915 13.3115C2.59534 13.3115 2.69056 13.2922 2.77918 13.2548C2.86779 13.2174 2.94801 13.1626 3.0151 13.0937L12.7822 3.32721C12.8511 3.26013 12.9059 3.17991 12.9433 3.0913C12.9807 3.00269 13 2.90748 13 2.81129C13 2.7151 12.9807 2.61989 12.9433 2.53128C12.9059 2.44267 12.8511 2.36245 12.7822 2.29537Z" stroke="#0F58F9" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{t('interface.courseOutline.aiAgent', 'AI Agent')}</span>
                  </button>
                )}
                <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerateFinal}
                    className="px-4 py-2 rounded-md bg-[#0F58F9] text-white text-lg font-semibold hover:bg-[#0D4AD1] active:scale-95 shadow-lg transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={loading || isGenerating}
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.5423 12.1718C11.1071 12.3383 10.8704 12.5762 10.702 13.0106C10.5353 12.5762 10.297 12.3399 9.86183 12.1718C10.297 12.0053 10.5337 11.769 10.702 11.3329C10.8688 11.7674 11.1071 12.0037 11.5423 12.1718ZM10.7628 5.37068C11.1399 3.9685 11.6552 3.45294 13.0612 3.07596C11.6568 2.6995 11.1404 2.18501 10.7628 0.78125C10.3858 2.18343 9.87044 2.69899 8.46442 3.07596C9.86886 3.45243 10.3852 3.96692 10.7628 5.37068ZM11.1732 8.26481C11.1732 8.1327 11.1044 7.9732 10.9118 7.9195C9.33637 7.47967 8.34932 6.97753 7.61233 6.24235C6.8754 5.50661 6.37139 4.52108 5.93249 2.94815C5.8787 2.75589 5.71894 2.68715 5.58662 2.68715C5.4543 2.68715 5.29454 2.75589 5.24076 2.94815C4.80022 4.52108 4.29727 5.50655 3.56092 6.24235C2.82291 6.97918 1.83688 7.4813 0.261415 7.9195C0.0688515 7.9732 0 8.13271 0 8.26481C0 8.39692 0.0688515 8.55643 0.261415 8.61013C1.83688 9.04996 2.82393 9.5521 3.56092 10.2873C4.29892 11.0241 4.80186 12.0085 5.24076 13.5815C5.29455 13.7737 5.45431 13.8425 5.58662 13.8425C5.71895 13.8425 5.87871 13.7737 5.93249 13.5815C6.37303 12.0085 6.87598 11.0231 7.61233 10.2873C8.35034 9.55045 9.33637 9.04832 10.9118 8.61013C11.1044 8.55642 11.1732 8.39692 11.1732 8.26481Z" fill="white"/>
                    </svg>
                    <span className="select-none font-semibold">{t('interface.generate.generatePresentation', 'Generate Presentation')}</span>
                </button>
              </div>
              </div>
            </div>
          )}
      </main>
      <style jsx global>{`
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      button, select, input[type="checkbox"], label[role="button"], label[for] { cursor: pointer; }
      
      /* Override CustomPillSelector border colors in this component */
      [data-slot="select-trigger"] {
        border-color: #CCCCCC !important;
      }
      [data-slot="select-content"] {
        border-color: #CCCCCC !important;
      }
    `}</style>
      {isGenerating && (
        <div className="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-50">
          <LoadingAnimation message="Finalizing lesson..." />
        </div>
      )}
      
      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showInsufficientCreditsModal}
        onClose={() => {
          setShowInsufficientCreditsModal(false);
          setIsHandlingInsufficientCredits(false); // Reset flag when modal is closed
        }}
        onBuyMore={() => {
          setShowInsufficientCreditsModal(false);
          setIsHandlingInsufficientCredits(false); // Reset flag when modal is closed
          setShowAddonsModal(true);
        }}
      />
      
      {/* Add-ons Modal */}
      <ManageAddonsModal 
        isOpen={showAddonsModal} 
        onClose={() => setShowAddonsModal(false)} 
      />
    
    <FeedbackButton />
    </>
  );
} 