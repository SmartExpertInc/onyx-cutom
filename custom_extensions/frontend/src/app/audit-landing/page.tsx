"use client";

import React, { useState } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Generate Card Component
const GenerateCard = ({ svg, label, active, onClick }: any) => {
  return (
    <Card
      className="group relative rounded-lg overflow-hidden transition-all duration-200 cursor-pointer hover:scale-105 w-[140px] h-[140px]"
      style={{
        backgroundColor: active ? '#F2F8FF' : '#FFFFFF',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
      }}
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center gap-3 h-full p-4">
        {svg && (
          <div className="flex items-center justify-center">
            {svg}
          </div>
        )}
        <span 
          className="text-sm leading-tight text-center font-medium"
          style={{
            color: active ? '#0D001B' : '#797979'
          }}
        >
          {label}
        </span>
      </CardContent>
    </Card>
  );
};

const TopLeftGradient: React.FC<{ size?: number }> = () => (
    <svg width="1022" height="831" viewBox="0 0 1022 831" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_f_2048_63023)">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M-224.838 160.469C-209.989 22.5662 -41.1988 -27.181 69.3657 -110.926C155.974 -176.527 232.152 -270.831 340.762 -267.935C447.798 -265.081 518.159 -168.108 598.059 -96.8283C686.088 -18.2968 815.516 42.6285 820.977 160.469C826.507 279.811 708.526 359.291 623.066 442.774C539.156 524.742 457.61 619.272 340.762 629.574C215.837 640.588 100.395 577.425 3.86644 497.364C-104.74 407.287 -239.944 300.759 -224.838 160.469Z" fill="url(#paint0_linear_2048_63023)" fill-opacity="0.9"/>
    </g>
    <defs>
    <filter id="filter0_f_2048_63023" x="-426" y="-468" width="1447.16" height="1298.83" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
    <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_2048_63023"/>
    </filter>
    <linearGradient id="paint0_linear_2048_63023" x1="-226" y1="181.412" x2="821.164" y2="181.412" gradientUnits="userSpaceOnUse">
    <stop stop-color="#90EDE5"/>
    <stop offset="1" stop-color="#3817FF"/>
    </linearGradient>
    </defs>
    </svg>
);
const BottomRightGradient: React.FC<{ size?: number }> = () => (
    <svg width="1100" height="838" viewBox="0 0 1100 838" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_f_2048_63022)">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M683.03 104.978C827.15 50.4262 1008.19 71.5645 1122.13 175.293C1230.98 274.378 1201.67 443.12 1215.43 589.656C1227.94 722.853 1272.37 864.585 1197.26 975.305C1120.39 1088.63 976.038 1130.95 839.675 1143.57C711.631 1155.42 591.881 1109.71 482.926 1041.43C362.163 965.746 206.619 885.144 200.167 742.782C193.81 602.508 370.351 539.731 455.114 427.769C537.764 318.599 554.962 153.454 683.03 104.978Z" fill="url(#paint0_linear_2048_63022)" fill-opacity="0.9"/>
    </g>
    <defs>
    <filter id="filter0_f_2048_63022" x="0" y="-124.195" width="1439.89" height="1469.64" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
    <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_2048_63022"/>
    </filter>
    <linearGradient id="paint0_linear_2048_63022" x1="633.929" y1="102.371" x2="792.277" y2="1152.26" gradientUnits="userSpaceOnUse">
    <stop stop-color="#90EDE5"/>
    <stop offset="1" stop-color="#D817FF"/>
    </linearGradient>
    </defs>
    </svg>
);

