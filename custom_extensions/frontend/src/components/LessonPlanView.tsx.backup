"use client";

import React from 'react';
import { BookOpen, Target, FileText, Package, Wrench, Lightbulb } from 'lucide-react';
import { LessonPlanData } from '@/types/projectSpecificTypes';

interface LessonPlanViewProps {
  lessonPlanData: LessonPlanData;
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({ lessonPlanData }) => {
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

        {/* Content Development Specifications */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Content Development Specifications</h2>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
            <p className="text-sm text-gray-600 italic mb-6">
              A structured guide combining instructional content and product development specifications
            </p>
            <div className="space-y-6">
              {lessonPlanData.contentDevelopmentSpecifications.map((block, index) => (
                <div key={index}>
                  {block.type === 'text' ? (
                    // Text Block
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 shadow-sm">
                      <h3 className="font-bold text-blue-800 mb-4 text-lg">
                        {block.block_title}
                      </h3>
                      <div className="text-gray-700 leading-relaxed">
                        {(() => {
                          const lines = block.block_content.split('\n').filter(line => line.trim() !== '');
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
                      <p className="text-gray-700 leading-relaxed">{block.product_description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Development Resources */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Development Resources</h2>
          </div>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
            <ul className="space-y-4">
              {lessonPlanData.materials.map((material, index) => (
                <li key={index} className="flex items-start group">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full mt-2 mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform"></div>
                  <span className="text-gray-800 leading-relaxed font-medium text-lg">{material}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Content Creation Prompts */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Content Creation Prompts</h2>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
            <div className="space-y-6">
              {lessonPlanData.suggestedPrompts.map((prompt, index) => (
                <div key={index} className="bg-white rounded-lg p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-3 h-3 bg-blue-500 rounded-full mr-4 mt-2 flex-shrink-0">
                    </div>
                    <p className="text-gray-800 leading-relaxed font-medium text-lg">{prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 