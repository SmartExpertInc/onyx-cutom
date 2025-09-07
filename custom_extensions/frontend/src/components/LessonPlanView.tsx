"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, Target, FileText, Package, Wrench, Lightbulb, Eye, Play, Presentation, FileQuestion, ScrollText, ChevronRight, Home, GraduationCap, Layers, Info, ChevronLeft } from 'lucide-react';
import { LessonPlanData } from '@/types/projectSpecificTypes';
import { ProjectListItem } from '@/types/products';
import TextPresentationDisplay from './TextPresentationDisplay';
import QuizDisplay from './QuizDisplay';
import { SmartSlideDeckViewer } from './SmartSlideDeckViewer';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';

const CUSTOM_BACKEND_URL = '/api/custom-projects-backend';

interface LessonPlanViewProps {
  lessonPlanData: LessonPlanData;
  courseName?: string;
  moduleName?: string;
  lessonName?: string;
  allUserMicroproducts?: ProjectListItem[];
  parentProjectName?: string;
}

// Helper function to find microproduct by title (same as in TrainingPlanTable)
const findMicroproductByTitle = (
  titleToMatch: string | undefined | null,
  parentProjectName: string | undefined,
  allUserMicroproducts: ProjectListItem[] | undefined,
  excludeComponentTypes: string[] = []
): ProjectListItem | undefined => {
  if (!allUserMicroproducts || !parentProjectName || !titleToMatch) {
    return undefined;
  }

  const trimmedTitleToMatch = titleToMatch.trim();
  const trimmedParentProjectName = parentProjectName.trim();

  const found = allUserMicroproducts.find(
    (mp) => {
      const mpMicroName = mp.microProductName ?? (mp as any).microproduct_name;
      const mpProjectName = mp.projectName?.trim();
      const mpDesignMicroproductType = (mp as any).design_microproduct_type;

      // Skip if this component type should be excluded
      if (excludeComponentTypes.includes(mpDesignMicroproductType)) {
        return false;
      }

      // Method 1: Legacy matching - project name matches outline and microProductName matches lesson
      const legacyProjectMatch = mpProjectName === trimmedParentProjectName;
      const legacyNameMatch = mpMicroName?.trim() === trimmedTitleToMatch;
      
      // Method 2: New naming convention - project name follows "Outline Name: Lesson Title" pattern
      const expectedNewProjectName = `${trimmedParentProjectName}: ${trimmedTitleToMatch}`;
      const newPatternMatch = mpProjectName === expectedNewProjectName;
      
      // Method 3: Legacy patterns for backward compatibility
      const legacyQuizPattern = `Quiz - ${trimmedParentProjectName}: ${trimmedTitleToMatch}`;
      const legacyQuizPatternMatch = mpProjectName === legacyQuizPattern;
      
      const legacyTextPresentationPattern = `Text Presentation - ${trimmedParentProjectName}: ${trimmedTitleToMatch}`;
      const legacyTextPresentationPatternMatch = mpProjectName === legacyTextPresentationPattern;
      
      const isMatch = (legacyProjectMatch && legacyNameMatch) || newPatternMatch || legacyQuizPatternMatch || legacyTextPresentationPatternMatch;
      
      return isMatch;
    }
  );

  return found;
};

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({ 
  lessonPlanData, 
  courseName = "New Employee Onboarding", 
  moduleName = "Introduction to the Company", 
  lessonName,
  allUserMicroproducts,
  parentProjectName
}) => {
  const [productData, setProductData] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(false);

  // Fetch real product data for this lesson
  useEffect(() => {
    if (!allUserMicroproducts || !parentProjectName) {
      console.log(`🚫 [LESSON_PLAN] Missing required data:`, {
        hasAllUserMicroproducts: !!allUserMicroproducts,
        hasParentProjectName: !!parentProjectName,
        allUserMicroproductsLength: allUserMicroproducts?.length || 0
      });
      return;
    }

    const fetchProductData = async () => {
      setLoading(true);
      const lessonTitle = lessonName || lessonPlanData.lessonTitle;
      
      console.log(`🔍 [LESSON_PLAN] Starting product search:`, {
        lessonTitle,
        parentProjectName,
        totalProducts: allUserMicroproducts.length
      });

      // Log all available products for debugging
      console.log(`📋 [LESSON_PLAN] All available products:`, 
        allUserMicroproducts.map(mp => ({
          id: mp.id,
          projectName: mp.projectName,
          microProductName: mp.microProductName,
          design_microproduct_type: (mp as any).design_microproduct_type,
          component_name: (mp as any).component_name
        }))
      );

      const newProductData: {[key: string]: any} = {};

      // Use EXACT same logic as TrainingPlan - find products by lesson title using the working function
      console.log(`🔍 [LESSON_PLAN] Using EXACT matching logic from TrainingPlan...`);

      // Find presentation (exclude Quiz, Text Presentation, Video Lesson to get only Presentation)
      const presentationProduct = findMicroproductByTitle(
        lessonTitle, 
        parentProjectName, 
        allUserMicroproducts, 
        ["Quiz", "Text Presentation", "Video Lesson"]
      );
      
      console.log(`🎯 [LESSON_PLAN] Presentation search result:`, {
        found: !!presentationProduct,
        id: presentationProduct?.id,
        projectName: presentationProduct?.projectName,
        microProductName: presentationProduct?.microProductName,
        designMicroproductType: (presentationProduct as any)?.design_microproduct_type
      });

      // Find quiz (exclude other types to get only Quiz)
      const quizProduct = findMicroproductByTitle(
        lessonTitle, 
        parentProjectName, 
        allUserMicroproducts, 
        ["Presentation", "Text Presentation", "Video Lesson"]
      );
      
      console.log(`❓ [LESSON_PLAN] Quiz search result:`, {
        found: !!quizProduct,
        id: quizProduct?.id,
        projectName: quizProduct?.projectName,
        microProductName: quizProduct?.microProductName,
        designMicroproductType: (quizProduct as any)?.design_microproduct_type
      });

      // Find one-pager (exclude other types to get only Text Presentation)
      const onePagerProduct = findMicroproductByTitle(
        lessonTitle, 
        parentProjectName, 
        allUserMicroproducts, 
        ["Presentation", "Quiz", "Video Lesson"]
      );
      
      console.log(`📄 [LESSON_PLAN] One-pager search result:`, {
        found: !!onePagerProduct,
        id: onePagerProduct?.id,
        projectName: onePagerProduct?.projectName,
        microProductName: onePagerProduct?.microProductName,
        designMicroproductType: (onePagerProduct as any)?.design_microproduct_type
      });

      // Find video lesson (exclude other types to get only Video Lesson)
      const videoLessonProduct = findMicroproductByTitle(
        lessonTitle, 
        parentProjectName, 
        allUserMicroproducts, 
        ["Presentation", "Quiz", "Text Presentation"]
      );
      
      console.log(`🎥 [LESSON_PLAN] Video lesson search result:`, {
        found: !!videoLessonProduct,
        id: videoLessonProduct?.id,
        projectName: videoLessonProduct?.projectName,
        microProductName: videoLessonProduct?.microProductName,
        designMicroproductType: (videoLessonProduct as any)?.design_microproduct_type
      });

      console.log(`✅ [LESSON_PLAN] Found products:`, {
        presentation: presentationProduct?.id || 'none',
        quiz: quizProduct?.id || 'none',
        onePager: onePagerProduct?.id || 'none',
        videoLesson: videoLessonProduct?.id || 'none'
      });

      // Fetch data for found products
      const fetchProduct = async (product: ProjectListItem | undefined, productType: string) => {
        if (!product) {
          console.log(`⚠️ [LESSON_PLAN] No ${productType} product found`);
          return null;
        }
        
        console.log(`📥 [LESSON_PLAN] Fetching ${productType} data for product ID: ${product.id}`);
        
        try {
          const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${product.id}`);
          console.log(`📡 [LESSON_PLAN] ${productType} API response status:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ [LESSON_PLAN] ${productType} data received:`, {
              hasDetails: !!data.details,
              detailsKeys: data.details ? Object.keys(data.details) : [],
              componentName: data.component_name
            });
            return data.details;
          } else {
            console.error(`❌ [LESSON_PLAN] ${productType} API error:`, response.status);
            return null;
          }
        } catch (error) {
          console.error(`💥 [LESSON_PLAN] Error fetching ${productType} data:`, error);
          return null;
        }
      };

      const [presentationData, quizData, onePagerData, videoLessonData] = await Promise.all([
        fetchProduct(presentationProduct, 'presentation'),
        fetchProduct(quizProduct, 'quiz'),
        fetchProduct(onePagerProduct, 'one-pager'),
        fetchProduct(videoLessonProduct, 'video-lesson')
      ]);

      console.log(`🎯 [LESSON_PLAN] Final data summary:`, {
        presentationData: presentationData ? 'loaded' : 'null',
        quizData: quizData ? 'loaded' : 'null',
        onePagerData: onePagerData ? 'loaded' : 'null',
        videoLessonData: videoLessonData ? 'loaded' : 'null'
      });

      newProductData.presentation = presentationData;
      newProductData.quiz = quizData;
      newProductData.onePager = onePagerData;
      newProductData.videoLesson = videoLessonData;

      setProductData(newProductData);
      setLoading(false);
    };

    fetchProductData();
  }, [lessonPlanData.lessonTitle, lessonName, allUserMicroproducts, parentProjectName]);

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
                  data={productData.videoLesson || productData.onePager}
                  prompt={prompt}
                  loading={loading}
                />
              );
            }

            if (productName === 'presentation') {
              return (
                <PresentationBlock 
                  key={productName}
                  title={`${formattedName} Draft`}
                  data={productData.presentation}
                  prompt={prompt}
                  loading={loading}
                />
              );
            }

            if (productName === 'quiz') {
              return (
                <QuizBlock 
                  key={productName}
                  title={`${formattedName} Draft`}
                  data={productData.quiz}
                  prompt={prompt}
                  loading={loading}
                />
              );
            }

            if (productName === 'one-pager') {
              return (
                <OnePagerBlock 
                  key={productName}
                  title={`${formattedName} Draft`}
                  data={productData.onePager}
                  prompt={prompt}
                  loading={loading}
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
  data: any;
  prompt: string;
  loading: boolean;
}> = ({ title, data, prompt, loading }) => {
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
        {loading ? (
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl">
            <div className="text-gray-500">Loading content...</div>
          </div>
        ) : data ? (
          <div style={{ 
            '--bg-color': '#EFF6FF',
            backgroundColor: 'var(--bg-color)'
          } as React.CSSProperties}>
            <TextPresentationDisplay 
              dataToDisplay={data}
              isEditing={false}
            />
          </div>
        ) : (
          <FallbackOnePagerContent />
        )}
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
  data: any;
  prompt: string;
  loading: boolean;
}> = ({ title, data, prompt, loading }) => {

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
        {loading ? (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl">
            <div className="text-gray-500">Loading slides...</div>
          </div>
        ) : data ? (
          <div style={{
            width: '100%',
            minHeight: '600px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <SmartSlideDeckViewer
              deck={data}
              isEditable={false}
              showFormatInfo={false}
              enableAutomaticImageGeneration={false}
            />
          </div>
        ) : (
          <FallbackPresentationCarousel />
        )}
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
  data: any;
  prompt: string;
  loading: boolean;
}> = ({ title, data, prompt, loading }) => {

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
        {loading ? (
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl">
            <div className="text-gray-500">Loading questions...</div>
          </div>
        ) : data ? (
          <QuizDisplay
            dataToDisplay={data}
            isEditing={false}
            onTextChange={() => {}} // No editing in lesson plan view
          />
        ) : (
          <FallbackQuizCarousel />
        )}
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
  data: any;
  prompt: string;
  loading: boolean;
}> = ({ title, data, prompt, loading }) => {
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
        {loading ? (
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl">
            <div className="text-gray-500">Loading content...</div>
          </div>
        ) : data ? (
          <div style={{ 
            '--bg-color': '#EFF6FF',
            backgroundColor: 'var(--bg-color)'
          } as React.CSSProperties}>
            <TextPresentationDisplay 
              dataToDisplay={data}
              isEditing={false}
            />
          </div>
        ) : (
          <FallbackOnePagerContent />
        )}
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

// Fallback carousel components when real data isn't available
const FallbackPresentationCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fallbackSlides = [
    { title: 'Introduction', content: 'Welcome to this lesson. We will cover the key concepts and objectives outlined in the lesson plan.' },
    { title: 'Learning Objectives', content: 'By the end of this lesson, you will understand the fundamental principles and be able to apply them effectively.' },
    { title: 'Key Concepts', content: 'This section will introduce the main topics and provide context for deeper understanding.' },
    { title: 'Summary', content: 'We will recap the important points covered and outline next steps for continued learning.' }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % fallbackSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + fallbackSlides.length) % fallbackSlides.length);
  };

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 min-h-[300px]">
        <div className="text-center h-full flex flex-col justify-center">
          <h4 className="text-2xl font-bold text-blue-900 mb-4">
            {fallbackSlides[currentSlide]?.title}
          </h4>
          <p className="text-lg text-gray-700 leading-relaxed">
            {fallbackSlides[currentSlide]?.content}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={prevSlide}
          disabled={fallbackSlides.length <= 1}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>
        
        <span className="text-sm text-gray-600">
          Slide {currentSlide + 1} of {fallbackSlides.length} (Preview)
        </span>
        
        <button
          onClick={nextSlide}
          disabled={fallbackSlides.length <= 1}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

const FallbackQuizCarousel: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const fallbackQuestions = [
    {
      question: 'What are the main learning objectives of this lesson?',
      options: ['Understanding key concepts', 'Applying theoretical knowledge', 'Both A and B', 'Neither A nor B'],
      correct: 2
    },
    {
      question: 'Which approach is most effective for retaining information?',
      options: ['Passive reading', 'Active participation', 'Memorization only', 'Skipping practice'],
      correct: 1
    }
  ];

  const nextQuestion = () => {
    setCurrentQuestion((prev) => (prev + 1) % fallbackQuestions.length);
  };

  const prevQuestion = () => {
    setCurrentQuestion((prev) => (prev - 1 + fallbackQuestions.length) % fallbackQuestions.length);
  };

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-green-900 mb-4">
            Question {currentQuestion + 1} (Preview)
          </h4>
          <p className="text-gray-800 leading-relaxed mb-6">
            {fallbackQuestions[currentQuestion]?.question}
          </p>
          <div className="space-y-3">
            {fallbackQuestions[currentQuestion]?.options.map((option, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  index === fallbackQuestions[currentQuestion]?.correct 
                    ? 'bg-green-100 border-green-300 text-green-800' 
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <span className="font-medium mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
                {index === fallbackQuestions[currentQuestion]?.correct && (
                  <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={prevQuestion}
          disabled={fallbackQuestions.length <= 1}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>
        
        <span className="text-sm text-gray-600">
          Question {currentQuestion + 1} of {fallbackQuestions.length} (Preview)
        </span>
        
        <button
          onClick={nextQuestion}
          disabled={fallbackQuestions.length <= 1}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

const FallbackOnePagerContent: React.FC = () => {
  const fallbackOnePagerData = {
    textTitle: 'Lesson Content Preview',
    contentBlocks: [
      {
        type: 'headline',
        level: 2,
        text: 'Key Learning Points',
        isImportant: true
      },
      {
        type: 'paragraph',
        text: 'This lesson introduces fundamental concepts that are essential for understanding the subject matter. The content will be structured to build upon previous knowledge while introducing new ideas.'
      },
      {
        type: 'headline',
        level: 3,
        text: 'What You Will Learn',
        isImportant: true
      },
      {
        type: 'bullet_list',
        items: [
          'Core principles and foundational concepts',
          'Practical applications and real-world examples', 
          'Best practices and common challenges',
          'Next steps for continued learning'
        ]
      },
      {
        type: 'paragraph',
        text: 'The lesson is designed to be engaging and interactive, with opportunities to apply what you learn through exercises and discussions.'
      }
    ]
  };

  return (
    <div style={{ 
      '--bg-color': '#EFF6FF',
      backgroundColor: 'var(--bg-color)'
    } as React.CSSProperties}>
      <TextPresentationDisplay 
        dataToDisplay={fallbackOnePagerData as any}
        isEditing={false}
      />
    </div>
  );
};

export default LessonPlanView;
 