export default function AuditLandingPage() {
  const [activeProduct, setActiveProduct] = useState("Course");

  return (
    <div 
      className="min-h-screen flex flex-col items-center relative overflow-hidden"
      style={{
        background: '#0F58F933'
      }}
    >
      {/* Top-Left Gradient Background */}
      <div className="absolute top-0 left-0 pointer-events-none opacity-70" style={{ zIndex: 0 }}>
        <TopLeftGradient />
      </div>

      {/* Bottom-Right Gradient Background */}
      <div className="absolute bottom-0 right-0 pointer-events-none opacity-70" style={{ zIndex: 0 }}>
        <BottomRightGradient />
      </div>

      {/* Header */}
      <header className="w-full px-8 py-6 flex items-center justify-between max-w-7xl relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Sparkles className="text-white" size={24} />
          <span className="text-white text-xl font-semibold">ContentBuilder</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button className="text-white flex items-center gap-1 hover:opacity-80 transition-opacity">
            Solutions
            <ChevronDown size={16} />
          </button>
          <button className="text-white flex items-center gap-1 hover:opacity-80 transition-opacity">
            Product
            <ChevronDown size={16} />
          </button>
          <button className="text-white flex items-center gap-1 hover:opacity-80 transition-opacity">
            Customers
            <ChevronDown size={16} />
          </button>
          <button className="text-white hover:opacity-80 transition-opacity">
            Enterprise
          </button>
          <button className="text-white hover:opacity-80 transition-opacity">
            Pricing
          </button>
        </nav>

        {/* Sign In Button */}
        <button 
          className="px-6 py-2 rounded-lg font-medium transition-all hover:shadow-lg"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#0F58F9',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          Sign in
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative z-10">
        {/* Headline */}
        <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6 max-w-4xl">
          From idea to live course — all in one place
        </h1>

        {/* Sub-headline */}
        <p className="text-white text-lg md:text-xl text-center mb-12 max-w-3xl opacity-90">
          Turn your concept into a ready-to-launch training program — complete with video lessons, quizzes, and LMS export — in just minutes
        </p>

        {/* Content Type Panel */}
        <div 
          className="rounded-3xl p-8 mb-8"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div className="flex flex-wrap justify-center gap-6">
            <GenerateCard
              label="Course"
              svg={
                <svg width="40" height="40" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path opacity={activeProduct === "Course" ? "1" : "0.5"} d="M37.2307 9.11511H35.0879V4.97055C35.0879 4.28592 34.817 3.62934 34.3347 3.14523C33.8525 2.66113 33.1984 2.38916 32.5165 2.38916H30.0307C30.0906 2.12521 30.0748 1.84965 29.9852 1.59432C29.8956 1.339 29.7359 1.11435 29.5244 0.94634C29.313 0.778333 29.0585 0.673833 28.7904 0.644922C28.5223 0.616011 28.2515 0.66387 28.0093 0.782965L20.0879 4.4471L12.1665 0.782965C11.9243 0.66387 11.6535 0.616011 11.3854 0.644922C11.1173 0.673833 10.8628 0.778333 10.6513 0.94634C10.4399 1.11435 10.2802 1.339 10.1906 1.59432C10.101 1.84965 10.0852 2.12521 10.145 2.38916H7.65932C6.97733 2.38916 6.32328 2.66113 5.84104 3.14523C5.35881 3.62934 5.08789 4.28592 5.08789 4.97055V9.11511H2.94503C2.18727 9.11511 1.46055 9.41729 0.924728 9.95519C0.38891 10.4931 0.0878906 11.2226 0.0878906 11.9833V32.5699C0.0878906 33.3306 0.38891 34.0601 0.924728 34.598C1.46055 35.1359 2.18727 35.4381 2.94503 35.4381H11.7165L10.3522 37.1447C10.1006 37.4615 9.94328 37.8431 9.89829 38.2458C9.85331 38.6484 9.92249 39.0556 10.0979 39.4204C10.2733 39.7853 10.5477 40.0931 10.8897 40.3082C11.2316 40.5234 11.6272 40.6373 12.0307 40.6367H28.145C28.5486 40.6373 28.9441 40.5234 29.2861 40.3082C29.628 40.0931 29.9025 39.7853 30.0779 39.4204C30.2533 39.0556 30.3225 38.6484 30.2775 38.2458C30.2325 37.8431 30.0752 37.4615 29.8236 37.1447L28.4593 35.4166H37.2307C37.9885 35.4166 38.7152 35.1144 39.2511 34.5765C39.7869 34.0386 40.0879 33.3091 40.0879 32.5484V11.9833C40.0879 11.2226 39.7869 10.4931 39.2511 9.95519C38.7152 9.41729 37.9885 9.11511 37.2307 9.11511Z" fill="#0F58F9"/>
                </svg>
              }
              active={activeProduct === "Course"}
              onClick={() => setActiveProduct("Course")}
            />

            <GenerateCard 
              label="Video Lesson"
              svg={
                <svg width="40" height="36" viewBox="0 0 41 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path opacity={activeProduct === "Video Lesson" ? "1" : "0.5"} d="M35.3302 19.4095C33.3514 20.85 30.9621 21.6215 28.5118 21.611C24.1105 21.5492 18.829 17.8982 18.7918 14.8427L0.102192 14.9068L0.159369 32.6897C0.164554 33.7399 0.5873 34.7451 1.33491 35.485C2.08251 36.2249 3.09395 36.6391 4.14744 36.6367L32.8358 36.5441C33.8904 36.5404 34.9004 36.1197 35.6442 35.3743C36.3879 34.629 36.8044 33.6199 36.8024 32.5686L36.7524 18.3052C36.2991 18.6992 35.8243 19.0678 35.3302 19.4095Z" fill="#D817FF"/>
                </svg>
              }
              active={activeProduct === "Video Lesson"}
              onClick={() => setActiveProduct("Video Lesson")}
            />

            <GenerateCard 
              label="Quiz"
              svg={
                <svg width="40" height="37" viewBox="0 0 41 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path opacity={activeProduct === "Quiz" ? "1" : "0.5"} d="M27.3382 4.83176H11.3023C10.3552 4.8321 9.44699 5.20505 8.77728 5.86863C8.10758 6.53222 7.73119 7.43214 7.73085 8.37059V34.0979C7.7324 35.036 8.10918 35.9352 8.77863 36.5985C9.44807 37.2618 10.3556 37.6352 11.3023 37.6367H27.3382C28.285 37.6352 29.1925 37.2618 29.8619 36.5985C30.5314 35.9352 30.9082 35.036 30.9097 34.0979V8.37059C30.9094 7.43214 30.533 6.53223 29.8633 5.86864C29.1936 5.20506 28.2853 4.83211 27.3382 4.83176Z" fill="#90EDE5"/>
                </svg>
              }
              active={activeProduct === "Quiz"}
              onClick={() => setActiveProduct("Quiz")}
            />

            <GenerateCard
              label="Presentation"
              svg={
                <svg width="40" height="40" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path opacity={activeProduct === "Presentation" ? "1" : "0.5"} d="M40.0879 2.07132V4.02954C40.0868 4.40968 39.9359 4.77393 39.6683 5.04272C39.4006 5.31152 39.0379 5.46302 38.6593 5.46414H1.51646C1.13792 5.46302 0.775201 5.31152 0.507532 5.04272C0.239862 4.77393 0.0889968 4.40968 0.0878907 4.02954V2.07132C0.08784 1.88291 0.124756 1.69634 0.196531 1.52226C0.268305 1.34818 0.373531 1.19001 0.506196 1.05679C0.638862 0.923564 0.796366 0.817895 0.969711 0.745818C1.14306 0.67374 1.32885 0.636668 1.51646 0.636719H38.6593C38.8469 0.636668 39.0327 0.67374 39.2061 0.745818C39.3794 0.817895 39.5369 0.923564 39.6696 1.05679C39.8022 1.19001 39.9075 1.34818 39.9793 1.52226C40.051 1.69634 40.0879 1.88291 40.0879 2.07132Z" fill="#0F58F9"/>
                </svg>
              }
              active={activeProduct === "Presentation"}
              onClick={() => setActiveProduct("Presentation")}
            />

            <GenerateCard
              label="One-Pager"
              svg={
                <svg width="37" height="40" viewBox="0 0 38 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path opacity={activeProduct === "One-Pager" ? "1" : "0.5"} d="M34.223 24.601H29.0018V4.20815C29.0014 3.26105 28.624 2.35284 27.9525 1.68314C27.281 1.01345 26.3703 0.637061 25.4206 0.636719H3.669C2.71933 0.637061 1.80867 1.01345 1.13715 1.68314C0.465639 2.35284 0.0882342 3.26105 0.0878906 4.20815V34.9224C0.0899107 36.4373 0.69423 37.8896 1.76833 38.9608C2.84244 40.032 4.29865 40.6347 5.81766 40.6367H32.3322C33.594 40.6346 34.8035 40.1332 35.6951 39.2427C36.5867 38.3521 37.0876 37.1452 37.0879 35.8867V27.4581C37.088 27.0829 37.014 26.7113 36.87 26.3646C36.7261 26.018 36.5151 25.7029 36.249 25.4376C35.983 25.1723 35.6671 24.9618 35.3195 24.8183C34.9718 24.6747 34.5993 24.6009 34.223 24.601Z" fill="#EB8BFF"/>
                </svg>
              }
              active={activeProduct === "One-Pager"}
              onClick={() => setActiveProduct("One-Pager")}
            />
          </div>
        </div>

        {/* Try for Free Button */}
        <button 
          className="px-8 py-4 rounded-xl font-semibold text-white flex items-center gap-2 transition-all hover:scale-105"
          style={{
            backgroundColor: '#0F58F9',
            boxShadow: '0 12px 40px rgba(15, 88, 249, 0.3)'
          }}
        >
          <Sparkles size={20} />
          Try for Free
        </button>
      </main>
    </div>
  );
}

