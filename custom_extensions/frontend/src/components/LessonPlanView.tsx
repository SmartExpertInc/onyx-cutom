"use client";

import React from 'react';
import { BookOpen, Target, FileText, Package, Wrench, Lightbulb, Eye, Play, Presentation, FileQuestion, ScrollText, ChevronRight, Home, GraduationCap, Layers } from 'lucide-react';
import { LessonPlanData } from '@/types/projectSpecificTypes';

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

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
              {lessonPlanData.lessonTitle}
            </h2>
                          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
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

        {/* Content Draft */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 md:p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Content Draft</h2>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 md:p-6 border border-blue-100">
            <div className="space-y-6">
              {lessonPlanData.contentDevelopmentSpecifications.map((block, index) => (
                <div key={index}>
                  {block.type === 'text' ? (
                    // Text Block
                    <div className="p-2 md:p-3">
                      <h3 className="font-bold text-blue-800 mb-3 text-base md:text-lg">
                        {block.block_title}
                      </h3>
                      <div className="text-gray-700 leading-relaxed">
                        {(() => {
                          // Pre-process the content to ensure inline list markers (e.g. " - " or " 1. ")
                          // are moved onto new lines so they can be detected and rendered as lists.
                          const processedContent = block.block_content
                            // Insert a newline before any hyphen that denotes a bullet list item
                            .replace(/(?:^|\s)-\s+/g, '\n- ')
                            // Insert a newline before numbers followed by a dot that denote numbered list items
                            .replace(/(?:^|\s)(\d+)\.\s+/g, '\n$1. ');

                          const lines = processedContent.split('\n').filter(line => line.trim() !== '');
                          const hasBulletList = lines.some(line => line.trim().startsWith('- '));
                          const hasNumberedList = lines.some(line => /^\d+\./.test(line.trim()));
                          
                          if (hasBulletList) {
                            // Extract bullet list items and non-list content
                            const bulletItems = lines
                              .filter(line => line.trim().startsWith('- '))
                              .map(line => line.trim().substring(2));
                            const nonListContent = lines
                              .filter(line => !line.trim().startsWith('- '))
                              .join('\n');
                            
                            return (
                              <>
                                {nonListContent.trim() && (
                                  <div className="mb-4">
                                    {nonListContent.split('\n').map((paragraph, pIndex) => (
                                      paragraph.trim() && (
                                        <p key={pIndex} className="mb-3 last:mb-0">
                                          {paragraph}
                                        </p>
                                      )
                                    ))}
                                  </div>
                                )}
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                  {bulletItems.map((item, itemIndex) => (
                                    <li key={itemIndex} className="text-gray-700">{item}</li>
                                  ))}
                                </ul>
                              </>
                            );
                          } else if (hasNumberedList) {
                            // Extract numbered list items and non-list content
                            const numberedItems = lines
                              .filter(line => /^\d+\./.test(line.trim()))
                              .map(line => line.replace(/^\d+\.\s*/, ''));
                            const nonListContent = lines
                              .filter(line => !/^\d+\./.test(line.trim()))
                              .join('\n');
                            
                            return (
                              <>
                                {nonListContent.trim() && (
                                  <div className="mb-4">
                                    {nonListContent.split('\n').map((paragraph, pIndex) => (
                                      paragraph.trim() && (
                                        <p key={pIndex} className="mb-3 last:mb-0">
                                          {paragraph}
                                        </p>
                                      )
                                    ))}
                                  </div>
                                )}
                                <ol className="list-decimal list-inside space-y-2 ml-4">
                                  {numberedItems.map((item, itemIndex) => (
                                    <li key={itemIndex} className="text-gray-700">{item}</li>
                                  ))}
                                </ol>
                              </>
                            );
                          } else {
                            // Plain text only
                            return (
                              <>
                                {lines.map((paragraph, pIndex) => (
                                  <p key={pIndex} className="mb-3 last:mb-0">
                                    {paragraph}
                                  </p>
                                ))}
                              </>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  ) : (
                    // Product Block
                    <div className="bg-white rounded-lg p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <h3 className="font-bold text-blue-800 mb-4 capitalize flex items-center text-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        {block.product_name.replace(/-/g, ' ')}
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">{block.product_description}</p>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSeePrompt(block.product_name)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          See Prompt
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
          </div>
          {/* Source Materials Section */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <ul className="space-y-3">
                {(() => {
                  // Find the separator index
                  const separatorIndex = lessonPlanData.materials.findIndex(m => m.includes('Additional Resources'));
                  const sourceMaterials = separatorIndex > 0 ? lessonPlanData.materials.slice(0, separatorIndex) : lessonPlanData.materials;
                  
                  // Filter out empty strings
                  const filteredSourceMaterials = sourceMaterials.filter(m => m.trim() !== '');
                  
                  return filteredSourceMaterials.length > 0 ? filteredSourceMaterials.map((material, index) => (
                    <li key={index} className="flex items-start group">
                      <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform"></div>
                      <span className="text-gray-800 leading-relaxed font-semibold text-lg">{material}</span>
                    </li>
                  )) : (
                    <li className="flex items-start group">
                      <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0 shadow-sm"></div>
                      <span className="text-gray-800 leading-relaxed font-semibold text-lg">General Knowledge</span>
                    </li>
                  );
                })()}
              </ul>
            </div>
          </div>
          
          {/* Additional Resources Section */}
          {lessonPlanData.materials.some(m => m.includes('Additional Resources')) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Resources Needed:</h3>
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
                <ul className="space-y-3">
                  {lessonPlanData.materials
                    .slice(lessonPlanData.materials.findIndex(m => m.includes('Additional Resources')) + 1)
                    .filter(m => m.trim() !== '') // Filter out empty strings
                    .map((material, index) => (
                      <li key={index} className="flex items-start group">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full mt-2 mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform"></div>
                        <span className="text-gray-800 leading-relaxed font-medium text-lg">{material}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Content Creation Prompts */}
        <div id="prompts-section" className="bg-white rounded-xl shadow-lg border border-blue-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Content Creation Prompts</h2>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
            <div className="space-y-6">
              {lessonPlanData.suggestedPrompts.map((prompt, index) => {
                const lines = prompt.split('\n');
                const firstLine = lines[0];
                const titleMatch = firstLine.match(/\*\*(.+?)\*\*/);

                let title, content;
                if (titleMatch) {
                  // Title provided in bold markdown syntax
                  title = titleMatch[1];
                  content = lines.slice(1).join('\n').trim();
                } else {
                  // Remove any leading "XYZ Creation Prompt:" style prefix for cleaner content
                  const prefixCleanRegex = /^(video|presentation|quiz|one[ -]?pager) creation prompt[:\-]?\s*/i;
                  const cleanedFirstLine = firstLine.replace(prefixCleanRegex, '').trim();

                  // Determine type primarily from FIRST LINE (explicit intention) then fallback to whole prompt
                  const lowerFirst = firstLine.toLowerCase();
                  if (lowerFirst.includes('presentation')) {
                    title = 'Presentation Creation Prompt';
                  } else if (lowerFirst.includes('video')) {
                    title = 'Video Lesson Creation Prompt';
                  } else if (lowerFirst.includes('quiz')) {
                    title = 'Quiz Creation Prompt';
                  } else if (lowerFirst.includes('one-pager') || lowerFirst.includes('onepager')) {
                    title = 'One-Pager Creation Prompt';
                  } else {
                    // fallback based on overall content
                    const lowerPrompt = prompt.toLowerCase();
                    if (lowerPrompt.includes('video')) {
                      title = 'Video Lesson Creation Prompt';
                    } else if (lowerPrompt.includes('presentation')) {
                      title = 'Presentation Creation Prompt';
                    } else if (lowerPrompt.includes('quiz')) {
                      title = 'Quiz Creation Prompt';
                    } else if (lowerPrompt.includes('one-pager') || lowerPrompt.includes('onepager')) {
                      title = 'One-Pager Creation Prompt';
                    } else {
                      title = `Content Creation Prompt ${index + 1}`;
                    }
                  }

                  // Content should exclude any prefixing label line if it's generic
                  const remainingLines = [cleanedFirstLine, ...lines.slice(1)].join('\n').trim();
                  content = remainingLines;
                }
                
                // Ensure content is not empty
                if (!content || content.trim() === '') {
                  content = prompt; // Fallback to original prompt
                }
                
                // Extract product name from title for ID
                const productName = title.toLowerCase().includes('video') ? 'video-lesson' :
                                  title.toLowerCase().includes('presentation') ? 'presentation' :
                                  title.toLowerCase().includes('quiz') ? 'quiz' :
                                  title.toLowerCase().includes('one-pager') ? 'one-pager' :
                                  `product-${index}`;
                
                return (
                  <div key={index} id={`prompt-${productName}`} className="bg-white rounded-lg p-4 md:p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="mb-3">
                      <h3 className="font-bold text-blue-800 text-base md:text-lg uppercase tracking-wide">{title}</h3>
                    </div>
                    <div className="text-gray-800 leading-relaxed font-medium text-lg whitespace-pre-wrap">
                      {content}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 