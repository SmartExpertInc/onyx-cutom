"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import { generatePromptId } from "../../utils/promptUtils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CustomCard } from "@/components/ui/custom-card";
import { GenerateCard } from "@/components/ui/generate-card";
import { CustomPillSelector, CustomMultiSelector } from "@/components/ui/select";

export default function PasteTextPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"context" | "base" | null>(null);
  
  // Product selection and configuration
  const [activeProduct, setActiveProduct] = useState<"Course" | "Video Lesson" | "Presentation" | "Quiz" | "One-Pager">("Course");
  
  // Course configuration
  const [modulesCount, setModulesCount] = useState(4);
  const [lessonsPerModule, setLessonsPerModule] = useState(`3-4 ${t('interface.generate.perModule', 'per module')}`);
  const [language, setLanguage] = useState(t('interface.english', 'English'));
  
  // Video Lesson configuration
  const [slidesCount, setSlidesCount] = useState(10);
  
  // Quiz configuration
  const [quizLanguage, setQuizLanguage] = useState(t('interface.english', 'English'));
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(["multiple-choice"]);
  const [quizQuestionCount, setQuizQuestionCount] = useState(10);
  
  // Additional configuration for video lesson and presentation
  const [lengthOption, setLengthOption] = useState<"Short" | "Medium" | "Long">("Short");
  
  // One-Pager (Text Presentation) configuration
  const [textLength, setTextLength] = useState<string>(t('interface.generate.medium', 'medium'));
  const [textStyles, setTextStyles] = useState<string[]>(["headlines", "paragraphs", "bullet_lists", "numbered_lists", "alerts", "recommendations", "section_breaks", "icons", "important_sections"]);
  
  // Text size thresholds (matching backend)
  const TEXT_SIZE_THRESHOLD = 1500;
  const LARGE_TEXT_THRESHOLD = 3000;
  
  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";
  
  const getTextSizeWarning = () => {
    const length = text.length;
    if (length > LARGE_TEXT_THRESHOLD) {
      return {
        type: "warning",
        message: t('interface.pasteText.textVeryLarge', 'Text is very large and will be processed as a file. This may take a while.'),
        color: "text-orange-600"
      };
    } else if (length > TEXT_SIZE_THRESHOLD) {
      return {
        type: "info",
        message: t('interface.pasteText.textLarge', 'Text is large and will be compressed for optimal processing.'),
        color: "text-blue-600"
      };
    }
    return null;
  };
  
  const warning = getTextSizeWarning();

  // Helper function to map language to ISO code
  const mapLanguageToCode = (label: string): string => {
    const l = (label || '').toLowerCase();
    if (l.startsWith('en')) return 'en';
    if (l.startsWith('uk')) return 'uk';
    if (l.startsWith('es') || l.startsWith('sp')) return 'es';
    if (l.startsWith('ru')) return 'ru';
    return 'en';
  };

  // Helper function for length range
  const lengthRangeForOption = (opt: string) => {
    switch (opt) {
      case "Short":
        return "300-400 words";
      case "Medium":
        return "600-800 words";
      case "Long":
        return "1000-1500 words";
      default:
        return "300-400 words";
    }
  };

  // Handler for Course generation
  const handleCourseOutlineStart = async () => {
    if (!text.trim() || !mode) return;

    // Store text in sessionStorage
    const textData = {
      text: text.trim(),
      mode: mode,
      timestamp: Date.now()
    };
    sessionStorage.setItem('pastedTextData', JSON.stringify(textData));

    let chatId: string | undefined;
    try {
      const res = await fetch(`${CUSTOM_BACKEND_URL}/course-outline/init-chat`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        chatId = data.chatSessionId;
      }
    } catch (_) {
      /* ignore warm-up failure – preview will fallback to creating chat */
    }

    const finalPrompt = mode === 'context' 
      ? "Create educational content using the provided text as context"
      : "Create educational content based on the provided text structure";

    // Store prompt in sessionStorage if it's long
    let promptReference = finalPrompt;
    if (finalPrompt.length > 500) {
      const promptId = generatePromptId();
      sessionStorage.setItem(promptId, finalPrompt);
      promptReference = promptId;
    }

    const params = new URLSearchParams({
      prompt: promptReference,
      modules: String(modulesCount),
      lessons: lessonsPerModule,
      lang: mapLanguageToCode(language),
      knowledgeCheck: '1',
      contentAvailability: '1',
      informationSource: '1',
      time: '1',
      fromText: 'true',
      textMode: mode,
    });
    if (chatId) params.set("chatId", chatId);

    router.push(`/create/course-outline?${params.toString()}`);
  };

  // Handler for Video Lesson generation
  const handleVideoLessonStart = () => {
    if (!text.trim() || !mode) return;

    // Store text in sessionStorage
    const textData = {
      text: text.trim(),
      mode: mode,
      timestamp: Date.now()
    };
    sessionStorage.setItem('pastedTextData', JSON.stringify(textData));

    const finalPrompt = mode === 'context' 
      ? "Create video lesson content using the provided text as context"
      : "Create video lesson content based on the provided text structure";

    // Store prompt in sessionStorage if it's long
    let promptReference = finalPrompt;
    if (finalPrompt.length > 500) {
      const promptId = generatePromptId();
      sessionStorage.setItem(promptId, finalPrompt);
      promptReference = promptId;
    }

    const params = new URLSearchParams();
    params.set("productType", "video_lesson_presentation");
    params.set("length", lengthRangeForOption(lengthOption));
    params.set("slidesCount", String(slidesCount));
    params.set("lang", mapLanguageToCode(language));
    params.set("prompt", promptReference);
    params.set("fromText", "true");
    params.set("textMode", mode);

    router.push(`/create/lesson-presentation?${params.toString()}`);
  };

  // Handler for Presentation generation
  const handleSlideDeckStart = () => {
    if (!text.trim() || !mode) return;

    // Store text in sessionStorage
    const textData = {
      text: text.trim(),
      mode: mode,
      timestamp: Date.now()
    };
    sessionStorage.setItem('pastedTextData', JSON.stringify(textData));

    const finalPrompt = mode === 'context' 
      ? "Create lesson content using the provided text as context"
      : "Create lesson content based on the provided text structure";

    // Store prompt in sessionStorage if it's long
    let promptReference = finalPrompt;
    if (finalPrompt.length > 500) {
      const promptId = generatePromptId();
      sessionStorage.setItem(promptId, finalPrompt);
      promptReference = promptId;
    }

    const params = new URLSearchParams();
    params.set("length", lengthRangeForOption(lengthOption));
    params.set("slidesCount", String(slidesCount));
    params.set("lang", mapLanguageToCode(language));
    params.set("prompt", promptReference);
    params.set("fromText", "true");
    params.set("textMode", mode);

    router.push(`/create/lesson-presentation?${params.toString()}`);
  };

  // Handler for Quiz generation
  const handleQuizStart = () => {
    if (!text.trim() || !mode) return;

    // Store text in sessionStorage
    const textData = {
      text: text.trim(),
      mode: mode,
      timestamp: Date.now()
    };
    sessionStorage.setItem('pastedTextData', JSON.stringify(textData));

    const finalPrompt = mode === 'context' 
      ? "Create quiz content using the provided text as context"
      : "Create quiz content based on the provided text structure";

    // Store prompt in sessionStorage if it's long
    let promptReference = finalPrompt;
    if (finalPrompt.length > 500) {
      const promptId = generatePromptId();
      sessionStorage.setItem(promptId, finalPrompt);
      promptReference = promptId;
    }

    const params = new URLSearchParams();
    params.set("questionTypes", selectedQuestionTypes.join(','));
    params.set("questionCount", String(quizQuestionCount));
    params.set("lang", mapLanguageToCode(quizLanguage));
    params.set("prompt", promptReference);
    params.set("fromText", "true");
    params.set("textMode", mode);

    router.push(`/create/quiz?${params.toString()}`);
  };

  // Handler for One-Pager (Text Presentation) generation
  const handleTextPresentationStart = () => {
    if (!text.trim() || !mode) return;

    // Store text in sessionStorage
    const textData = {
      text: text.trim(),
      mode: mode,
      timestamp: Date.now()
    };
    sessionStorage.setItem('pastedTextData', JSON.stringify(textData));

    const finalPrompt = mode === 'context' 
      ? "Create text presentation content using the provided text as context"
      : "Create text presentation content based on the provided text structure";

    // Store prompt in sessionStorage if it's long
    let promptReference = finalPrompt;
    if (finalPrompt.length > 500) {
      const promptId = generatePromptId();
      sessionStorage.setItem(promptId, finalPrompt);
      promptReference = promptId;
    }

    const params = new URLSearchParams();
    params.set("lang", mapLanguageToCode(language));
    params.set("length", textLength);
    params.set("styles", textStyles.join(','));
    params.set("prompt", promptReference);
    params.set("fromText", "true");
    params.set("textMode", mode);

    router.push(`/create/text-presentation?${params.toString()}`);
  };

  // Main generate handler
  const handleGenerate = () => {
    switch (activeProduct) {
      case "Course":
        handleCourseOutlineStart();
        break;
      case "Video Lesson":
        handleVideoLessonStart();
        break;
      case "Presentation":
        handleSlideDeckStart();
        break;
      case "Quiz":
        handleQuizStart();
        break;
      case "One-Pager":
        handleTextPresentationStart();
        break;
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center pt-24 pb-20 px-6 bg-white relative overflow-hidden"
    >
      {/* Decorative gradient background */}
      <div 
        className="absolute pointer-events-none z-0"
        style={{
          width: '1100px',
          height: '2100px',
          left: '50%',
          top: '50%',
          borderRadius: '999px',
          background: 'linear-gradient(180deg, #90EDE5 10%, #5D72F4 70%, #D817FF 100%)',
          transform: 'translate(-50%, -50%) rotate(120deg)',
          filter: 'blur(100px)',
        }}
      />

      {/* back button absolute top-left */}
      <Link
        href="/create"
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
      <div className="w-full max-w-4xl flex flex-col gap-8 items-center relative z-10">
        {/* Headings */}
        <div className="w-full flex flex-col gap-3 items-center">
          <h1 className="sora-font-semibold text-5xl text-center tracking-wide text-[#FFFFFF] mt-8">
            {t('interface.pasteText.title', 'Paste Your Text')}
          </h1>
          <p className="text-center text-[#FAFAFA] text-lg -mt-1">
            {t('interface.pasteText.subtitle', 'Enter or paste your text content below and choose how you\'d like to use it')}
          </p>
        </div>

        {/* Product selector */}
        <div 
          className="w-fit rounded-lg p-4 shadow-md hover:shadow-xl transition-shadow duration-200"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.5))'
          }}
        >
          <div className="flex flex-wrap justify-center gap-4">
          <GenerateCard
            label={t('interface.generate.courseOutline', 'Course')}
            pillLabel="Popular"
            svg={
              <svg width="35" height="35" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity={activeProduct === "Course" ? "1" : "0.5"} d="M37.2307 9.11511H35.0879V4.97055C35.0879 4.28592 34.817 3.62934 34.3347 3.14523C33.8525 2.66113 33.1984 2.38916 32.5165 2.38916H30.0307C30.0906 2.12521 30.0748 1.84965 29.9852 1.59432C29.8956 1.339 29.7359 1.11435 29.5244 0.94634C29.313 0.778333 29.0585 0.673833 28.7904 0.644922C28.5223 0.616011 28.2515 0.66387 28.0093 0.782965L20.0879 4.4471L12.1665 0.782965C11.9243 0.66387 11.6535 0.616011 11.3854 0.644922C11.1173 0.673833 10.8628 0.778333 10.6513 0.94634C10.4399 1.11435 10.2802 1.339 10.1906 1.59432C10.101 1.84965 10.0852 2.12521 10.145 2.38916H7.65932C6.97733 2.38916 6.32328 2.66113 5.84104 3.14523C5.35881 3.62934 5.08789 4.28592 5.08789 4.97055V9.11511H2.94503C2.18727 9.11511 1.46055 9.41729 0.924728 9.95519C0.38891 10.4931 0.0878906 11.2226 0.0878906 11.9833V32.5699C0.0878906 33.3306 0.38891 34.0601 0.924728 34.598C1.46055 35.1359 2.18727 35.4381 2.94503 35.4381H11.7165L10.3522 37.1447C10.1006 37.4615 9.94328 37.8431 9.89829 38.2458C9.85331 38.6484 9.92249 39.0556 10.0979 39.4204C10.2733 39.7853 10.5477 40.0931 10.8897 40.3082C11.2316 40.5234 11.6272 40.6373 12.0307 40.6367H28.145C28.5486 40.6373 28.9441 40.5234 29.2861 40.3082C29.628 40.0931 29.9025 39.7853 30.0779 39.4204C30.2533 39.0556 30.3225 38.6484 30.2775 38.2458C30.2325 37.8431 30.0752 37.4615 29.8236 37.1447L28.4593 35.4166H37.2307C37.9885 35.4166 38.7152 35.1144 39.2511 34.5765C39.7869 34.0386 40.0879 33.3091 40.0879 32.5484V11.9833C40.0879 11.2226 39.7869 10.4931 39.2511 9.95519C38.7152 9.41729 37.9885 9.11511 37.2307 9.11511ZM28.6022 2.088V18.91C28.6025 19.0223 28.5711 19.1324 28.5117 19.2276C28.4523 19.3228 28.3673 19.3991 28.2665 19.4478L20.8022 22.8968V5.6876L28.6022 2.088ZM11.5736 2.088L19.3736 5.67326V22.8825L11.9093 19.4478C11.8085 19.3991 11.7235 19.3228 11.6641 19.2276C11.6047 19.1324 11.5733 19.0223 11.5736 18.91V2.088ZM2.94503 10.5492H5.08789V22.1511C5.08789 22.8357 5.35881 23.4923 5.84104 23.9764C6.32328 24.4605 6.97733 24.7325 7.65932 24.7325H32.5165C33.1984 24.7325 33.8525 24.4605 34.3347 23.9764C34.817 23.4923 35.0879 22.8357 35.0879 22.1511V10.5492H37.2307C37.6096 10.5492 37.973 10.7003 38.2409 10.9693C38.5088 11.2382 38.6593 11.603 38.6593 11.9833V28.6333H1.51646V11.9833C1.51646 11.603 1.66697 11.2382 1.93488 10.9693C2.20279 10.7003 2.56615 10.5492 2.94503 10.5492ZM22.2307 32.7778H17.945C17.7556 32.7778 17.5739 32.7023 17.44 32.5678C17.306 32.4333 17.2307 32.2509 17.2307 32.0608C17.2307 31.8706 17.306 31.6882 17.44 31.5537C17.5739 31.4193 17.7556 31.3437 17.945 31.3437H22.2307C22.3922 31.3766 22.5374 31.4646 22.6417 31.5926C22.7459 31.7207 22.8029 31.881 22.8029 32.0464C22.8029 32.2118 22.7459 32.3722 22.6417 32.5002C22.5374 32.6283 22.3922 32.7162 22.2307 32.7491V32.7778ZM28.7022 38.084C28.7852 38.1895 28.837 38.3163 28.8517 38.4499C28.8664 38.5835 28.8434 38.7185 28.7853 38.8397C28.7272 38.9608 28.6364 39.0631 28.5232 39.1348C28.41 39.2066 28.2789 39.245 28.145 39.2456H12.0307C11.8968 39.245 11.7658 39.2066 11.6526 39.1348C11.5394 39.0631 11.4485 38.9608 11.3905 38.8397C11.3324 38.7185 11.3094 38.5835 11.3241 38.4499C11.3388 38.3163 11.3906 38.1895 11.4736 38.084L13.545 35.4668H26.6307L28.7022 38.084Z" fill="#0F58F9"/>
              </svg>
            }
            active={activeProduct === "Course"}
            onClick={() => setActiveProduct("Course")}
          />
          <GenerateCard 
            label={t('interface.generate.videoLesson', 'Video Lesson')} 
            svg={
              <svg width="35" height="31" viewBox="0 0 41 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity={activeProduct === "Video Lesson" ? "1" : "0.5"} d="M35.3302 19.4095C33.3514 20.85 30.9621 21.6215 28.5118 21.611C24.1105 21.5492 18.829 17.8982 18.7918 14.8427L0.102192 14.9068L0.159369 32.6897C0.164554 33.7399 0.5873 34.7451 1.33491 35.485C2.08251 36.2249 3.09395 36.6391 4.14744 36.6367C32.8358 36.5441C33.8904 36.5404 34.9004 36.1197 35.6442 35.3743C36.3879 34.629 36.8044 33.6199 36.8024 32.5686L36.7524 18.3052C36.2991 18.6992 35.8243 19.0678 35.3302 19.4095Z" fill="#D817FF"/>
              </svg>
            }
            active={activeProduct === "Video Lesson"}
            onClick={() => setActiveProduct("Video Lesson")}
          />
          <GenerateCard 
            label={t('interface.generate.quiz', 'Quiz')} 
            svg={
              <svg width="35" height="32" viewBox="0 0 41 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity={activeProduct === "Quiz" ? "1" : "0.5"} d="M27.3382 4.83176H11.3023C10.3552 4.8321 9.44699 5.20505 8.77728 5.86863C8.10758 6.53222 7.73119 7.43214 7.73085 8.37059V34.0979C7.7324 35.036 8.10918 35.9352 8.77863 36.5985C9.44807 37.2618 10.3556 37.6352 11.3023 37.6367H27.3382C28.285 37.6352 29.1925 37.2618 29.8619 36.5985C30.5314 35.9352 30.9082 35.036 30.9097 34.0979V8.37059C30.9094 7.43214 30.533 6.53223 29.8633 5.86864C29.1936 5.20506 28.2853 4.83211 27.3382 4.83176Z" fill="#90EDE5"/>
              </svg>
            }
            active={activeProduct === "Quiz"}
            onClick={() => setActiveProduct("Quiz")}
          />
          <GenerateCard
            label={t('interface.generate.presentation', 'Presentation')}
            svg={
              <svg width="35" height="35" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity={activeProduct === "Presentation" ? "1" : "0.5"} d="M40.0879 2.07132V4.02954C40.0868 4.40968 39.9359 4.77393 39.6683 5.04272C39.4006 5.31152 39.0379 5.46302 38.6593 5.46414H1.51646C1.13792 5.46302 0.775201 5.31152 0.507532 5.04272C0.239862 4.77393 0.0889968 4.40968 0.0878907 4.02954V2.07132Z" fill="#0F58F9"/>
              </svg>
            }
            active={activeProduct === "Presentation"}
            onClick={() => setActiveProduct("Presentation")}
          />
          <GenerateCard
            label={t('interface.generate.onePager', 'One-Pager')}
            svg={
              <svg width="32" height="35" viewBox="0 0 38 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity={activeProduct === "One-Pager" ? "1" : "0.5"} d="M34.223 24.601H29.0018V4.20815C29.0014 3.26105 28.624 2.35284 27.9525 1.68314C27.281 1.01345 26.3703 0.637061 25.4206 0.636719H3.669C2.71933 0.637061 1.80867 1.01345 1.13715 1.68314C0.465639 2.35284 0.0882342 3.26105 0.0878906 4.20815V34.9224C0.0899107 36.4373 0.69423 37.8896 1.76833 38.9608C2.84244 40.032 4.29865 40.6347 5.81766 40.6367H32.3322C33.594 40.6346 34.8035 40.1332 35.6951 39.2427C36.5867 38.3521 37.0876 37.1452 37.0879 35.8867V27.4581C37.088 27.0829 37.014 26.7113 36.87 26.3646C36.7261 26.018 36.5151 25.7029 36.249 25.4376C35.983 25.1723 35.6671 24.9618 35.3195 24.8183C34.9718 24.6747 34.5993 24.6009 34.223 24.601Z" fill="#EB8BFF"/>
              </svg>
            }
            active={activeProduct === "One-Pager"}
            onClick={() => setActiveProduct("One-Pager")}
          />
          </div>
        </div>

        {/* Dropdown chips - Course */}
        {activeProduct === "Course" && (
          <div className="flex flex-wrap justify-center gap-4">
            <CustomPillSelector
              value={`${modulesCount} ${t('interface.generate.modules', 'Modules')}`}
              onValueChange={(value) => setModulesCount(Number(value.split(' ')[0]))}
              options={Array.from({ length: 10 }, (_, i) => ({
                value: `${i + 1} ${t('interface.generate.modules', 'Modules')}`,
                label: `${i + 1} ${t('interface.generate.modules', 'Modules')}`
              }))}
              label={t('interface.generate.modules', 'Modules')}
            />
            <CustomPillSelector
              value={lessonsPerModule}
              onValueChange={setLessonsPerModule}
              options={["1-2", "3-4", "5-7", "8-10"].map((rng) => ({
                value: `${rng} ${t('interface.generate.perModule', 'per module')}`,
                label: `${rng} ${t('interface.generate.perModule', 'per module')}`
              }))}
              label={t('interface.generate.lessons', 'Lessons')}
            />
            <CustomPillSelector
              value={language}
              onValueChange={setLanguage}
              options={[
                { value: t('interface.english', 'English'), label: t('interface.english', 'English') },
                { value: t('interface.ukrainian', 'Ukrainian'), label: t('interface.ukrainian', 'Ukrainian') },
                { value: t('interface.spanish', 'Spanish'), label: t('interface.spanish', 'Spanish') },
                { value: t('interface.russian', 'Russian'), label: t('interface.russian', 'Russian') }
              ]}
              label={t('interface.language', 'Language')}
            />
          </div>
        )}

        {/* Dropdown chips - Video Lesson */}
        {activeProduct === "Video Lesson" && (
          <div className="flex flex-wrap justify-center gap-4">
            <CustomPillSelector
              value={`${slidesCount} ${t('interface.generate.slides', 'slides')}`}
              onValueChange={(value) => setSlidesCount(Number(value.split(' ')[0]))}
              options={[3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((count) => ({
                value: `${count} ${t('interface.generate.slides', 'slides')}`,
                label: `${count} ${t('interface.generate.slides', 'slides')}`
              }))}
              label={t('interface.generate.slides', 'Slides')}
            />
            <CustomPillSelector
              value={language}
              onValueChange={setLanguage}
              options={[
                { value: t('interface.english', 'English'), label: t('interface.english', 'English') },
                { value: t('interface.ukrainian', 'Ukrainian'), label: t('interface.ukrainian', 'Ukrainian') },
                { value: t('interface.spanish', 'Spanish'), label: t('interface.spanish', 'Spanish') },
                { value: t('interface.russian', 'Russian'), label: t('interface.russian', 'Russian') }
              ]}
              label={t('interface.language', 'Language')}
            />
          </div>
        )}

        {/* Dropdown chips - Quiz */}
        {activeProduct === "Quiz" && (
          <div className="flex flex-wrap justify-center gap-4">
            <CustomPillSelector
              value={quizLanguage}
              onValueChange={setQuizLanguage}
              options={[
                { value: t('interface.english', 'English'), label: t('interface.english', 'English') },
                { value: t('interface.ukrainian', 'Ukrainian'), label: t('interface.ukrainian', 'Ukrainian') },
                { value: t('interface.spanish', 'Spanish'), label: t('interface.spanish', 'Spanish') },
                { value: t('interface.russian', 'Russian'), label: t('interface.russian', 'Russian') }
              ]}
              label={t('interface.language', 'Language')}
            />
            <CustomMultiSelector
              selectedValues={selectedQuestionTypes}
              onSelectionChange={setSelectedQuestionTypes}
              options={[
                { value: "multiple-choice", label: t('interface.generate.multipleChoice', 'Multiple Choice') },
                { value: "multi-select", label: t('interface.generate.multiSelect', 'Multiple Select') },
                { value: "matching", label: t('interface.generate.matching', 'Matching') },
                { value: "sorting", label: t('interface.generate.sorting', 'Sorting') },
                { value: "open-answer", label: t('interface.generate.openAnswer', 'Open Answer') }
              ]}
              label={t('interface.generate.questionTypes', 'Question Types')}
              placeholder={t('interface.generate.selectQuestionTypes', 'Select Question Types')}
            />
            <CustomPillSelector
              value={`${quizQuestionCount} ${t('interface.generate.questions', 'questions')}`}
              onValueChange={(value) => setQuizQuestionCount(Number(value.split(' ')[0]))}
              options={[5, 10, 15, 20, 25, 30].map((count) => ({
                value: `${count} ${t('interface.generate.questions', 'questions')}`,
                label: `${count} ${t('interface.generate.questions', 'questions')}`
              }))}
              label={t('interface.generate.questions', 'Questions')}
            />
          </div>
        )}

        {/* Dropdown chips - Presentation */}
        {activeProduct === "Presentation" && (
          <div className="flex flex-wrap justify-center gap-4">
            <CustomPillSelector
              value={language}
              onValueChange={setLanguage}
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
              onValueChange={(value) => setSlidesCount(Number(value.split(' ')[0]))}
              options={Array.from({ length: 14 }, (_, i) => ({
                value: `${i + 2} ${t('interface.generate.slides', 'slides')}`,
                label: `${i + 2} ${t('interface.generate.slides', 'slides')}`
              }))}
              label={t('interface.generate.slides', 'Slides')}
            />
          </div>
        )}

        {/* Dropdown chips - One-Pager */}
        {activeProduct === "One-Pager" && (
          <div className="flex flex-wrap justify-center gap-4">
            <CustomPillSelector
              value={language}
              onValueChange={setLanguage}
              options={[
                { value: t('interface.english', 'English'), label: t('interface.english', 'English') },
                { value: t('interface.ukrainian', 'Ukrainian'), label: t('interface.ukrainian', 'Ukrainian') },
                { value: t('interface.spanish', 'Spanish'), label: t('interface.spanish', 'Spanish') },
                { value: t('interface.russian', 'Russian'), label: t('interface.russian', 'Russian') }
              ]}
              label={t('interface.language', 'Language')}
            />
          </div>
        )}

        {/* Text input area */}
        <div className="w-full">
          <Textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('interface.pasteText.textPlaceholder', 'Paste your text, notes, outline, or any content you\'d like to work with...')}
            className="w-full h-40 p-6" />

          <div className="mt-2 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {t('interface.pasteText.characters', '{count} characters').replace('{count}', text.length.toString())}
            </div>
            {warning && (
              <Alert className={`${warning.type === 'warning' ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'} ${warning.color}`}>
                <AlertDescription className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {warning.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Mode selection */}
        <div className="w-full max-w-4xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            {t('interface.pasteText.howToUseText', 'How would you like to use this text?')}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomCard 
              Icon={FileText}
              title={t('interface.pasteText.useAsContext', 'Use as Context')}
              description={t('interface.pasteText.useAsContextDescription', 'The AI will use your text as reference material and context to create new educational content. Best for notes, research, or background information.')}
              selectable={true}
              isSelected={mode === "context"}
              onSelect={() => setMode("context")}
              iconColor="text-blue-600"
              labelColor="text-blue-600"
            />
            
            <CustomCard 
              Icon={Sparkles}
              title={t('interface.pasteText.useAsBase', 'Use as Base')}
              description={t('interface.pasteText.useAsBaseDescription', 'The AI will enhance and format your existing text structure, preserving your content while making it into a proper educational product. Best for drafts or existing outlines.')}
              selectable={true}
              isSelected={mode === "base"}
              onSelect={() => setMode("base")}
              iconColor="text-purple-600"
              labelColor="text-purple-600"
            />
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={!text.trim() || !mode}
          size="lg"
          className="px-8 py-3 rounded-full border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 text-lg font-semibold shadow-lg"
        >
          <Sparkles size={20} />
          {t('interface.generate.generate', 'Generate')}
        </Button>
      </div>

      {/* Feedback button */}
      <button
        className="fixed right-0 top-1/2 -translate-y-1/2 flex items-center justify-center bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-l-lg cursor-pointer group z-10"
        style={{
          width: '38px',
          height: '98px',
        }}
        onClick={() => {
          // Add your feedback handler here
          console.log('Feedback clicked');
        }}
      >
        <span
          className="font-medium opacity-50 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
          style={{
            fontSize: '14px',
            color: '#0F58F9',
            transform: 'rotate(-90deg)',
            whiteSpace: 'nowrap',
          }}
        >
          Feedback
        </span>
      </button>
    </main>
  );
}

