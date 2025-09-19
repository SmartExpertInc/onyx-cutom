"use client";
/* eslint-disable */
// @ts-nocheck – this component is compiled by Next.js but lives outside the main
// app dir, so local tsconfig paths/types do not apply. Disable type-checking to
// avoid IDE / build noise until shared tsconfig is wired up.

import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Sparkles, Settings, AlignLeft, AlignCenter, AlignRight, Edit } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "../../../contexts/LanguageContext";
import { getPromptFromUrlOrStorage } from "../../../utils/promptUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Base URL so frontend can reach custom backend through nginx proxy
const CUSTOM_BACKEND_URL =
  process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

interface ModulePreview {
  id: string;
  title: string;
  lessons: string[];
}

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
        <p className="text-sm text-gray-600 select-none min-h-[1.25rem]">{message}</p>
      )}
    </div>
  );
};

// Helper to retry fetch up to 2 times on 504 Gateway Timeout
async function fetchWithRetry(input: RequestInfo, init: RequestInit, retries = 2): Promise<Response> {
  let attempt = 0;
  while (true) {
    const res = await fetch(input, init);
    if (res.status !== 504 || attempt >= retries) return res;
    attempt += 1;
  }
}

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

// ---------------- Markdown → ModulePreview parser ----------------
// A very small subset of the Python _parse_outline_markdown logic. Good enough
// for live preview during streaming – it detects "## " headings as modules and
// top-level list items as lessons. Indented lines are kept under the current
// lesson so we preserve detail blocks.
function parseOutlineMarkdown(md: string): ModulePreview[] {
  const modules: ModulePreview[] = [];
  let current: ModulePreview | null = null;
  let lessonBuf: string[] = [];

  const flushLesson = () => {
    if (lessonBuf.length && current) {
      current.lessons.push(lessonBuf.join("\n"));
      lessonBuf = [];
    }
  };

  const listItemRegex = /^(?:- |\* |\d+\.)/;

  md.split(/\r?\n/).forEach((raw) => {
    if (!raw.trim()) return;
    const indent = raw.match(/^\s*/)?.[0].length ?? 0;
    const line = raw.trim();

    if (line.startsWith("## ")) {
      flushLesson();
      const title = line.replace(/^##\s*/, "").split(":").pop()?.trim() || "Module";
      current = { id: `mod${modules.length + 1}`, title, lessons: [] };
      modules.push(current);
      return;
    }

    // Delay creating a module until we actually encounter either a heading or
    // at least one top-level list item. This prevents the temporary
    // "Outline" placeholder from flashing before the first real module
    // heading arrives in the stream.
    if (!current && (indent === 0 && listItemRegex.test(line))) {
      current = { id: `mod${modules.length + 1}`, title: "Module", lessons: [] };
      modules.push(current);
    }

    if (indent === 0 && listItemRegex.test(line)) {
      flushLesson();
      let titleLine = line.replace(listItemRegex, "").trim();
      // Remove Markdown bold markers **title** → title
      if (titleLine.startsWith("**") && titleLine.includes("**", 2)) {
        titleLine = titleLine.split("**")[1].trim();
      }
      lessonBuf.push(titleLine);
    } else if (indent > 0) {
      lessonBuf.push(line);
    }
  });

  flushLesson();
  // Filter out rare placeholder module produced by backend fallback
  return modules.filter((m) => m.title.toLowerCase() !== "outline");
}
// -----------------------------------------------------------------

// Add ThemeSvgs import after existing imports
import { ThemeSvgs } from "../../../components/theme/ThemeSvgs";

export default function CourseOutlineClient() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const [prompt, setPrompt] = useState(getPromptFromUrlOrStorage(params?.get("prompt") || ""));
  const [modules, setModules] = useState<number>(Number(params?.get("modules") || 4));
  const [lessonsPerModule, setLessonsPerModule] = useState<string>(params?.get("lessons") || "3 - 4");
  const [language, setLanguage] = useState<string>(params?.get("lang") || "en");

  // File context for creation from documents
  const isFromFiles = params?.get("fromFiles") === "true";
  
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
  const folderIds = params?.get("folderIds")?.split(",").filter(Boolean) || [];
  const fileIds = params?.get("fileIds")?.split(",").filter(Boolean) || [];
  
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

  // Optional pre-created chat session id (speeds up backend). If none present, we lazily
  // call the backend to obtain one and store it both in state and the URL so subsequent
  // preview/finalize calls can use the same cached outline.
  const [chatId, setChatId] = useState<string | null>(params?.get("chatId") || null);

  const [preview, setPreview] = useState<ModulePreview[]>([]);
  const [rawOutline, setRawOutline] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Track whether user has manually edited the preview content
  const [hasUserEdits, setHasUserEdits] = useState(false);
  
  // Track whether we're currently processing an advanced edit to prevent preview regeneration
  const [isAdvancedEditInProgress, setIsAdvancedEditInProgress] = useState(false);

  // Currently chosen theme (affects outline colors)
  const [selectedTheme, setSelectedTheme] = useState<string>("cherry");

  // Theme configuration for outline colors
  const themeConfig = {
    cherry: {
      headerBg: "bg-[#E5EEFF]", // current blue
      numberColor: "text-gray-600", // current gray
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

  // Track which lesson rows are expanded: key format `${modIdx}-${lessonIdx}` -> boolean
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const router = useRouter();

  // Keep a reference to the current in-flight preview request so we can cancel it
  const previewAbortRef = useRef<AbortController | null>(null);

  // Ref for auto-resizing the prompt textarea
  const promptRef = useRef<HTMLTextAreaElement>(null);

  // Resize the textarea based on its content
  useEffect(() => {
    if (promptRef.current) {
      promptRef.current.style.height = "auto";
      promptRef.current.style.height = `${promptRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  // Build dynamic fake-thought list based on current params
  const makeThoughts = () => {
    const list: string[] = [];
    list.push(`Analyzing request for "${prompt.slice(0, 40) || "Untitled"}"...`);
    list.push(`Detected language: ${language.toUpperCase()}`);
    list.push(`Planning ${modules} module${modules > 1 ? "s" : ""} with ${lessonsPerModule} lessons each...`);
    // shuffle little filler line
    list.push("Consulting training knowledge base...");

    // Add a diverse set of informative yet playful status lines (20 new ones)
    const extra = [
      "Refining learning objectives...",
      "Mapping Bloom's taxonomy levels...",
      "Selecting engaging examples...",
      "Integrating industry insights...",
      "Balancing difficulty curve...",
      "Cross-checking domain prerequisites...",
      "Curating knowledge checkpoints...",
      "Weaving narrative flow...",
      "Injecting practical exercises...",
      "Sequencing content logically...",
      "Optimizing cognitive load...",
      "Aligning verbs with outcomes...",
      "Ensuring inclusive language...",
      "Connecting theory and practice...",
      "Drafting assessment prompts...",
      "Incorporating spaced repetition...",
      "Adding real-world case studies...",
      "Scanning latest research papers...",
      "Validating terminology consistency...",
      "Polishing section transitions...",
    ];
    list.push(...extra);
    return list;
  };

  const [thoughts, setThoughts] = useState<string[]>(makeThoughts());
  const [thoughtIdx, setThoughtIdx] = useState(0);
  const thoughtTimerRef = useRef<NodeJS.Timeout | null>(null);

  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  const delayForThought = (text: string): number => {
    if (text.startsWith("Analyzing")) return rand(2500, 5000);
    if (text.startsWith("Detected language")) return rand(1200, 2000);
    if (text.startsWith("Planning")) return rand(4000, 7000);
    if (text.startsWith("Consulting")) return rand(3500, 6000);
    return rand(2000, 4000);
  };

  // Cycle through thoughts whenever loading=true
  useEffect(() => {
    if (loading) {
      setThoughts(makeThoughts());
      setThoughtIdx(0);

      const scheduleNext = (index: number) => {
        const txt = thoughts[index];
        const delay = delayForThought(txt);
        if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
        if (txt.startsWith("Finalizing outline")) return; // keep until loading finishes
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
     
  }, [loading, modules, lessonsPerModule, prompt, language]);

  // Kick off chat-session creation on first mount when absent.
  useEffect(() => {
    const advancedData = sessionStorage.getItem('advanced-mode-data-return');
    if (advancedData) {
      try {
        const parsedData = JSON.parse(advancedData);
        setPreview(parsedData.preview);
        setPrompt(parsedData.prompt);
        setModules(parsedData.modules);
        setLessonsPerModule(parsedData.lessonsPerModule);
        setLanguage(parsedData.language);
        setChatId(parsedData.chatId);
        setRawOutline(parsedData.rawOutline || "");
        lastPreviewParamsRef.current = {
          prompt: parsedData.prompt,
          modules: parsedData.modules,
          lessonsPerModule: parsedData.lessonsPerModule,
          language: parsedData.language,
        };
      } catch (e) {
        console.error("Failed to parse advanced mode data", e);
      } finally {
        sessionStorage.removeItem('advanced-mode-data-return');
      }
      return; // End effect here for this case
    }

    if (chatId) return; // already have one
    const createChat = async () => {
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/course-outline/init-chat`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to init chat session");
        const data = await res.json();
        if (data.chatSessionId) {
          setChatId(data.chatSessionId);
          // Persist in URL so refreshes keep the same session (avoid resetting preview)
          const sp = new URLSearchParams(Array.from(params?.entries() || []));
          sp.set("chatId", data.chatSessionId);
          // Don't push a new history entry; just replace current.
          router.replace(`?${sp.toString()}`, { scroll: false });
        }
      } catch {
        /* ignore – fallback will spawn a fresh session on demand */
      }
    };
    createChat();
     
  }, []);

  // Auto-fetch preview when parameters change (debounced to avoid spamming)
  useEffect(() => {
    // Skip while finalizing
    if (isGenerating) return;

    // Skip while advanced edit is in progress
    if (isAdvancedEditInProgress) return;

    // If creating from text but userText not loaded yet, wait
    if (isFromText && !userText) return;

    // If params unchanged from last preview, skip fetch
    const same = lastPreviewParamsRef.current &&
      lastPreviewParamsRef.current.prompt === prompt &&
      lastPreviewParamsRef.current.modules === modules &&
      lastPreviewParamsRef.current.lessonsPerModule === lessonsPerModule &&
      lastPreviewParamsRef.current.language === language &&
      lastPreviewParamsRef.current.userText === userText &&
      lastPreviewParamsRef.current.textMode === textMode &&
      lastPreviewParamsRef.current.isFromText === isFromText;

    if (same) return;

    // If user has made edits to the preview content, don't regenerate at all
    // This prevents any regeneration when user has modified the preview
    if (hasUserEdits) return;

    // Disable automatic preview regeneration when prompt changes
    // Only regenerate for module count, lessons per module, or language changes
    if (lastPreviewParamsRef.current && lastPreviewParamsRef.current.prompt !== prompt) {
      return; // Skip regeneration when only prompt changes
    }

    if (prompt.length === 0 || loading) return;
    if (!chatId) return;

    const startPreview = (attempt: number = 0) => {
      const abortController = new AbortController();
      if (previewAbortRef.current) previewAbortRef.current.abort();
      previewAbortRef.current = abortController;

      const fetchPreview = async () => {
        setLoading(true);
        setError(null);
        setPreview([]);
        setRawOutline("");
        setHasUserEdits(false); // Reset user edits flag when generating new preview

        let gotFirstChunk = false;

        try {
          const requestBody: any = { 
            prompt, 
            modules, 
            lessonsPerModule, 
            language, 
            chatSessionId: chatId || undefined 
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
          }

          const res = await fetchWithRetry(`${CUSTOM_BACKEND_URL}/course-outline/preview`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            signal: abortController.signal,
          });
          if (!res.ok) throw new Error(`Bad response ${res.status}`);
          const decoder = new TextDecoder();
          const reader = res.body?.getReader();
          if (!reader) throw new Error("No stream body");

          let buffer = "";
          let accumulatedRaw = "";

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const ln of lines) {
              if (!ln.trim()) continue;
              const pkt = JSON.parse(ln);
              gotFirstChunk = true;
              if (pkt.type === "delta") {
                accumulatedRaw += pkt.text;
                const parsed = parseOutlineMarkdown(accumulatedRaw);
                setPreview(parsed);
                setRawOutline(accumulatedRaw);
              } else if (pkt.type === "done") {
                const finalModsRaw = Array.isArray(pkt.modules) ? pkt.modules : parseOutlineMarkdown(pkt.raw || accumulatedRaw);
                const finalMods = finalModsRaw.filter((m: any) => (m.title || "").toLowerCase() !== "outline");
                setPreview(finalMods);
                setRawOutline(typeof pkt.raw === "string" ? pkt.raw : accumulatedRaw);
                setHasUserEdits(false); // Reset user edits flag when preview is complete
                lastPreviewParamsRef.current = {
                  prompt,
                  modules,
                  lessonsPerModule,
                  language,
                  userText,
                  textMode: textMode || undefined,
                  isFromText
                };
              }
            }
          }

          if (buffer.trim()) {
            try {
              const pkt = JSON.parse(buffer.trim());
              gotFirstChunk = true;
              if (pkt.type === "delta") {
                accumulatedRaw += pkt.text;
                const parsed = parseOutlineMarkdown(accumulatedRaw);
                setPreview(parsed);
                setRawOutline(accumulatedRaw);
              } else if (pkt.type === "done") {
                const finalModsRaw = Array.isArray(pkt.modules) ? pkt.modules : parseOutlineMarkdown(pkt.raw || accumulatedRaw);
                const finalMods = finalModsRaw.filter((m: any) => (m.title || "").toLowerCase() !== "outline");
                setPreview(finalMods);
                setRawOutline(typeof pkt.raw === "string" ? pkt.raw : accumulatedRaw);
                setHasUserEdits(false); // Reset user edits flag when preview is complete
                lastPreviewParamsRef.current = {
                  prompt,
                  modules,
                  lessonsPerModule,
                  language,
                  userText,
                  textMode: textMode || undefined,
                  isFromText
                };
              }
            } catch {/* ignore */}
          }
        } catch (e: any) {
          if (e.name !== "AbortError") {
            console.error("preview request failed", e);
            // only schedule retry if not exceeded attempts and parameters unchanged
            if (!abortController.signal.aborted && attempt < 3) {
              setTimeout(() => startPreview(attempt + 1), 1500 * (attempt + 1));
              return;
            }
            setError(e.message);
          }
        } finally {
          if (!abortController.signal.aborted) {
            setLoading(false);
            if (!gotFirstChunk && attempt >= 3) {
              setError("Failed to generate outline – please try again later.");
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
  }, [prompt, modules, lessonsPerModule, language, isGenerating, chatId, isFromText, userText, textMode, hasUserEdits, isAdvancedEditInProgress]);

  const handleModuleChange = (index: number, value: string) => {
    setHasUserEdits(true);
    setPreview((prev: ModulePreview[]) => {
      const copy = [...prev];
      copy[index].title = value;
      return copy;
    });
  };

  const handleLessonChange = (modIdx: number, lessonIdx: number, value: string) => {
    setHasUserEdits(true);
    setPreview((prev: ModulePreview[]) => {
      const copy = [...prev];
      // Only update with markdown formatting if there's actual content
      copy[modIdx].lessons[lessonIdx] = value.trim() ? value : "";
      return copy;
    });
  };

  const handleLessonsTextareaChange = (modIdx: number, value: string) => {
    setHasUserEdits(true);
    setPreview((prev: ModulePreview[]) => {
      const copy = [...prev];
      // Keep raw lines as-is during editing to prevent cursor jumps;
      // Final cleanup happens just before we send to backend.
      copy[modIdx].lessons = value.split(/\r?\n/);
      return copy;
    });
  };

  const handleGenerateFinal = async () => {
    if (isGenerating) return; // guard against double-click / duplicate requests
    // Stop any ongoing preview fetch so it doesn't flash / restart while finalizing
    if (previewAbortRef.current) {
      previewAbortRef.current.abort();
    }

    setIsGenerating(true);
    // Ensure the preview spinner / fake-thoughts are not shown while we're in finalize mode
    setLoading(false);
    setError(null);
    try {
      const outlineForBackend = {
        mainTitle: prompt,
        sections: preview.map((m: ModulePreview, idx: number) => ({
          id: `№${idx + 1}`,
          title: m.title,
          totalHours: 0,
          lessons: m.lessons.map((les: string) => ({
            title: les,
            check: { type: "no", text: "" },
            contentAvailable: { type: "no", text: "" },
            source: "",
            hours: 0,
          })),
        })),
        detectedLanguage: language,
        theme: selectedTheme, // Save the selected theme
      };

      const finalizeBody: any = {
        prompt,
        modules,
        lessonsPerModule,
        language,
        chatSessionId: chatId || undefined,
        editedOutline: outlineForBackend,
        theme: selectedTheme, // send theme to backend
      };
      
      // Add file context if creating from files
      if (isFromFiles) {
        finalizeBody.fromFiles = true;
        if (folderIds.length > 0) finalizeBody.folderIds = folderIds.join(',');
        if (fileIds.length > 0) finalizeBody.fileIds = fileIds.join(',');
      }

      // Add text context if creating from text
      if (isFromText) {
        finalizeBody.fromText = true;
        finalizeBody.textMode = textMode;
        finalizeBody.userText = userText;
      }

      // Add folder context if coming from inside a folder
      if (folderContext?.folderId) {
        finalizeBody.folderId = folderContext.folderId;
      }

      // Add connector context if creating from connectors
      if (isFromConnectors) {
        finalizeBody.fromConnectors = true;
        finalizeBody.connectorIds = connectorIds.join(',');
        finalizeBody.connectorSources = connectorSources.join(',');
      }

      const res = await fetchWithRetry(`${CUSTOM_BACKEND_URL}/course-outline/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalizeBody),
      });
      if (!res.ok) throw new Error(await res.text());

      let data;
      
      // Check if this is a streaming response by trying to get a reader
      const reader = res.body?.getReader();
      if (reader) {
        // Streaming response (assistant + parser path)
        const decoder = new TextDecoder();
        let buffer = "";
        let finalResult = null;

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            
            for (const ln of lines) {
              if (!ln.trim()) continue;
              try {
                const pkt = JSON.parse(ln);
                if (pkt.type === "done") {
                  finalResult = pkt;
                  break;
                } else if (pkt.type === "error") {
                  throw new Error(pkt.message || "Unknown error occurred");
                }
              } catch (e) {
                // Skip invalid JSON lines unless it's an error we threw
                if (e instanceof Error && e.message !== "Unexpected token" && e.message !== "Unexpected end of JSON input") {
                  throw e;
                }
                continue;
              }
            }
            
            if (finalResult) break;
          }

          // Handle any remaining buffer
          if (buffer.trim() && !finalResult) {
            try {
              const pkt = JSON.parse(buffer.trim());
              if (pkt.type === "done") {
                finalResult = pkt;
              } else if (pkt.type === "error") {
                throw new Error(pkt.message || "Unknown error occurred");
              }
            } catch (e) {
              // Ignore parsing errors for final buffer unless it's an error we threw
              if (e instanceof Error && e.message !== "Unexpected token" && e.message !== "Unexpected end of JSON input") {
                throw e;
              }
            }
          }

          if (!finalResult) {
            throw new Error("No final result received from streaming response");
          }

          data = finalResult;
        } finally {
          reader.releaseLock();
        }
      } else {
        // Regular JSON response (direct parser path)
        data = await res.json();
      }

      // Validate response has required id field
      if (!data || !data.id) {
        throw new Error("Invalid response from server: missing project ID");
      }

      // Build query params for the product view
      const qp = new URLSearchParams();

      // Navigate to the newly-created product view. Using router.push ensures Next.js automatically
      // prefixes the configured `basePath` (e.g. "/custom-projects-ui") so we don't accidentally
      // leave the custom frontend and hit the main app's /projects route.
      router.push(`/projects/view/${data.id}?${qp.toString()}`);
    } catch (e: any) {
      setError(e.message);
      // allow UI interaction again
      setIsGenerating(false);
      setLoading(false);
    }
  };

  const toggleExpanded = (modIdx: number, lessonIdx: number) => {
    const key = `${modIdx}-${lessonIdx}`;
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLessonTitleChange = (modIdx: number, lessonIdx: number, newTitle: string) => {
    setHasUserEdits(true);
    setPreview((prev: ModulePreview[]) => {
      const copy = [...prev];
      if (newTitle.trim() === "") {
        // If title is empty, replace the entire lesson content with empty string
        copy[modIdx].lessons[lessonIdx] = "";
      } else {
        // Otherwise, only update the first line
        const lines = copy[modIdx].lessons[lessonIdx].split(/\r?\n/);
        lines[0] = newTitle;
        copy[modIdx].lessons[lessonIdx] = lines.join("\n");
      }
      return copy;
    });
  };

  // Split lesson into two when user presses Enter while editing the title input
  const handleLessonTitleKeyDown = (
    modIdx: number,
    lessonIdx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const input = e.currentTarget;
      const val = input.value;
      const caret = input.selectionStart ?? val.length;
      const beforeRaw = val.slice(0, caret);
      const afterRaw = val.slice(caret);

      const before = beforeRaw.trimEnd();
      const after = afterRaw.trimStart();

      setHasUserEdits(true);
      setPreview((prev: ModulePreview[]) => {
        const copy = [...prev];
        const lessonLines = copy[modIdx].lessons[lessonIdx].split(/\r?\n/);
        const details = lessonLines.slice(1); // keep any detail lines under current lesson

        // Update current lesson title to the text before the caret
        copy[modIdx].lessons[lessonIdx] = [before || "", ...details].join("\n");

        // Insert a new lesson right after with the remaining text (or empty string)
        const newLessonFirstLine = after || "";
        copy[modIdx].lessons.splice(lessonIdx + 1, 0, newLessonFirstLine);

        return copy;
      });

      // Focus the newly created lesson input on next tick
      requestAnimationFrame(() => {
        const selector = `input[data-mod='${modIdx}'][data-les='${lessonIdx + 1}']`;
        const newInput = document.querySelector<HTMLInputElement>(selector);
        newInput?.focus();
      });
    }
  };

  const handleLessonDetailsChange = (modIdx: number, lessonIdx: number, detailIdx: number, newVal: string) => {
    setHasUserEdits(true);
    setPreview((prev: ModulePreview[]) => {
      const copy = [...prev];
      const lines = copy[modIdx].lessons[lessonIdx].split(/\r?\n/);
      // detail lines start from index 1
      const original = lines[detailIdx + 1] || "";
      const match = original.match(/^\s*-?\s*\*\*(.+?)\*\*:\s*(.*)$/);
      if (match) {
        const label = match[1];
        lines[detailIdx + 1] = `- **${label}**: ${newVal}`;
      } else {
        // fallback keep original prefix until colon
        const parts = original.split(":");
        if (parts.length > 1) {
          parts[1] = ` ${newVal}`;
          lines[detailIdx + 1] = parts.join(":");
        } else {
          lines[detailIdx + 1] = newVal;
        }
      }
      copy[modIdx].lessons[lessonIdx] = lines.join("\n");
      return copy;
    });
  };



  // Total characters in editable outline preview (titles + lessons)
  const charCount = useMemo(() => {
    return preview.reduce((sum: number, mod: ModulePreview) => {
      const lessonChars = mod.lessons.reduce((ls, l) => ls + l.length, 0);
      return sum + mod.title.length + lessonChars;
    }, 0);
  }, [preview]);

  // Total lessons & credit cost (5 credits for course outline finalization)
  const lessonsTotal = useMemo(() => preview.reduce((sum, m) => sum + m.lessons.length, 0), [preview]);
  const creditsRequired = 5; // Fixed cost for course outline finalization

  // Predefined theme preview data to match provided mockup
  const themeOptions = [
    { id: "cherry", label: "Default" },
    { id: "terracotta", label: "Deloitte" },
    { id: "vanilla", label: "Engenuity" },
    { id: "lunaria", label: "Lunaria" },
    { id: "wine", label: "Wine" },
    { id: "zephyr", label: "Zephyr" },
  ];

  // Content section selections (UI-only)
  const [textDensity, setTextDensity] = useState<"brief" | "medium" | "detailed">("medium");
  const [imageSource, setImageSource] = useState<string>("ai");
  const [aiModel, setAiModel] = useState<string>("flux-fast");

  const lastPreviewParamsRef = useRef<{
    prompt: string;
    modules: number;
    lessonsPerModule: string;
    language: string;
    userText?: string;
    textMode?: string;
    isFromText?: boolean;
  } | null>(null);



  // Add a brand-new module to the editable preview list
  const handleAddModule = () => {
    setHasUserEdits(true);
    setPreview((prev: ModulePreview[]) => {
      const nextIdx = prev.length + 1;
      const newMod: ModulePreview = {
        id: `mod${nextIdx}`,
        title: `Module ${nextIdx}`,
        lessons: [""], // start with one empty placeholder lesson
      };
      return [...prev, newMod];
    });

    // Focus the new module title field on the next tick
    requestAnimationFrame(() => {
      const input = document.querySelector<HTMLInputElement>(`input[data-modtitle='${modules}']`);
      input?.focus();
    });
  };

  // ===== Submit incremental edit (inline Advanced section) =====
  const handleApplyEdit = async () => {
    const trimmed = editPrompt.trim();
    if (!trimmed || loadingPreview) return;

    // Combine previous prompt with the newly entered edit instruction.
    let combined = prompt.trim();
    if (combined && !/[.!?]$/.test(combined)) combined += "."; // ensure sentence break
    combined = combined ? `${combined} ${trimmed}` : trimmed;

    setLoadingPreview(true);
    setError(null);
    setIsAdvancedEditInProgress(true); // Prevent preview regeneration during advanced edit

    // Prevent the auto preview effect from immediately firing a redundant request
    lastPreviewParamsRef.current = {
      prompt: combined,
      modules,
      lessonsPerModule,
      language,
    };

    try {
      const res = await fetchWithRetry(`${CUSTOM_BACKEND_URL}/course-outline/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: combined,
          modules,
          lessonsPerModule,
          language,
          chatSessionId: chatId || undefined,
          originalOutline: rawOutline,
        }),
      });
      if (!res.ok) throw new Error(`Bad response ${res.status}`);

      const decoder = new TextDecoder();
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream body");

      let buf = "";
      let accRaw = "";
      let hasFirstData = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const ln of lines) {
          if (!ln.trim()) continue;
          const pkt = JSON.parse(ln);
          if (pkt.type === "delta") {
            accRaw += pkt.text;

            // Only update preview after we've received enough data to parse at least one module
            const parsed = parseOutlineMarkdown(accRaw);
            if (!hasFirstData && parsed.length > 0) {
              hasFirstData = true;
              setPreview(parsed);
              setRawOutline(accRaw);
              if (loadingPreview) setLoadingPreview(false); // hide overlay once stream starts
            } else if (hasFirstData) {
              setPreview(parsed);
              setRawOutline(accRaw);
            }
          } else if (pkt.type === "done") {
            const finalModsRaw = Array.isArray(pkt.modules) ? pkt.modules : parseOutlineMarkdown(pkt.raw || accRaw);
            const finalMods = finalModsRaw.filter((m: any) => (m.title || "").toLowerCase() !== "outline");
            setPreview(finalMods);
            setRawOutline(typeof pkt.raw === "string" ? pkt.raw : accRaw);
            setHasUserEdits(false); // Reset user edits flag when applying edit is complete
            
            // Update lastPreviewParamsRef to mark this as the current state
            lastPreviewParamsRef.current = {
              prompt: combined,
              modules,
              lessonsPerModule,
              language,
              userText,
              textMode: textMode || undefined,
              isFromText
            };
            
            // Don't update the prompt state to avoid triggering useEffect
            // The advanced edit result is now the current state, no need to update textarea
            setEditPrompt("");
            setLoadingPreview(false);
            setIsAdvancedEditInProgress(false);
          }
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed to apply edit");
    } finally {
      // Ensure overlay is removed in case of error
      setLoadingPreview(false);
      setIsAdvancedEditInProgress(false); // Always clear the flag
    }
  };

  // ---- Inline Advanced Mode ----
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  const outlineExamples: { short: string; detailed: string }[] = [
    {
      short: "Adapt to U.S. industry specifics",
      detailed:
        "Update the course Outline structure based on U.S. industry and cultural specifics: adjust module and lesson titles, replace topics, examples, and wording that don't align with the American context.",
    },
    {
      short: "Adopt trends and latest practices",
      detailed:
        "Update the Outline structure by adding modules and lessons that reflect current trends and best practices in the field. Remove outdated elements and replace them with up-to-date content.",
    },
    {
      short: "Incorporate top industry examples",
      detailed:
        "Analyze the best courses on the market in this topic and restructure the Outline accordingly: rename or add modules and lessons where others present content more effectively. Focus on content flow and clarity.",
    },
    {
      short: "Simplify and restructure the content",
      detailed:
        "Rewrite the Outline structure to make it more logical and user-friendly. Remove redundant modules, merge overlapping lessons, and rephrase titles for clarity and simplicity.",
    },
    {
      short: "Increase value and depth of content",
      detailed:
        "Strengthen the Outline by adding modules and lessons that deepen understanding and bring advanced-level value. Refine wording to clearly communicate skills and insights being delivered.",
    },
    {
      short: "Add case studies and applications",
      detailed:
        "Revise the Outline structure to include applied content in each module — such as real-life cases, examples, or actionable approaches — while keeping the theoretical foundation intact.",
    },
  ];

  const [selectedExamples, setSelectedExamples] = useState<string[]>([]);

  const toggleExample = (ex: typeof outlineExamples[number]) => {
    setSelectedExamples((prev) => {
      if (prev.includes(ex.short)) {
        // remove
        const updated = prev.filter((s) => s !== ex.short);
        // remove its detailed text line(s) from textarea
        setEditPrompt((p) => {
          return p
            .split("\n")
            .filter((line) => line.trim() !== ex.detailed)
            .join("\n")
            .replace(/^\n+|\n+$/g, "");
        });
        return updated;
      }
      // add
      setEditPrompt((p) => (p ? p + "\n" + ex.detailed : ex.detailed));
      return [...prev, ex.short];
    });
  };

  return (
    <>
    <main
      className="min-h-screen py-4 pb-24 px-4 flex flex-col items-center"
      style={{
        background: `linear-gradient(110.08deg, rgba(0, 187, 255, 0.2) 19.59%, rgba(0, 187, 255, 0.05) 80.4%), #FFFFFF`
      }}
    >
      {/* Back button */}
      <Link
        href="/create/generate"
          className="absolute top-[30px] left-[30px] flex items-center gap-2 bg-white rounded px-[15px] py-[5px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer"
        style={{
          color: '#0F58F9',
          fontSize: '14px',
          fontWeight: '600',
          lineHeight: '140%',
          letterSpacing: '0.05em'
        }}
      >
        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 9L1 5L5 1" stroke="#0F58F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {t('interface.generate.back', 'Back')}
      </Link>

      <div className="w-full max-w-3xl flex flex-col gap-6 text-gray-900 relative">

        {/* Page title */}
        <h1 className="text-center text-[64px] font-semibold leading-none text-[#191D30] mt-[97px] mb-9">{t('interface.generate.title', 'Generate')}</h1>

        {/* Controls */}
        <div className="w-full bg-white rounded-lg py-3 px-8 shadow-sm hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            {/* Modules dropdown */}
            <div className="flex-1 flex items-center justify-center">
              <Select
                value={modules.toString()}
                onValueChange={(value: string) => setModules(Number(value))}
              >
                <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                  <div className="flex items-center gap-2">
                    <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.1562 5.46446V4.59174C17.1562 3.69256 16.4421 2.97851 15.543 2.97851H9.6719L9.59256 2.76694C9.40744 2.29091 8.95785 2 8.45537 2H3.11322C2.21405 2 1.5 2.71405 1.5 3.61322V13.9008C1.5 14.8 2.21405 15.514 3.11322 15.514H15.8868C16.786 15.514 17.5 14.8 17.5 13.9008V6.2843C17.5 5.96694 17.3678 5.67603 17.1562 5.46446ZM15.543 4.14215C15.781 4.14215 15.9661 4.32727 15.9661 4.56529V5.06777H10.5182L10.1479 4.14215H15.543ZM16.3099 13.9008C16.3099 14.1388 16.1248 14.324 15.8868 14.324H3.11322C2.87521 14.324 2.69008 14.1388 2.69008 13.9008V3.58678C2.69008 3.34876 2.87521 3.16364 3.11322 3.16364L8.48182 3.19008L9.56612 5.8876C9.64545 6.12562 9.88347 6.25785 10.1215 6.25785H16.2835C16.2835 6.25785 16.3099 6.25785 16.3099 6.2843V13.9008Z" fill="black"/>
                    </svg>
                    <span className="text-[#09090B] opacity-50">{t('interface.generate.modules', 'Modules')}:</span>
                    <span className="text-[#09090B]">{modules}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="border-white max-h-[200px]" sideOffset={15}>
                  {Array.from({ length: Math.max(10, modules) }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={n.toString()} className="px-2">{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Divider */}
            <div className="w-px h-6 bg-[#E0E0E0] mx-4"></div>
            
            {/* Lessons per module dropdown */}
            <div className="flex-1 flex items-center justify-center">
              <Select
                value={lessonsPerModule}
                onValueChange={setLessonsPerModule}
              >
                <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                  <div className="flex items-center gap-2">
                    <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M13.3483 1.00069C13.3461 1.00099 13.3439 1.00131 13.3418 1.00164H7.02321C6.18813 1.00164 5.5 1.68603 5.5 2.52111V15.7169C5.5 16.552 6.18813 17.2401 7.02321 17.2401H15.9777C16.8128 17.2401 17.5 16.552 17.5 15.7169V5.12632C17.4992 5.11946 17.4982 5.11261 17.4971 5.10578C17.496 5.0788 17.4925 5.05197 17.4869 5.02557C17.4843 5.01269 17.4812 4.99993 17.4775 4.98732C17.4678 4.95493 17.4547 4.92366 17.4384 4.89404C17.436 4.88997 17.4335 4.88594 17.4309 4.88194C17.4109 4.84801 17.3868 4.81669 17.3591 4.78868L13.7139 1.13966C13.6869 1.11319 13.6568 1.09002 13.6243 1.07064C13.6182 1.06707 13.612 1.06364 13.6057 1.06035C13.5272 1.01663 13.438 0.995976 13.3483 1.00069ZM7.02322 1.9577H12.8996V4.07974C12.8996 4.91481 13.5878 5.60294 14.4228 5.60294H16.5449V15.7169C16.5449 16.0393 16.3002 16.2849 15.9777 16.2849H7.02322C6.70078 16.2849 6.45516 16.0393 6.45516 15.7169V2.52109C6.45516 2.19865 6.70078 1.9577 7.02322 1.9577ZM13.8548 2.63395L15.8677 4.64686H14.4228C14.1004 4.64686 13.8548 4.40218 13.8548 4.07974V2.63395ZM8.30297 7.48898C8.17679 7.48923 8.05584 7.5394 7.96653 7.62853C7.87722 7.71767 7.82682 7.83852 7.82633 7.9647C7.82608 8.02749 7.83822 8.08972 7.86206 8.14781C7.88589 8.20591 7.92094 8.25873 7.96522 8.30327C8.00949 8.3478 8.06211 8.38316 8.12006 8.40733C8.17802 8.43151 8.24017 8.44401 8.30297 8.44413H14.698C14.761 8.44438 14.8235 8.43215 14.8818 8.40814C14.94 8.38414 14.993 8.34883 15.0376 8.30426C15.0821 8.25969 15.1174 8.20674 15.1414 8.14846C15.1654 8.09018 15.1777 8.02773 15.1774 7.9647C15.1772 7.90198 15.1646 7.83993 15.1404 7.78208C15.1161 7.72423 15.0808 7.67172 15.0362 7.62754C14.9917 7.58337 14.9389 7.5484 14.8809 7.52462C14.8229 7.50085 14.7607 7.48874 14.698 7.48898H8.30297ZM8.30297 10.1996C8.24017 10.1997 8.17802 10.2122 8.12006 10.2364C8.06211 10.2606 8.00949 10.2959 7.96521 10.3405C7.92094 10.385 7.88589 10.4378 7.86206 10.4959C7.83822 10.554 7.82608 10.6162 7.82633 10.679C7.82682 10.8052 7.87723 10.9261 7.96653 11.0152C8.05584 11.1043 8.17679 11.1545 8.30297 11.1547H14.698C14.7607 11.155 14.8229 11.1429 14.8809 11.1191C14.9389 11.0953 14.9917 11.0604 15.0362 11.0162C15.0808 10.972 15.1161 10.9195 15.1404 10.8617C15.1646 10.8038 15.1772 10.7418 15.1774 10.679C15.1777 10.616 15.1654 10.5535 15.1414 10.4953C15.1174 10.437 15.0821 10.384 15.0376 10.3395C14.993 10.2949 14.94 10.2596 14.8818 10.2356C14.8235 10.2116 14.761 10.1993 14.698 10.1996H8.30297ZM8.30297 12.9111C8.24017 12.9113 8.17802 12.9238 8.12006 12.9479C8.06211 12.9721 8.00949 13.0075 7.96521 13.052C7.92094 13.0965 7.88589 13.1494 7.86206 13.2075C7.83822 13.2656 7.82608 13.3278 7.82633 13.3906C7.82682 13.5168 7.87723 13.6376 7.96653 13.7267C8.05584 13.8159 8.17679 13.866 8.30297 13.8663H14.698C14.7607 13.8665 14.8229 13.8544 14.8809 13.8307C14.9389 13.8069 14.9917 13.7719 15.0362 13.7277C15.0808 13.6836 15.1161 13.631 15.1404 13.5732C15.1646 13.5154 15.1772 13.4533 15.1774 13.3906C15.1777 13.3275 15.1654 13.2651 15.1414 13.2068C15.1174 13.1485 15.0821 13.0956 15.0376 13.051C14.993 13.0064 14.94 12.9711 14.8818 12.9471C14.8235 12.9231 14.761 12.9109 14.698 12.9111H8.30297Z" fill="black"/>
                    </svg>
                    <span className="text-[#09090B] opacity-50">{t('interface.generate.lessonsPerModule', 'Lessons per module')}:</span>
                    <span className="text-[#09090B]">{lessonsPerModule}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="border-white max-h-[200px]" sideOffset={15} align="center">
                  {["1 - 2", "3 - 4", "5 - 7", "8 - 10"].map((rng) => (
                    <SelectItem key={rng} value={rng} className="px-2">{rng}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Divider */}
            <div className="w-px h-6 bg-[#E0E0E0] mx-4"></div>
            
            {/* Language dropdown */}
            <div className="flex-1 flex items-center justify-center">
              <Select
                value={language}
                onValueChange={setLanguage}
              >
                <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                  <div className="flex items-center gap-2">
                    <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.1562 5.46446V4.59174C17.1562 3.69256 16.4421 2.97851 15.543 2.97851H9.6719L9.59256 2.76694C9.40744 2.29091 8.95785 2 8.45537 2H3.11322C2.21405 2 1.5 2.71405 1.5 3.61322V13.9008C1.5 14.8 2.21405 15.514 3.11322 15.514H15.8868C16.786 15.514 17.5 14.8 17.5 13.9008V6.2843C17.5 5.96694 17.3678 5.67603 17.1562 5.46446ZM15.543 4.14215C15.781 4.14215 15.9661 4.32727 15.9661 4.56529V5.06777H10.5182L10.1479 4.14215H15.543ZM16.3099 13.9008C16.3099 14.1388 16.1248 14.324 15.8868 14.324H3.11322C2.87521 14.324 2.69008 14.1388 2.69008 13.9008V3.58678C2.69008 3.34876 2.87521 3.16364 3.11322 3.16364L8.48182 3.19008L9.56612 5.8876C9.64545 6.12562 9.88347 6.25785 10.1215 6.25785H16.2835C16.2835 6.25785 16.3099 6.25785 16.3099 6.2843V13.9008Z" fill="black"/>
                    </svg>
                    <span className="text-[#09090B] opacity-50">{t('interface.language', 'Language')}:</span>
                    <span className="text-[#09090B]">{language === 'en' ? 'English' : language === 'uk' ? 'Ukrainian' : language === 'es' ? 'Spanish' : 'Russian'}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="border-white" sideOffset={15}>
                  <SelectItem value="en">{t('interface.generate.english', 'English')}</SelectItem>
                  <SelectItem value="uk">{t('interface.generate.ukrainian', 'Ukrainian')}</SelectItem>
                  <SelectItem value="es">{t('interface.generate.spanish', 'Spanish')}</SelectItem>
                  <SelectItem value="ru">{t('interface.generate.russian', 'Russian')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Prompt textarea with regenerate button */}
        <div className="flex gap-2 items-start">
          <div className="relative group flex-1">
            <Textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('interface.courseOutline.describeWhatToMake', "Describe what you'd like to make")}
              rows={1}
              className="w-full px-7 py-5 rounded-lg bg-white text-lg text-black resize-none overflow-hidden min-h-[56px] border-none focus:border-blue-300 focus:outline-none transition-all duration-200 placeholder-gray-400 hover:shadow-lg cursor-pointer"
              style={{ background: "rgba(255,255,255,0.95)" }}
            />
            <Edit 
              size={16} 
              className="absolute top-[23px] right-7 text-gray-400 pointer-events-none flex items-center justify-center" 
            />
          </div>
          {lastPreviewParamsRef.current && lastPreviewParamsRef.current.prompt !== prompt && (
            <Button
              type="button"
              onClick={() => {
                // Force regeneration by clearing lastPreviewParamsRef
                lastPreviewParamsRef.current = null;
              }}
              variant="secondary"
              className="px-4 rounded-md bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 active:scale-95 transition-transform flex items-center gap-2 whitespace-nowrap min-h-[56px]"
            >
              <Sparkles size={16} />
              <span>{t('interface.courseOutline.regenerate', 'Regenerate')}</span>
            </Button>
          )}
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#20355D]">{t('interface.courseOutline.modulesAndLessons', 'Modules & Lessons')}</h2>
            {hasUserEdits && (
              <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                <span>✓</span>
                <span>{t('interface.courseOutline.editsProtected', 'Edits protected')}</span>
              </div>
            )}
          </div>
          {loading && <LoadingAnimation message={thoughts[thoughtIdx]} />}
          {error && <p className="text-red-600">{error}</p>}
          {preview.length > 0 && (
            <div
              className="bg-white rounded-xl p-6 flex flex-col gap-6 relative"
              style={{ animation: 'fadeInDown 0.25s ease-out both' }}
            >
              {loadingPreview && (
                <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
                  <LoadingAnimation message={t('interface.courseOutline.applyingEdit', 'Applying edit...')} />
                </div>
              )}
              {preview.map((mod: ModulePreview, modIdx: number) => (
                <div key={mod.id} className="flex bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {/* Left numbered section */}
                  <div className="flex items-start justify-center pt-5 w-16 bg-gradient-to-b from-blue-100 to-blue-50 text-gray-700 font-semibold text-base select-none flex-shrink-0">
                    {modIdx + 1}
                  </div>

                  {/* Main content section */}
                  <div className="flex-1 p-4">
                    {/* Module title */}
                    <div className="mb-2">
                      <div className="relative group">
                        <Input
                          type="text"
                          value={mod.title}
                          onChange={(e) => handleModuleChange(modIdx, e.target.value)}
                          data-modtitle={modIdx}
                          className="text-[#20355D] text-base font-semibold cursor-pointer border-transparent focus-visible:border-transparent shadow-none"
                          placeholder={`${t('interface.courseOutline.moduleTitle', 'Module')} ${modIdx + 1} ${t('interface.courseOutline.title', 'title')}`}
                        />
                        {mod.title && (
                          <Edit 
                            size={16} 
                            className="absolute top-[10px] right-[12px] text-gray-400 opacity-100 transition-opacity duration-200 pointer-events-none"
                          />
                        )}
                      </div>
                    </div>

                    {/* Lessons list */}
                    <ul className="flex flex-col gap-1 text-gray-900">
                      {mod.lessons.map((les: string, lessonIdx: number) => {
                         const lines = les.split(/\r?\n/);
                         // Preserve user-typed spacing by avoiding automatic trim.
                         let first = lines[0] || "";
                         let titleLine: string;
                         if (first.trim() === "*" || first.trim() === "-" || first.trim() === "") {
                           titleLine = (lines[1] || "").trim();
                         } else {
                           // Remove only the leading bullet + space if present, keep trailing spaces intact.
                           titleLine = first.replace(/^\s*[\*\-]\s*/, "");
                         }
                         return (
                           <li key={lessonIdx} className="flex items-center gap-2 py-0.5">
                             <span className="text-lg leading-none select-none mt-0.5">•</span>
                             <div className="relative group flex-grow">
                               <Input
                                 type="text"
                                 value={titleLine}
                                 onChange={(e) => handleLessonTitleChange(modIdx, lessonIdx, e.target.value)}
                                 onKeyDown={(e) => handleLessonTitleKeyDown(modIdx, lessonIdx, e)}
                                 data-mod={modIdx}
                                 data-les={lessonIdx}
                                 className="w-full bg-transparent border-none shadow-none text-sm text-gray-700 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 cursor-pointer pr-6"
                                 placeholder={`${t('interface.courseOutline.lessonTitle', 'Lesson')} ${lessonIdx + 1}`}
                               />
                               {titleLine && (
                                 <Edit 
                                   size={16} 
                                   className="absolute top-[10px] right-[12px] text-gray-400 opacity-0 group-hover:opacity-100 group-focus-within:opacity-0 transition-opacity duration-200 pointer-events-none"
                                 />
                               )}
                             </div>
                           </li>
                         );
                       })}
                    </ul>
                  </div>
                </div>
              ))}
              {/* Add-module button – pill style, full-width */}
              <Button
                type="button"
                onClick={handleAddModule}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-full border border-[#D5DDF8] text-[#20355D] py-3 font-medium bg-[#F0F0FF] hover:bg-[#F0F4FF] active:scale-95 transition"
              >
                <Plus size={18} />
                <span>{t('interface.courseOutline.addModule', 'Add Module')}</span>
              </Button>
              {/* Status row – identical style mock */}
              <div className="mt-3 flex items-center justify-between text-sm text-[#858587]">
                <span className="select-none">{preview.reduce((sum, m) => sum + m.lessons.length, 0)} {t('interface.courseOutline.lessonsTotal', 'lessons total')}</span>
                <div className="flex-1 flex justify-center">
                  <span className="flex items-center gap-1 select-none">
                    {t('interface.courseOutline.pressEnterToSplit', 'Press')} <span className="border px-2 py-0.5 rounded bg-gray-100 text-xs font-mono">⏎</span> {t('interface.courseOutline.toSplitLessons', 'to split lessons')}
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <RadialProgress progress={charCount / 50000} theme={selectedTheme} />
                  {charCount}/50000
                </span>
              </div>
            </div>
          )}

          {!loading && preview.length === 1 && preview[0].lessons.length === 0 && rawOutline && (
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 border rounded">
              {rawOutline}
            </pre>
          )}
        </section>

        {/* Inline Advanced section & button */}
        {!loading && preview.length > 0 && (
          <>
            {showAdvanced && (
              <div className="w-full bg-white rounded-xl p-4 flex flex-col gap-3 mb-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
                <Textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder={t('interface.courseOutline.describeImprovements', "Describe what you'd like to improve...")}
                  className="w-full px-7 py-5 rounded-lg bg-white text-lg text-black resize-none overflow-hidden min-h-[80px] border-gray-100 focus:border-blue-300 focus:outline-none focus:ring-0 transition-all duration-200 placeholder-gray-400 hover:shadow-lg cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.95)" }}
                />

                {/* Example prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                  {outlineExamples.map((ex) => (
                    <button
                      key={ex.short}
                      type="button"
                      onClick={() => toggleExample(ex)}
                      className={`relative text-left rounded-md px-4 py-3 text-sm w-full cursor-pointer transition-all duration-200 ${
                        selectedExamples.includes(ex.short)
                          ? 'bg-[#B8D4F0]'
                          : 'bg-[#D9ECFF] hover:shadow-lg'
                      }`}
                    >
                      {ex.short}
                      <Plus size={14} className="absolute right-2 top-2 text-gray-600 opacity-60" />
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    disabled={loadingPreview || !editPrompt.trim()}
                    onClick={handleApplyEdit}
                    className="flex items-center gap-2 px-[25px] py-[14px] rounded-full text-white font-medium text-sm leading-[140%] tracking-[0.05em] select-none transition-shadow hover:shadow-lg disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(90deg, #0F58F9 55.31%, #1023A1 100%)',
                      fontWeight: 500
                    }}
                  >
                    {loadingPreview ? <LoadingAnimation message="Applying..." /> : 'Edit'}
                  </Button>
                </div>
              </div>
            )}
            <div className="w-full flex justify-center mt-2 mb-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((prev) => !prev)}
                  className="flex items-center gap-2 px-[25px] py-[14px] rounded-full text-white font-medium text-sm leading-[140%] tracking-[0.05em] select-none transition-shadow hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(90deg, #0F58F9 55.31%, #1023A1 100%)',
                    fontWeight: 500
                  }}
                >
                  <Sparkles size={16} />
                  Smart Edit
                </button>
            </div>
          </>
        )}

        {!loading && preview.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-[#20355D]">{t('interface.generate.setupContentBuilder', 'Set up your Contentbuilder')}</h2>
            <div className="bg-white rounded-xl px-6 pt-5 pb-6 flex flex-col gap-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-[#20355D]">{t('interface.generate.themes', 'Themes')}</h2>
                  <p className="mt-1 text-[#858587] font-medium text-sm">{t('interface.generate.themesDescription', 'Use one of our popular themes below or browse others')}</p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-[#20355D] hover:opacity-80 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-palette-icon lucide-palette w-4 h-4"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" /><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /></svg>
                  <span>{t('interface.generate.viewMore', 'View more')}</span>
                </button>
              </div>

              <div className="flex flex-col gap-5">
                {/* Themes grid */}
                <div className="grid grid-cols-3 gap-5 justify-items-center">
                  {themeOptions.map((theme) => {
                    const isSelected = selectedTheme === theme.id;

                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`flex flex-col rounded-lg overflow-hidden border border-gray-100 transition-all p-2 gap-2 ${isSelected
                          ? 'bg-[#cee2fd]'
                          : 'hover:shadow-lg'
                          }`}
                      >
                        <div className="w-[214px] h-[116px] flex items-center justify-center">
                          {(() => {
                            const Svg = ThemeSvgs[theme.id as keyof typeof ThemeSvgs] || ThemeSvgs.default;
                            return <Svg />;
                          })()}
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
                  <p className="text-sm text-[#858587] font-medium">{t('interface.generate.adjustPresentationStyles', 'Adjust text and image styles for your presentation')}</p>

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
                    <Select value={imageSource} onValueChange={setImageSource}>
                      <SelectTrigger className="w-full px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-300" side="top">
                        <SelectItem value="ai">{t('interface.generate.aiImages', 'AI images')}</SelectItem>
                        <SelectItem value="stock">{t('interface.generate.stockImages', 'Stock images')}</SelectItem>
                        <SelectItem value="none">{t('interface.generate.noImages', 'No images')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-800 select-none">{t('interface.generate.aiImageModel', 'AI image model')}</label>
                    <Select value={aiModel} onValueChange={setAiModel}>
                      <SelectTrigger className="w-full px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-300" side="top">
                        <SelectItem value="flux-fast">{t('interface.generate.fluxFast', 'Flux Kontext Fast')}</SelectItem>
                        <SelectItem value="flux-quality">{t('interface.generate.fluxQuality', 'Flux Kontext HQ')}</SelectItem>
                        <SelectItem value="stable">{t('interface.generate.stableDiffusion', 'Stable Diffusion 2.1')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div> {/* end inner wrapper */}

      {/* Full-width generate footer bar */}
      {!loading && preview.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-300 py-4 px-6 flex items-center justify-between">
          {/* Credits required */}
          <div className="flex items-center gap-2 text-base font-medium text-[#20355D] select-none">
            {/* custom stacked-coins svg */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 10.5C14 11.8807 11.7614 13 9 13C6.23858 13 4 11.8807 4 10.5M14 10.5C14 9.11929 11.7614 8 9 8C6.23858 8 4 9.11929 4 10.5M14 10.5V14.5M4 10.5V14.5M20 5.5C20 4.11929 17.7614 3 15 3C13.0209 3 11.3104 3.57493 10.5 4.40897M20 5.5C20 6.42535 18.9945 7.23328 17.5 7.66554M20 5.5V14C20 14.7403 18.9945 15.3866 17.5 15.7324M20 10C20 10.7567 18.9495 11.4152 17.3999 11.755M14 14.5C14 15.8807 11.7614 17 9 17C6.23858 17 4 15.8807 4 14.5M14 14.5V18.5C14 19.8807 11.7614 21 9 21C6.23858 21 4 19.8807 4 18.5V14.5" stroke="#20355D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{creditsRequired} {t('interface.courseOutline.credits', 'credits')}</span>
          </div>

          {/* Lessons total + generate */}
          <div className="flex items-center gap-[7.5rem]">
            <span className="text-lg text-gray-700 font-medium select-none">
              {lessonsTotal} {t('interface.courseOutline.lessonsTotal', 'lessons total')}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGenerateFinal}
                className={`px-24 py-3 rounded-full ${currentTheme.accentBg} text-white text-lg font-semibold ${currentTheme.accentBgHover} active:scale-95 shadow-lg transition-transform disabled:opacity-50 flex items-center justify-center gap-2`}
                disabled={loading || isGenerating}
              >
                <Sparkles size={18} />
                <span className="select-none font-semibold">{t('interface.courseOutline.generate', 'Generate')}</span>
              </button>
            </div>
          </div>

          {/* Help button (disabled) */}
          <Button
            type="button"
            disabled
            variant="outline"
            size="sm"
            className="w-9 h-9 bg-white rounded-full border-[0.5px] border-[#63A2FF] text-[#000d4e] flex items-center justify-center opacity-60 cursor-not-allowed select-none font-bold"
            aria-label={t('interface.courseOutline.helpComingSoon', 'Help (coming soon)')}
          >
            ?
          </Button>
        </div>
      )}
    </main>
    <style jsx global>{`
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    {/* Make cursor a pointer (hand) over all obvious clickable elements */}
    <style jsx global>{`
      button,
      select,
      input[type="checkbox"],
      label[role="button"],
      label[for] {
        cursor: pointer;
      }
    `}</style>
    {isGenerating && (
      <div className="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-50">
        <LoadingAnimation message={t('interface.courseOutline.finalizingProduct', 'Finalizing product...')} />
      </div>
    )}
    </>
  );
} 