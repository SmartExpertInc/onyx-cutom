"use client";

import React from 'react';
import { BookOpen, Target, FileText, Package, Wrench, Lightbulb, Eye, Video, Presentation, FileQuestion, FileText as FilePage, Layers } from 'lucide-react';
import { LessonPlanData } from '@/types/projectSpecificTypes';

interface LessonPlanViewProps {
  lessonPlanData: LessonPlanData;
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({ lessonPlanData }) => {
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

  // Helper function to get the appropriate icon for each product type
  const getProductIcon = (productName: string) => {
    const lowerName = productName.toLowerCase();
    if (lowerName.includes('video')) return Video;
    if (lowerName.includes('presentation')) return Presentation;
    if (lowerName.includes('quiz')) return FileQuestion;
    if (lowerName.includes('one-pager') || lowerName.includes('onepager')) return FilePage;
    return Layers; // Default icon
  };

  // Helper function to get product type color scheme
  const getProductColors = (productName: string) => {
    const lowerName = productName.toLowerCase();
    if (lowerName.includes('video')) return {
      bg: 'from-red-500 to-pink-600',
      text: 'text-red-800',
      border: 'border-red-200',
      lightBg: 'from-red-50 to-pink-50'
    };
    if (lowerName.includes('presentation')) return {
      bg: 'from-green-500 to-emerald-600',
      text: 'text-green-800',
      border: 'border-green-200',
      lightBg: 'from-green-50 to-emerald-50'
    };
    if (lowerName.includes('quiz')) return {
      bg: 'from-purple-500 to-violet-600',
      text: 'text-purple-800',
      border: 'border-purple-200',
      lightBg: 'from-purple-50 to-violet-50'
    };
    if (lowerName.includes('one-pager') || lowerName.includes('onepager')) return {
      bg: 'from-orange-500 to-amber-600',
      text: 'text-orange-800',
      border: 'border-orange-200',
      lightBg: 'from-orange-50 to-amber-50'
    };
    return {
      bg: 'from-blue-500 to-cyan-600',
      text: 'text-blue-800',
      border: 'border-blue-200',
      lightBg: 'from-blue-50 to-cyan-50'
    };
  };

  // Extract product blocks from content specifications
  const productBlocks = lessonPlanData.contentDevelopmentSpecifications.filter(block => block.type === 'product');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              {lessonPlanData.lessonTitle}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
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
        {productBlocks.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 md:p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Content Types</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productBlocks.map((block, index) => {
                const IconComponent = getProductIcon(block.product_name!);
                const colors = getProductColors(block.product_name!);
                
                return (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${colors.lightBg} rounded-xl p-6 border ${colors.border} hover:shadow-lg transition-all duration-200 hover:scale-105`}
                  >
                    <div className="flex items-center mb-4">
                      <div className={`w-10 h-10 bg-gradient-to-br ${colors.bg} rounded-lg flex items-center justify-center mr-3 shadow-sm`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <h3 className={`font-bold ${colors.text} text-lg capitalize`}>
                        {block.product_name!.replace(/-/g, ' ')}
                      </h3>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed text-sm mb-4 line-clamp-4">
                      {block.product_description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className={`text-xs ${colors.text} font-medium uppercase tracking-wide`}>
                        Content Outline
                      </div>
                      <button
                        onClick={() => handleSeePrompt(block.product_name!)}
                        className={`text-xs ${colors.text} hover:${colors.text.replace('800', '900')} font-medium flex items-center gap-1 transition-colors`}
                      >
                        <Eye className="w-3 h-3" />
                        View Prompt
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
 