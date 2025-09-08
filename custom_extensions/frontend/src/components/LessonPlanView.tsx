"use client";

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Target, FileText, Package, Wrench, Lightbulb, Eye, Play, Presentation, FileQuestion, ScrollText, ChevronRight, Home, GraduationCap, Layers, Info, ChevronLeft, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { LessonPlanData } from '@/types/projectSpecificTypes';
import { ProjectListItem } from '@/types/products';
import TextPresentationDisplay from './TextPresentationDisplay';
import QuizDisplay from './QuizDisplay';
import { SmartSlideDeckViewer } from './SmartSlideDeckViewer';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { ComponentBasedSlideRenderer } from './ComponentBasedSlideRenderer';
import { AnyQuizQuestion, MultipleChoiceQuestion, MultiSelectQuestion, MatchingQuestion, SortingQuestion, OpenAnswerQuestion } from '@/types/quizTypes';
import { TextPresentationData, AnyContentBlock, HeadlineBlock, ParagraphBlock, BulletListBlock } from '@/types/textPresentation';
import Image from 'next/image';

const CUSTOM_BACKEND_URL = '/api/custom-projects-backend';

// InlineEditor component for editable text
interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

function InlineEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  multiline = false, 
  placeholder = "",
  className = "",
  style = {}
}: InlineEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(value);
  };

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className={`inline-editor-textarea ${className}`}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          ...style,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          resize: 'none',
          overflow: 'hidden',
          width: '100%',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          minHeight: '1.6em',
          boxSizing: 'border-box',
          display: 'block',
          lineHeight: '1.6'
        }}
        rows={1}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      className={`inline-editor-input ${className}`}
      type="text"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      style={{
        ...style,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        boxSizing: 'border-box'
      }}
    />
  );
}

// Connector configurations with logos - exact same paths as SmartDrive
const connectorConfigs = [
  { id: 'notion', name: 'Notion', logoPath: '/Notion.png' },
  { id: 'dropbox', name: 'Dropbox', logoPath: '/Dropbox.png' },
  { id: 'salesforce', name: 'Salesforce', logoPath: '/Salesforce.png' }
];

