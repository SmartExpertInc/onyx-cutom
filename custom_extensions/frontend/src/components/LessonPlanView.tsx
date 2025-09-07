"use client";

import React, { useState } from 'react';
import { BookOpen, Target, FileText, Package, Wrench, Lightbulb, Eye, Play, Presentation, FileQuestion, ScrollText, ChevronRight, Home, GraduationCap, Layers, Info, ChevronLeft } from 'lucide-react';
import { LessonPlanData } from '@/types/projectSpecificTypes';
import TextPresentationDisplay from './TextPresentationDisplay';
import QuizDisplay from './QuizDisplay';
import { SmartSlideDeckViewer } from './SmartSlideDeckViewer';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';

interface LessonPlanViewProps {
  lessonPlanData: LessonPlanData;
  courseName?: string;
  moduleName?: string;
  lessonName?: string;
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({ 
  lessonPlanData, 
  courseName = "New Employee Onboarding", 
  moduleName = "Introduction to the Company", 
  lessonName 
}) => {
  const handleSeePrompt = (productName: string) => {
    // Scroll to the prompts section
    const promptsSection = document.getElementById('prompts-section');
    if (promptsSection) {
      promptsSection.scrollIntoView({ behavior: 'smooth' });
      
      // Highlight the specific prompt for this product
      const productPrompt = document.getElementById(`prompt-${productName}`);
      if (productPrompt) {
        productPrompt.style.backgroundColor = '#fef3c7';
        setTimeout(() => {
          productPrompt.style.backgroundColor = '';
        }, 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Document Title - More Prominent */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Lesson Draft</h1>
          </div>
          
          
          {/* Navigation Info Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                                 <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-md flex items-center justify-center">
                   <GraduationCap className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Course</p>
                  <p className="text-sm font-semibold text-gray-800">{courseName}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
                  <Layers className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Module</p>
                  <p className="text-sm font-semibold text-gray-800">{moduleName}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-md flex items-center justify-center">
                  <BookOpen className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lesson</p>
                  <p className="text-sm font-semibold text-gray-800">{lessonName || lessonPlanData.lessonTitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

                {/* Description */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 md:p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Info className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Description</h2>
          </div>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 md:p-6 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
              {lessonPlanData.lessonTitle}
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              {lessonPlanData.shortDescription}
            </p>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Learning Objectives</h2>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
            <ul className="space-y-4">
              {lessonPlanData.lessonObjectives.map((objective, index) => (
                <li key={index} className="flex items-start group">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform"></div>
                  <span className="text-gray-800 leading-relaxed font-medium text-lg">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Content Types */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 md:p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Content Types</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              // Extract unique product types from contentDevelopmentSpecifications
              const productTypes = lessonPlanData.contentDevelopmentSpecifications
                .filter(block => block.type === 'product')
                .map(block => block.product_name)
                .filter((name, index, array) => array.indexOf(name) === index); // Remove duplicates

              const getProductIcon = (productName: string) => {
                const name = productName.toLowerCase();
                if (name.includes('video')) return Play;
                if (name.includes('presentation')) return Presentation;
                if (name.includes('quiz')) return FileQuestion;
                if (name.includes('one-pager') || name.includes('onepager')) return ScrollText;
                return FileText; // Default icon
              };

              const getProductColor = (productName: string) => {
                const name = productName.toLowerCase();
                if (name.includes('video')) return 'from-red-500 to-pink-600';
                if (name.includes('presentation')) return 'from-blue-500 to-indigo-600';
                if (name.includes('quiz')) return 'from-green-500 to-emerald-600';
                if (name.includes('one-pager') || name.includes('onepager')) return 'from-orange-500 to-amber-600';
                return 'from-gray-500 to-slate-600'; // Default color
              };

              const formatProductName = (productName: string) => {
                return productName
                  .split('-')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ') + ' Draft';
              };

              return productTypes.map((productName, index) => {
                const IconComponent = getProductIcon(productName);
                const colorClass = getProductColor(productName);
                const formattedName = formatProductName(productName);

                return (
                                     <div key={index} className="group bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-8 border border-blue-100 hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                                             <h3 className="text-lg font-semibold text-gray-800">{formattedName}</h3>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Product-Specific Content Blocks */}
        {(() => {
          // Extract unique product types from contentDevelopmentSpecifications
          const productTypes = lessonPlanData.contentDevelopmentSpecifications
            .filter(block => block.type === 'product')
            .map(block => block.product_name)
            .filter((name, index, array) => array.indexOf(name) === index); // Remove duplicates

          // Define product order: video-lesson first, then presentation, then quiz, then one-pager
          const productOrder = ['video-lesson', 'presentation', 'quiz', 'one-pager'];
          const sortedProducts = productTypes.sort((a, b) => {
            const aIndex = productOrder.indexOf(a);
            const bIndex = productOrder.indexOf(b);
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
          });

          // Mock data for existing content - in real implementation, this would come from props or API calls
          const mockOnePagerData = {
            textTitle: lessonPlanData.lessonTitle,
            contentBlocks: [
              {
                type: 'headline',
                level: 2,
                text: 'Key Concepts',
                isImportant: true
              },
              {
                type: 'paragraph',
                text: 'This lesson introduces fundamental concepts that form the foundation of understanding in this subject area.'
              },
              {
                type: 'headline',
                level: 3,
                text: 'Learning Objectives',
                isImportant: true
              },
              {
                type: 'bullet_list',
                items: lessonPlanData.lessonObjectives
              }
            ]
          };

          const mockPresentationSlides = [
            { title: lessonPlanData.lessonTitle, content: lessonPlanData.shortDescription },
            { title: 'Learning Objectives', content: lessonPlanData.lessonObjectives.join('\n• ') },
            { title: 'Key Concepts', content: 'Overview of main concepts covered in this lesson' },
            { title: 'Summary', content: 'Recap of important points and next steps' }
          ];

          const mockQuizQuestions = [
            {
              question: 'What is the main objective of this lesson?',
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correct: 0
            },
            {
              question: 'Which concept is most important to understand?',
              options: ['Concept 1', 'Concept 2', 'Concept 3', 'Concept 4'],
              correct: 1
            }
          ];

          const getPromptForProduct = (productName: string) => {
            return lessonPlanData.suggestedPrompts.find(prompt => {
              const lowerPrompt = prompt.toLowerCase();
              if (productName === 'video-lesson') return lowerPrompt.includes('video');
              if (productName === 'presentation') return lowerPrompt.includes('presentation');
              if (productName === 'quiz') return lowerPrompt.includes('quiz');
              if (productName === 'one-pager') return lowerPrompt.includes('one-pager') || lowerPrompt.includes('onepager');
              return false;
            }) || `Create a ${productName.replace('-', ' ')} for this lesson.`;
          };

          return sortedProducts.map((productName, index) => {
            const formattedName = productName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            const prompt = getPromptForProduct(productName);

            if (productName === 'video-lesson') {
              return (
                <VideoLessonBlock 
                  key={productName}
                  title={`${formattedName} Draft`}
                  onePagerData={mockOnePagerData}
                  prompt={prompt}
                />
              );
            }

            if (productName === 'presentation') {
              return (
                <PresentationBlock 
                  key={productName}
                  title={`${formattedName} Draft`}
                  slides={mockPresentationSlides}
                  prompt={prompt}
                />
              );
            }

            if (productName === 'quiz') {
              return (
                <QuizBlock 
                  key={productName}
                  title={`${formattedName} Draft`}
                  questions={mockQuizQuestions}
                  prompt={prompt}
                />
              );
            }

            if (productName === 'one-pager') {
              return (
                <OnePagerBlock 
                  key={productName}
                  title={`${formattedName} Draft`}
                  onePagerData={mockOnePagerData}
                  prompt={prompt}
                />
              );
            }

            return null;
          }).filter(Boolean);
        })()}
      </div>
    </div>
  );
};

// Product-Specific Block Components
const VideoLessonBlock: React.FC<{
  title: string;
  onePagerData: any;
  prompt: string;
}> = ({ title, onePagerData, prompt }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 md:p-8 mb-8">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
          <Play className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h2>
      </div>
      
      {/* One-Pager Content */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Script (One-Pager)</h3>
        <div style={{ 
          '--bg-color': '#EFF6FF',
          backgroundColor: 'var(--bg-color)'
        } as React.CSSProperties}>
          <TextPresentationDisplay 
            dataToDisplay={onePagerData}
            isEditing={false}
          />
        </div>
      </div>

      {/* Video Creation Prompt */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 md:p-6 border border-red-100">
        <div className="flex items-center mb-3">
          <Play className="w-5 h-5 text-red-600 mr-2" />
          <h4 className="font-bold text-red-800 text-base md:text-lg uppercase tracking-wide">
            Video Creation Prompt
          </h4>
        </div>
        <div className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
          {prompt}
        </div>
      </div>
    </div>
  );
};

const PresentationBlock: React.FC<{
  title: string;
  slides: Array<{ title: string; content: string }>;
  prompt: string;
}> = ({ title, slides, prompt }) => {
  // Convert simple slides to ComponentBasedSlideDeck format for SmartSlideDeckViewer
  const componentBasedSlideDeck: ComponentBasedSlideDeck = {
    deckTitle: title,
    theme: 'default',
    slides: slides.map((slide, index) => ({
      slideId: `slide-${index}`,
      slideTitle: slide.title,
      slideType: 'text-focus',
      components: [
        {
          id: `content-${index}`,
          type: 'text',
          props: {
            text: slide.content,
            style: {
              fontSize: '18px',
              textAlign: 'left',
              color: '#333333'
            }
          },
          layout: {
            x: 50,
            y: 150,
            width: 700,
            height: 400
          }
        }
      ]
    }))
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 md:p-8 mb-8">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
          <Presentation className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h2>
      </div>
      
      {/* Slide Display using SmartSlideDeckViewer */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Presentation Slides</h3>
        <div style={{
          width: '100%',
          minHeight: '600px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <SmartSlideDeckViewer
            deck={componentBasedSlideDeck}
            isEditable={false}
            showFormatInfo={false}
            enableAutomaticImageGeneration={false}
          />
        </div>
      </div>

      {/* Presentation Creation Prompt */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-100">
        <div className="flex items-center mb-3">
          <Presentation className="w-5 h-5 text-blue-600 mr-2" />
          <h4 className="font-bold text-blue-800 text-base md:text-lg uppercase tracking-wide">
            Presentation Creation Prompt
          </h4>
        </div>
        <div className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
          {prompt}
        </div>
      </div>
    </div>
  );
};

const QuizBlock: React.FC<{
  title: string;
  questions: Array<{ question: string; options: string[]; correct: number }>;
  prompt: string;
}> = ({ title, questions, prompt }) => {
  // Convert simple questions to QuizData format
  const quizData = {
    quizTitle: title,
    questions: questions.map((q, index) => ({
      question_id: `q-${index}`,
      question_type: 'multiple-choice' as const,
      question_text: q.question,
      options: q.options.map((option, optIndex) => ({
        option_id: `opt-${index}-${optIndex}`,
        option_text: option,
        is_correct: optIndex === q.correct
      }))
    }))
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 md:p-8 mb-8">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
          <FileQuestion className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h2>
      </div>
      
      {/* Quiz Display using QuizDisplay component */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiz Questions</h3>
        <QuizDisplay
          dataToDisplay={quizData}
          isEditing={false}
          onTextChange={() => {}} // No editing in lesson plan view
        />
      </div>

      {/* Quiz Creation Prompt */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 md:p-6 border border-green-100">
        <div className="flex items-center mb-3">
          <FileQuestion className="w-5 h-5 text-green-600 mr-2" />
          <h4 className="font-bold text-green-800 text-base md:text-lg uppercase tracking-wide">
            Quiz Creation Prompt
          </h4>
        </div>
        <div className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
          {prompt}
        </div>
      </div>
    </div>
  );
};

const OnePagerBlock: React.FC<{
  title: string;
  onePagerData: any;
  prompt: string;
}> = ({ title, onePagerData, prompt }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 md:p-8 mb-8">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
          <ScrollText className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h2>
      </div>
      
      {/* One-Pager Content */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">One-Pager Content</h3>
        <div style={{ 
          '--bg-color': '#EFF6FF',
          backgroundColor: 'var(--bg-color)'
        } as React.CSSProperties}>
                     <TextPresentationDisplay 
             dataToDisplay={onePagerData}
             isEditing={false}
           />
        </div>
      </div>

      {/* One-Pager Creation Prompt */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 md:p-6 border border-orange-100">
        <div className="flex items-center mb-3">
          <ScrollText className="w-5 h-5 text-orange-600 mr-2" />
          <h4 className="font-bold text-orange-800 text-base md:text-lg uppercase tracking-wide">
            One-Pager Creation Prompt
          </h4>
        </div>
        <div className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
          {prompt}
        </div>
      </div>
    </div>
  );
};

export default LessonPlanView;
 