interface LessonPlanViewProps {
  lessonPlanData: LessonPlanData;
  courseName?: string;
  moduleName?: string;
  lessonName?: string;
  allUserMicroproducts?: ProjectListItem[];
  parentProjectName?: string;
  isEditable?: boolean;
  onUpdate?: (updatedData: LessonPlanData) => void;
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
  parentProjectName,
  isEditable = true,
  onUpdate
}) => {
  const [productData, setProductData] = useState<{[key: string]: any}>({});
  const [products, setProducts] = useState<{[key: string]: ProjectListItem | undefined}>({});
  const [loading, setLoading] = useState(false);
  const [timingData, setTimingData] = useState<{
    creationTimes: { presentation: string, quiz: string, onePager: string, videoLesson: string },
    completionTimes: { presentation: string, quiz: string, onePager: string, videoLesson: string }
  } | null>(null);

  // Editing states
  const [editingLessonTitle, setEditingLessonTitle] = useState(false);
  const [editingShortDescription, setEditingShortDescription] = useState(false);
  const [editingObjective, setEditingObjective] = useState<number | null>(null);
  const [editingCourseName, setEditingCourseName] = useState(false);
  const [editingModuleName, setEditingModuleName] = useState(false);
  const [editingLessonName, setEditingLessonName] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null); // productName when editing

  // Local editable data state
  const [editableLessonPlanData, setEditableLessonPlanData] = useState(lessonPlanData);

  // Update local state when props change
  useEffect(() => {
    setEditableLessonPlanData(lessonPlanData);
  }, [lessonPlanData]);

  // Save handlers
  const handleUpdateLessonPlanData = (updatedData: LessonPlanData) => {
    console.log('🔄 [LESSON_PLAN] Updating data:', updatedData);
    setEditableLessonPlanData(updatedData);
    if (onUpdate) {
      console.log('✅ [LESSON_PLAN] Calling onUpdate callback');
      onUpdate(updatedData);
    } else {
      console.log('⚠️ [LESSON_PLAN] No onUpdate callback provided');
    }
  };

  const handleLessonTitleSave = (newValue: string) => {
    console.log('💾 [LESSON_PLAN] Saving lesson title:', newValue);
    const updated = { ...editableLessonPlanData, lessonTitle: newValue };
    handleUpdateLessonPlanData(updated);
    setEditingLessonTitle(false);
  };

  const handleShortDescriptionSave = (newValue: string) => {
    console.log('💾 [LESSON_PLAN] Saving short description:', newValue);
    const updated = { ...editableLessonPlanData, shortDescription: newValue };
    handleUpdateLessonPlanData(updated);
    setEditingShortDescription(false);
  };

  const handleObjectiveSave = (index: number, newValue: string) => {
    console.log('💾 [LESSON_PLAN] Saving objective', index, ':', newValue);
    const updatedObjectives = [...editableLessonPlanData.lessonObjectives];
    updatedObjectives[index] = newValue;
    const updated = { ...editableLessonPlanData, lessonObjectives: updatedObjectives };
    handleUpdateLessonPlanData(updated);
    setEditingObjective(null);
  };

  const handlePromptSave = (productName: string, newValue: string) => {
    console.log('💾 [LESSON_PLAN] Saving prompt for', productName, ':', newValue);
    const updatedPrompts = [...editableLessonPlanData.suggestedPrompts];
    
    // Find existing prompt for this product
    const existingIndex = updatedPrompts.findIndex(prompt => {
      const lowerPrompt = prompt.toLowerCase();
      if (productName === 'video-lesson') return lowerPrompt.includes('video');
      if (productName === 'presentation') return lowerPrompt.includes('presentation');
      if (productName === 'quiz') return lowerPrompt.includes('quiz');
      if (productName === 'one-pager') return lowerPrompt.includes('one-pager') || lowerPrompt.includes('onepager');
      return false;
    });

    console.log('🔍 [LESSON_PLAN] Found existing prompt at index:', existingIndex);

    if (existingIndex >= 0) {
      // Update existing prompt
      updatedPrompts[existingIndex] = newValue;
      console.log('✏️ [LESSON_PLAN] Updated existing prompt');
    } else {
      // Add new prompt
      updatedPrompts.push(newValue);
      console.log('➕ [LESSON_PLAN] Added new prompt');
    }

    const updated = { ...editableLessonPlanData, suggestedPrompts: updatedPrompts };
    handleUpdateLessonPlanData(updated);
    setEditingPrompt(null);
  };

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

      // Direct search by projectName and design_microproduct_type
      console.log(`🔍 [LESSON_PLAN] Searching for products with projectName = "${parentProjectName}"`);

      // Find presentation (Slide Deck)
      const presentationProduct = allUserMicroproducts.find(mp => 
        mp.projectName === parentProjectName && 
        (mp as any).design_microproduct_type === 'Slide Deck'
      );
      
      console.log(`🎯 [LESSON_PLAN] Presentation (Slide Deck) search:`, {
        found: !!presentationProduct,
        id: presentationProduct?.id,
        projectName: presentationProduct?.projectName,
        microProductName: presentationProduct?.microProductName,
        designMicroproductType: (presentationProduct as any)?.design_microproduct_type
      });

      // Find quiz
      const quizProduct = allUserMicroproducts.find(mp => 
        mp.projectName === parentProjectName && 
        (mp as any).design_microproduct_type === 'Quiz'
      );
      
      console.log(`❓ [LESSON_PLAN] Quiz search:`, {
        found: !!quizProduct,
        id: quizProduct?.id,
        projectName: quizProduct?.projectName,
        microProductName: quizProduct?.microProductName,
        designMicroproductType: (quizProduct as any)?.design_microproduct_type
      });

      // Find one-pager (Text Presentation)
      const onePagerProduct = allUserMicroproducts.find(mp => 
        mp.projectName === parentProjectName && 
        (mp as any).design_microproduct_type === 'Text Presentation'
      );
      
      console.log(`📄 [LESSON_PLAN] One-pager (Text Presentation) search:`, {
        found: !!onePagerProduct,
        id: onePagerProduct?.id,
        projectName: onePagerProduct?.projectName,
        microProductName: onePagerProduct?.microProductName,
        designMicroproductType: (onePagerProduct as any)?.design_microproduct_type
      });

      // Find video lesson
      const videoLessonProduct = allUserMicroproducts.find(mp => 
        mp.projectName === parentProjectName && 
        (mp as any).design_microproduct_type === 'Video Lesson'
      );
      
      console.log(`🎥 [LESSON_PLAN] Video lesson search:`, {
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

      // Store the product objects for timing information
      console.log(`🕒 [LESSON_PLAN] Product timing data:`, {
        presentationProduct: presentationProduct ? {
          id: presentationProduct.id,
          est_creation_time: (presentationProduct as any).est_creation_time,
          est_completion_time: (presentationProduct as any).est_completion_time,
          allFields: Object.keys(presentationProduct)
        } : null,
        quizProduct: quizProduct ? {
          id: quizProduct.id,
          est_creation_time: (quizProduct as any).est_creation_time,
          est_completion_time: (quizProduct as any).est_completion_time,
          allFields: Object.keys(quizProduct)
        } : null,
        onePagerProduct: onePagerProduct ? {
          id: onePagerProduct.id,
          est_creation_time: (onePagerProduct as any).est_creation_time,
          est_completion_time: (onePagerProduct as any).est_completion_time,
          allFields: Object.keys(onePagerProduct)
        } : null,
        videoLessonProduct: videoLessonProduct ? {
          id: videoLessonProduct.id,
          est_creation_time: (videoLessonProduct as any).est_creation_time,
          est_completion_time: (videoLessonProduct as any).est_completion_time,
          allFields: Object.keys(videoLessonProduct)
        } : null
      });

      setProducts({
        presentation: presentationProduct,
        quiz: quizProduct,
        onePager: onePagerProduct,
        videoLesson: videoLessonProduct
      });

      setProductData(newProductData);
      
      // Fetch timing data from parent project settings
      await fetchTimingData();
      
      setLoading(false);
    };

    const fetchTimingData = async () => {
      if (!parentProjectName || !allUserMicroproducts) return;
      
      console.log(`⏱️ [LESSON_PLAN] Fetching timing data for parentProjectName: "${parentProjectName}"`);
      
      // Find any product from the parent project to get the project ID
      const parentProduct = allUserMicroproducts.find(mp => mp.projectName === parentProjectName);
      
      // Quality tier default rates
      const getDefaultRateForTier = (tier: string | undefined): number => {
        switch (tier) {
          case 'basic': return 100;
          case 'interactive': return 200;
          case 'advanced': return 300;
          case 'immersive': return 700;
          default: return 200; // Default to interactive tier
        }
      };
      
      if (!parentProduct) {
        console.warn(`⏱️ [LESSON_PLAN] No parent product found for project: ${parentProjectName}`);
        // Use interactive defaults
        const defaultCompletionTimes = { presentation: 8, quiz: 6, onePager: 3, videoLesson: 4 };
        const defaultRate = 200;
        
        setTimingData({
          creationTimes: { 
            presentation: `${Math.round((defaultCompletionTimes.presentation * defaultRate) / 60)}h`,
            quiz: `${Math.round((defaultCompletionTimes.quiz * defaultRate) / 60)}h`,
            onePager: `${Math.round((defaultCompletionTimes.onePager * defaultRate) / 60)}h`,
            videoLesson: `${Math.round((defaultCompletionTimes.videoLesson * defaultRate) / 60)}h`
          },
          completionTimes: { presentation: '8m', quiz: '6m', onePager: '3m', videoLesson: '4m' }
        });
        return;
      }
      
      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${parentProduct.id}`);
        
        if (response.ok) {
          const projectSettings = await response.json();
          console.log(`⏱️ [LESSON_PLAN] Project settings:`, projectSettings);
          
          // Extract timing configuration
          const qualityTier = projectSettings.quality_tier;
          const defaultRateForTier = getDefaultRateForTier(qualityTier);
          const customRate = projectSettings.custom_rate || defaultRateForTier;
          const isAdvanced = projectSettings.is_advanced || false;
          const advancedRates = projectSettings.advanced_rates || {};
          const completionTimes = projectSettings.completion_times || {};
          
          // Get completion times (in minutes)
          const completionMinutes = {
            presentation: completionTimes.presentation || 8,
            quiz: completionTimes.quiz || 6,
            onePager: completionTimes.one_pager || 3,
            videoLesson: completionTimes.video_lesson || 4
          };
          
          // Calculate creation rates (multiplier)
          const creationRates = isAdvanced ? {
            presentation: advancedRates.presentation || customRate,
            quiz: advancedRates.quiz || customRate,
            onePager: advancedRates.one_pager || customRate,
            videoLesson: advancedRates.video_lesson || customRate
          } : {
            presentation: customRate,
            quiz: customRate,
            onePager: customRate,
            videoLesson: customRate
          };
          
          // Calculate creation times by multiplying completion time * rate (convert to hours)
          const creationHours = {
            presentation: Math.round((completionMinutes.presentation * creationRates.presentation) / 60),
            quiz: Math.round((completionMinutes.quiz * creationRates.quiz) / 60),
            onePager: Math.round((completionMinutes.onePager * creationRates.onePager) / 60),
            videoLesson: Math.round((completionMinutes.videoLesson * creationRates.videoLesson) / 60)
          };
          
          console.log(`⏱️ [LESSON_PLAN] Calculated timing data:`, {
            qualityTier,
            defaultRateForTier,
            customRate,
            isAdvanced,
            creationRates,
            completionMinutes,
            creationHours
          });
          
          setTimingData({
            creationTimes: {
              presentation: `${creationHours.presentation}h`,
              quiz: `${creationHours.quiz}h`,
              onePager: `${creationHours.onePager}h`,
              videoLesson: `${creationHours.videoLesson}h`
            },
            completionTimes: {
              presentation: `${completionMinutes.presentation}m`,
              quiz: `${completionMinutes.quiz}m`,
              onePager: `${completionMinutes.onePager}m`,
              videoLesson: `${completionMinutes.videoLesson}m`
            }
          });
        } else {
          console.warn(`⏱️ [LESSON_PLAN] Failed to fetch project settings, using defaults`);
          const defaultCompletionTimes = { presentation: 8, quiz: 6, onePager: 3, videoLesson: 4 };
          const defaultRate = 200;
          
          setTimingData({
            creationTimes: { 
              presentation: `${Math.round((defaultCompletionTimes.presentation * defaultRate) / 60)}h`,
              quiz: `${Math.round((defaultCompletionTimes.quiz * defaultRate) / 60)}h`,
              onePager: `${Math.round((defaultCompletionTimes.onePager * defaultRate) / 60)}h`,
              videoLesson: `${Math.round((defaultCompletionTimes.videoLesson * defaultRate) / 60)}h`
            },
            completionTimes: { presentation: '8m', quiz: '6m', onePager: '3m', videoLesson: '4m' }
          });
        }
      } catch (error) {
        console.error(`⏱️ [LESSON_PLAN] Error fetching timing data:`, error);
        const defaultCompletionTimes = { presentation: 8, quiz: 6, onePager: 3, videoLesson: 4 };
        const defaultRate = 200;
        
        setTimingData({
          creationTimes: { 
            presentation: `${Math.round((defaultCompletionTimes.presentation * defaultRate) / 60)}h`,
            quiz: `${Math.round((defaultCompletionTimes.quiz * defaultRate) / 60)}h`,
            onePager: `${Math.round((defaultCompletionTimes.onePager * defaultRate) / 60)}h`,
            videoLesson: `${Math.round((defaultCompletionTimes.videoLesson * defaultRate) / 60)}h`
          },
          completionTimes: { presentation: '8m', quiz: '6m', onePager: '3m', videoLesson: '4m' }
        });
      }
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
                  {isEditable && editingCourseName ? (
                    <InlineEditor
                      initialValue={courseName}
                      onSave={(newValue) => {
                        setEditingCourseName(false);
                        // You can add course name update logic here if needed
                      }}
                      onCancel={() => setEditingCourseName(false)}
                      className="text-sm font-semibold text-gray-800"
                    />
                  ) : (
                    <p 
                      className={`text-sm font-semibold text-gray-800 ${isEditable ? 'cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 -mx-1' : ''}`}
                      onClick={() => isEditable && setEditingCourseName(true)}
                    >
                      {courseName}
                    </p>
                  )}
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
                  {isEditable && editingModuleName ? (
                    <InlineEditor
                      initialValue={moduleName}
                      onSave={(newValue) => {
                        setEditingModuleName(false);
                        // You can add module name update logic here if needed
                      }}
                      onCancel={() => setEditingModuleName(false)}
                      className="text-sm font-semibold text-gray-800"
                    />
                  ) : (
                    <p 
                      className={`text-sm font-semibold text-gray-800 ${isEditable ? 'cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 -mx-1' : ''}`}
                      onClick={() => isEditable && setEditingModuleName(true)}
                    >
                      {moduleName}
                    </p>
                  )}
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
                  {isEditable && editingLessonName ? (
                    <InlineEditor
                      initialValue={lessonName || editableLessonPlanData.lessonTitle}
                      onSave={(newValue) => {
                        setEditingLessonName(false);
                        // Update lesson title in the data
                        handleLessonTitleSave(newValue);
                      }}
                      onCancel={() => setEditingLessonName(false)}
                      className="text-sm font-semibold text-gray-800"
                    />
                  ) : (
                    <p 
                      className={`text-sm font-semibold text-gray-800 ${isEditable ? 'cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 -mx-1' : ''}`}
                      onClick={() => isEditable && setEditingLessonName(true)}
                    >
                      {lessonName || editableLessonPlanData.lessonTitle}
                    </p>
                  )}
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
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 md:p-8 border border-blue-100">
            {isEditable && editingLessonTitle ? (
              <InlineEditor
                initialValue={editableLessonPlanData.lessonTitle}
                onSave={handleLessonTitleSave}
                onCancel={() => setEditingLessonTitle(false)}
                className="text-2xl font-bold text-gray-900 mb-3 tracking-tight"
                style={{ fontSize: '1.5rem', lineHeight: '2rem', fontWeight: '700' }}
              />
            ) : (
              <h3 
                className={`text-2xl font-bold text-gray-900 mb-3 tracking-tight ${isEditable ? 'cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2' : ''}`}
                onClick={() => isEditable && setEditingLessonTitle(true)}
              >
                {editableLessonPlanData.lessonTitle}
            </h3>
            )}
            {isEditable && editingShortDescription ? (
              <InlineEditor
                initialValue={editableLessonPlanData.shortDescription}
                onSave={handleShortDescriptionSave}
                onCancel={() => setEditingShortDescription(false)}
                multiline={true}
                className="text-lg text-gray-700 leading-relaxed"
                style={{ fontSize: '1.125rem', lineHeight: '1.75rem' }}
              />
            ) : (
              <p 
                className={`text-lg text-gray-700 leading-relaxed ${isEditable ? 'cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2' : ''}`}
                onClick={() => isEditable && setEditingShortDescription(true)}
              >
                {editableLessonPlanData.shortDescription}
              </p>
            )}
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
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-8 border border-blue-100">
            <ul className="space-y-4">
              {editableLessonPlanData.lessonObjectives.map((objective, index) => (
                <li key={index} className="flex items-start group">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform"></div>
                  {isEditable && editingObjective === index ? (
                    <InlineEditor
                      initialValue={objective}
                      onSave={(newValue) => handleObjectiveSave(index, newValue)}
                      onCancel={() => setEditingObjective(null)}
                      multiline={true}
                      className="text-gray-800 leading-relaxed font-medium text-lg flex-1"
                      style={{ fontSize: '1.125rem', lineHeight: '1.75rem' }}
                    />
                  ) : (
                    <span 
                      className={`text-gray-800 leading-relaxed font-medium text-lg ${isEditable ? 'cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 flex-1' : ''}`}
                      onClick={() => isEditable && setEditingObjective(index)}
                    >
                      {objective}
                    </span>
                  )}
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
            return editableLessonPlanData.suggestedPrompts.find(prompt => {
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
                  product={products.videoLesson}
                  timingData={timingData}
                  isEditable={isEditable}
                  editingPrompt={editingPrompt}
                  onPromptSave={handlePromptSave}
                  onPromptEditStart={setEditingPrompt}
                  onPromptEditCancel={() => setEditingPrompt(null)}
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
                  product={products.presentation}
                  timingData={timingData}
                  isEditable={isEditable}
                  editingPrompt={editingPrompt}
                  onPromptSave={handlePromptSave}
                  onPromptEditStart={setEditingPrompt}
                  onPromptEditCancel={() => setEditingPrompt(null)}
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
                  product={products.quiz}
                  timingData={timingData}
                  isEditable={isEditable}
                  editingPrompt={editingPrompt}
                  onPromptSave={handlePromptSave}
                  onPromptEditStart={setEditingPrompt}
                  onPromptEditCancel={() => setEditingPrompt(null)}
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
                  product={products.onePager}
                  timingData={timingData}
                  isEditable={isEditable}
                  editingPrompt={editingPrompt}
                  onPromptSave={handlePromptSave}
                  onPromptEditStart={setEditingPrompt}
                  onPromptEditCancel={() => setEditingPrompt(null)}
                />
              );
            }

            return null;
          }).filter(Boolean);
        })()}

        {/* Resources */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 md:p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Wrench className="w-6 h-6 text-white" />
      </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Resources</h2>
          </div>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 md:p-8 border border-cyan-100">
            <ul className="space-y-4">
              {(() => {
                // Mock data for now - preserving original logic structure
                const mockResources = [
                  'Role_and_Responsibility_Matrix_RACI.xlsx',
                  'Corporate_Structure_Overview.pptx',
                  'Company_Org_Chart_Official_Q3_2025.pdf',
                  'Our_Business_Units_and_Divisions.docx',
                  'Leadership_Bios_and_Direct_Reports.pdf',
                  'Employee_Handbook_Section_2_Our_Structure.pdf'
                ];

                // Original logic (commented out but preserved):
                // const separatorIndex = lessonPlanData.materials?.findIndex(m => m.includes('Additional Resources')) || -1;
                // const sourceMaterials = separatorIndex > 0 ? lessonPlanData.materials.slice(0, separatorIndex) : lessonPlanData.materials;
                // const filteredSourceMaterials = sourceMaterials?.filter(m => m.trim() !== '') || [];
                // const resourcesToShow = filteredSourceMaterials.length > 0 ? filteredSourceMaterials : mockResources;
                
                const resourcesToShow = mockResources;

                return resourcesToShow.map((material, index) => (
                    <li key={index} className="flex items-start group">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full mt-2 mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform"></div>
                      <span className="text-gray-800 leading-relaxed font-medium text-lg">{material}</span>
                    </li>
                ));
              })()}
            </ul>
          </div>
        </div>

        {/* Connectors */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 md:p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Connectors</h2>
          </div>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 md:p-8 border border-cyan-100">
            <ul className="space-y-4">
              {connectorConfigs.map((connector) => (
                <li key={connector.id} className="flex items-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm mr-4 flex-shrink-0">
                    <Image
                      src={connector.logoPath}
                      alt={`${connector.name} logo`}
                      width={32}
                      height={32}
                      className="object-contain w-8 h-8"
                      priority={false}
                      unoptimized={true}
                    />
                  </div>
                  <span className="text-gray-800 leading-relaxed font-medium text-lg">{connector.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
  product?: ProjectListItem;
  timingData?: { creationTimes: any; completionTimes: any } | null;
  isEditable?: boolean;
  editingPrompt?: string | null;
  onPromptSave?: (productName: string, newValue: string) => void;
  onPromptEditStart?: (productName: string) => void;
  onPromptEditCancel?: () => void;
}> = ({ title, data, prompt, loading, product, timingData, isEditable = false, editingPrompt, onPromptSave, onPromptEditStart, onPromptEditCancel }) => {
  // Filter out title and first paragraph from one-pager content
  const getFilteredData = (originalData: any) => {
    if (!originalData || !originalData.contentBlocks) {
      return originalData;
    }

    const filteredBlocks = originalData.contentBlocks.filter((block: any, index: number) => {
      // Skip first title block (usually headline type)
      if (index === 0 && (block.type === 'headline' || block.type === 'title')) {
        return false;
      }
      // Skip first paragraph block after title
      if (index === 1 && block.type === 'paragraph') {
        return false;
      }
      return true;
    });

    return {
      ...originalData,
      contentBlocks: filteredBlocks
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 md:p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
            <Play className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h2>
        </div>
        {timingData && (
          <div className="flex gap-6 text-blue-600 font-semibold">
            <span>Creation time: {timingData.creationTimes.videoLesson || 'N/A'}</span>
            <span>Completion time: {timingData.completionTimes.videoLesson || 'N/A'}</span>
          </div>
        )}
      </div>
      
      {/* One-Pager Content */}
      <div className="mb-8">
        {loading ? (
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl">
            <div className="text-gray-500">Loading content...</div>
          </div>
        ) : data ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden w-full">
          <div className="[&_.min-h-screen]:!min-h-0 [&_.min-h-screen]:!p-0 [&_.shadow-lg]:!shadow-none [&_.mx-auto]:!mx-0 [&_.my-6]:!my-0 [&_.max-w-3xl]:!max-w-none [&>div:first-child]:!p-0 [&>div:first-child>div:first-child]:!p-0 [&_h1]:!text-3xl [&_h2]:!text-2xl [&_h3]:!text-xl [&_p]:!text-sm [&_li]:!text-sm [&_span]:!text-sm [&_p]:!pl-4 [&_li]:!pl-4 [&_h1]:!pl-4 [&_h2]:!pl-4 [&_h3]:!pl-4">
            <TextPresentationDisplay 
              dataToDisplay={getFilteredData(data)}
              isEditing={false}
            />
          </div>
        </div>
        ) : (
          <FallbackOnePagerContent />
        )}
      </div>

            {/* Video Creation Prompt */}
      <div className="bg-[#EFF6FF] border border-blue-200 rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <h4 className="text-blue-700 font-bold text-lg uppercase tracking-wide">
            VIDEO LESSON CREATION PROMPT:
          </h4>
        </div>
        {isEditable && editingPrompt === 'video-lesson' ? (
          <InlineEditor
            initialValue={prompt}
            onSave={(newValue) => { onPromptSave?.('video-lesson', newValue); }}
            onCancel={onPromptEditCancel || (() => {})}
            multiline={true}
            className="text-gray-800 leading-relaxed font-medium"
            style={{ fontSize: '1rem', lineHeight: '1.625rem', whiteSpace: 'pre-wrap' }}
          />
        ) : (
          <div 
            className={`text-gray-800 leading-relaxed whitespace-pre-wrap font-medium ${isEditable ? 'cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2' : ''}`}
            onClick={() => isEditable && onPromptEditStart?.('video-lesson')}
          >
            {prompt}
          </div>
        )}
      </div>
    </div>
  );
};

const PresentationBlock: React.FC<{
  title: string;
  data: any;
  prompt: string;
  loading: boolean;
  product?: ProjectListItem;
  timingData?: { creationTimes: any; completionTimes: any } | null;
  isEditable?: boolean;
  editingPrompt?: string | null;
  onPromptSave?: (productName: string, newValue: string) => void;
  onPromptEditStart?: (productName: string) => void;
  onPromptEditCancel?: () => void;
}> = ({ title, data, prompt, loading, product, timingData, isEditable = false, editingPrompt, onPromptSave, onPromptEditStart, onPromptEditCancel }) => {

  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 md:p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
            <Presentation className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h2>
        </div>
        {product && timingData && (
          <div className="flex gap-6 text-blue-600 font-semibold">
            <span>Creation time: {timingData.creationTimes.presentation}</span>
            <span>Completion time: {timingData.completionTimes.presentation}</span>
          </div>
        )}
      </div>
      
      {/* Slide Display using SmartSlideDeckViewer */}
      <div className="mb-8">
        {loading ? (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl">
            <div className="text-gray-500">Loading slides...</div>
          </div>
        ) : data ? (
          <CarouselSlideDeckViewer deck={data} />
        ) : (
          <FallbackPresentationCarousel />
        )}
      </div>

      {/* Presentation Creation Prompt */}
      <div className="bg-[#EFF6FF] border border-blue-200 rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <h4 className="text-blue-700 font-bold text-lg uppercase tracking-wide">
            PRESENTATION CREATION PROMPT:
          </h4>
        </div>
        {isEditable && editingPrompt === 'presentation' ? (
          <InlineEditor
            initialValue={prompt}
            onSave={(newValue) => { onPromptSave?.('presentation', newValue); }}
            onCancel={onPromptEditCancel || (() => {})}
            multiline={true}
            className="text-gray-800 leading-relaxed font-medium"
            style={{ fontSize: '1rem', lineHeight: '1.625rem', whiteSpace: 'pre-wrap' }}
          />
        ) : (
          <div 
            className={`text-gray-800 leading-relaxed whitespace-pre-wrap font-medium ${isEditable ? 'cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2' : ''}`}
            onClick={() => isEditable && onPromptEditStart?.('presentation')}
          >
            {prompt}
          </div>
        )}
      </div>
    </div>
  );
};

const QuizBlock: React.FC<{
  title: string;
  data: any;
  prompt: string;
  loading: boolean;
  product?: ProjectListItem;
  timingData?: { creationTimes: any; completionTimes: any } | null;
  isEditable?: boolean;
  editingPrompt?: string | null;
  onPromptSave?: (productName: string, newValue: string) => void;
  onPromptEditStart?: (productName: string) => void;
  onPromptEditCancel?: () => void;
}> = ({ title, data, prompt, loading, product, timingData, isEditable = false, editingPrompt, onPromptSave, onPromptEditStart, onPromptEditCancel }) => {

  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 md:p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
            <FileQuestion className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h2>
        </div>
        {product && timingData && (
          <div className="flex gap-6 text-blue-600 font-semibold">
            <span>Creation time: {timingData.creationTimes.quiz}</span>
            <span>Completion time: {timingData.completionTimes.quiz}</span>
          </div>
        )}
      </div>
      
      {/* Quiz Display using QuizDisplay component */}
      <div className="mb-8">
        {loading ? (
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl">
            <div className="text-gray-500">Loading questions...</div>
          </div>
        ) : data ? (
          <CarouselQuizDisplay dataToDisplay={data} />
        ) : (
          <FallbackQuizCarousel />
        )}
      </div>

      {/* Quiz Creation Prompt */}
      <div className="bg-[#EFF6FF] border border-blue-200 rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <h4 className="text-blue-700 font-bold text-lg uppercase tracking-wide">
            QUIZ CREATION PROMPT:
          </h4>
        </div>
        {isEditable && editingPrompt === 'quiz' ? (
          <InlineEditor
            initialValue={prompt}
            onSave={(newValue) => { onPromptSave?.('quiz', newValue); }}
            onCancel={onPromptEditCancel || (() => {})}
            multiline={true}
            className="text-gray-800 leading-relaxed font-medium"
            style={{ fontSize: '1rem', lineHeight: '1.625rem', whiteSpace: 'pre-wrap' }}
          />
        ) : (
          <div 
            className={`text-gray-800 leading-relaxed whitespace-pre-wrap font-medium ${isEditable ? 'cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2' : ''}`}
            onClick={() => isEditable && onPromptEditStart?.('quiz')}
          >
            {prompt}
          </div>
        )}
      </div>
    </div>
  );
};

const OnePagerBlock: React.FC<{
  title: string;
  data: any;
  prompt: string;
  loading: boolean;
  product?: ProjectListItem;
  timingData?: { creationTimes: any; completionTimes: any } | null;
  isEditable?: boolean;
  editingPrompt?: string | null;
  onPromptSave?: (productName: string, newValue: string) => void;
  onPromptEditStart?: (productName: string) => void;
  onPromptEditCancel?: () => void;
}> = ({ title, data, prompt, loading, product, timingData, isEditable = false, editingPrompt, onPromptSave, onPromptEditStart, onPromptEditCancel }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 md:p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
            <ScrollText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h2>
        </div>
        {product && timingData && (
          <div className="flex gap-6 text-blue-600 font-semibold">
            <span>Creation time: {timingData.creationTimes.onePager}</span>
            <span>Completion time: {timingData.completionTimes.onePager}</span>
          </div>
        )}
      </div>
      
      {/* One-Pager Content */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">One-Pager Content</h3>
        {loading ? (
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl">
            <div className="text-gray-500">Loading content...</div>
          </div>
        ) : data ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-4xl mx-auto">
          <div className="[&_.max-w-3xl]:!max-w-2xl [&_.mx-auto]:!mx-0 [&_p]:!text-sm [&_li]:!text-sm [&_span]:!text-sm [&_p]:!pl-4 [&_li]:!pl-4 [&_h1]:!pl-4 [&_h2]:!pl-4 [&_h3]:!pl-4">
            <TextPresentationDisplay 
                dataToDisplay={data}
               isEditing={false}
             />
          </div>
        </div>
        ) : (
          <FallbackOnePagerContent />
        )}
      </div>

      {/* One-Pager Creation Prompt */}
      <div className="bg-[#EFF6FF] border border-blue-200 rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <h4 className="text-blue-700 font-bold text-lg uppercase tracking-wide">
            ONE-PAGER CREATION PROMPT:
          </h4>
        </div>
        {isEditable && editingPrompt === 'one-pager' ? (
          <InlineEditor
            initialValue={prompt}
            onSave={(newValue) => { onPromptSave?.('one-pager', newValue); }}
            onCancel={onPromptEditCancel || (() => {})}
            multiline={true}
            className="text-gray-800 leading-relaxed font-medium"
            style={{ fontSize: '1rem', lineHeight: '1.625rem', whiteSpace: 'pre-wrap' }}
          />
        ) : (
          <div 
            className={`text-gray-800 leading-relaxed whitespace-pre-wrap font-medium ${isEditable ? 'cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2' : ''}`}
            onClick={() => isEditable && onPromptEditStart?.('one-pager')}
          >
            {prompt}
          </div>
        )}
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
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
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
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden w-full">
      <div className="[&_.min-h-screen]:!min-h-0 [&_.min-h-screen]:!p-0 [&_.shadow-lg]:!shadow-none [&_.mx-auto]:!mx-0 [&_.my-6]:!my-0 [&_.max-w-3xl]:!max-w-none [&>div:first-child]:!p-0 [&>div:first-child>div:first-child]:!p-0 [&_h1]:!text-3xl [&_h2]:!text-2xl [&_h3]:!text-xl [&_p]:!text-sm [&_li]:!text-sm [&_span]:!text-sm [&_p]:!pl-4 [&_li]:!pl-4 [&_h1]:!pl-4 [&_h2]:!pl-4 [&_h3]:!pl-4">
        <TextPresentationDisplay 
          dataToDisplay={fallbackOnePagerData as any}
          isEditing={false}
        />
      </div>
    </div>
  );
};

// Carousel version of SmartSlideDeckViewer - smaller slides with side arrows
const CarouselSlideDeckViewer: React.FC<{ deck: ComponentBasedSlideDeck }> = ({ deck }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  
  if (!deck || !deck.slides || deck.slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl">
        <div className="text-gray-500">No slides available</div>
        </div>
    );
  }

  const nextSlide = () => {
    if (isTransitioning) return;
    setSlideDirection('right');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % deck.slides.length);
      setIsTransitioning(false);
    }, 150);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setSlideDirection('left');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev - 1 + deck.slides.length) % deck.slides.length);
      setIsTransitioning(false);
    }, 150);
  };

  const currentSlide = deck.slides[currentSlideIndex];

  return (
    <div className="relative flex items-center justify-center" style={{ minHeight: '500px' }}>
      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        disabled={deck.slides.length <= 1}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

            {/* Slide Content - Proper 16:9 Landscape Aspect Ratio */}
      <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-16">
                <div
          className="professional-slide relative bg-white overflow-hidden transition-transform duration-300 ease-in-out"
          style={{
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        width: '100%',
            maxWidth: '1000px',
            aspectRatio: '16/10', // Slightly more flexible than 16:9
            minHeight: '500px',
            maxHeight: '750px',
            transform: isTransitioning ? (slideDirection === 'right' ? 'translateX(-20px)' : 'translateX(20px)') : 'translateX(0px)'
          }}
        >
          <div style={{ width: '100%', height: '100%' }}>
            <ComponentBasedSlideRenderer
              slide={currentSlide}
              isEditable={false}
              theme="default"
            />
        </div>
      </div>
        
        {/* Slide Counter */}
        <div className="mt-4 text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm border">
          Slide {currentSlideIndex + 1} of {deck.slides.length}
        </div>
      </div>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        disabled={deck.slides.length <= 1}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// Carousel version of QuizDisplay - exact copy but with carousel navigation
const CarouselQuizDisplay: React.FC<{ dataToDisplay: any }> = ({ dataToDisplay }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [showAnswers, setShowAnswers] = useState(true); // Always show answers in lesson plan view
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  
  if (!dataToDisplay || !dataToDisplay.questions || dataToDisplay.questions.length === 0) {
  return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl">
        <div className="text-gray-500">No questions available</div>
        </div>
    );
  }

  const questions = Array.isArray(dataToDisplay.questions) ? dataToDisplay.questions : [];
  
  const nextQuestion = () => {
    if (isTransitioning) return;
    setSlideDirection('right');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
      setIsTransitioning(false);
    }, 150);
  };

  const prevQuestion = () => {
    if (isTransitioning) return;
    setSlideDirection('left');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentQuestionIndex((prev) => (prev - 1 + questions.length) % questions.length);
      setIsTransitioning(false);
    }, 150);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const questionNumber = currentQuestionIndex + 1;

  // Exact same renderMultipleChoice as QuizDisplay
  const renderMultipleChoice = (question: MultipleChoiceQuestion, index: number) => {
    const isCorrect = userAnswers[index] === question.correct_option_id;
    const showResult = showAnswers;

    return (
      <div className="mt-4">
        <div className="space-y-2">
          {question.options.map((option, optIndex) => (
            <div key={option.id} className="flex items-start">
              <div className="flex items-center h-5">
                <div 
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    option.id === question.correct_option_id ? 'border-[#2563eb] bg-[#2563eb]' : 'border-gray-300'
                  }`}
                >
                  {option.id === question.correct_option_id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
      </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <span className="font-medium mr-2 text-black">
                    {String.fromCharCode(65 + optIndex)}.
                  </span>
                  <span className="text-black">{option.text}</span>
                </div>
              </div>
            </div>
          ))}
      </div>
      
        </div>
    );
  };

  // Exact same renderMultiSelect as QuizDisplay  
  const renderMultiSelect = (question: MultiSelectQuestion, index: number) => {
    const userAnswer = userAnswers[index] || [];

    let correctIds: string[] = [];
    if (Array.isArray(question.correct_option_ids)) {
      correctIds = question.correct_option_ids;
    } else if (typeof question.correct_option_ids === 'string') {
      correctIds = question.correct_option_ids.split(',').filter(id => id.trim() !== '');
    }

    const isCorrect = correctIds.every((id: string) => userAnswer.includes(id)) &&
                     userAnswer.every((id: string) => correctIds.includes(id));
    const showResult = showAnswers;

    return (
      <div className="mt-4">
        <div className="space-y-2">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-start">
              <div className="flex items-center h-5">
                <div 
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    correctIds.includes(option.id) ? 'border-[#2563eb] bg-[#2563eb]' : 'border-gray-300'
                  }`}
                >
                  {correctIds.includes(option.id) && (
                    <div className="w-2 h-2 bg-white" />
                  )}
      </div>
      </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <span className="text-black">{option.text}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Exact same renderQuestion as QuizDisplay
  const renderQuestion = (question: AnyQuizQuestion, index: number) => {
    const questionType = question.question_type;

    return (
      <div className="mb-8 p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-start mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2563eb] text-white font-semibold mr-3">
            {questionNumber}
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-black">{question.question_text}</h3>
        </div>
        </div>
        {questionType === 'multiple-choice' && renderMultipleChoice(question as MultipleChoiceQuestion, index)}
        {questionType === 'multi-select' && renderMultiSelect(question as MultiSelectQuestion, index)}
      </div>
    );
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Left Arrow */}
      <button
        onClick={prevQuestion}
        disabled={questions.length <= 1}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Question Content - Centered */}
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-16">
        <div 
          className="transition-transform duration-300 ease-in-out w-full"
          style={{
            transform: isTransitioning ? (slideDirection === 'right' ? 'translateX(-30px)' : 'translateX(30px)') : 'translateX(0px)'
          }}
        >
          {renderQuestion(currentQuestion, currentQuestionIndex)}
        </div>
        
        {/* Question Counter */}
        <div className="mt-4 text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm border">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      {/* Right Arrow */}
      <button
        onClick={nextQuestion}
        disabled={questions.length <= 1}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default LessonPlanView;

// Add CSS for the inline editors
const styles = `
  .inline-editor-input, .inline-editor-textarea {
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid #3b82f6;
    border-radius: 4px;
    padding: 2px 4px;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    color: inherit !important;
    line-height: inherit;
  }
  
  .inline-editor-input:focus, .inline-editor-textarea:focus {
    outline: none;
    border-color: #1d4ed8;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    color: inherit !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('lesson-plan-inline-editor-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'lesson-plan-inline-editor-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
 