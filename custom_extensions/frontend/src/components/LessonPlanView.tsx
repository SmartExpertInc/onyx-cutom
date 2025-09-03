"use client";

import React from 'react';
import { BookOpen, Target, FileText, Package, Wrench, Lightbulb } from 'lucide-react';
import { LessonPlanData } from '@/types/projectSpecificTypes';

interface LessonPlanViewProps {
  lessonPlanData: LessonPlanData;
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({ lessonPlanData }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-6 shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              {lessonPlanData.lessonTitle}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {lessonPlanData.shortDescription}
            </p>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Learning Objectives</h2>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Content Development Specifications</h2>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            {(() => {
              const itemCount = Object.keys(lessonPlanData.recommendedProductTypes).length;
              const entries = Object.entries(lessonPlanData.recommendedProductTypes);

              if (itemCount === 1) {
                return (
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg p-6 border border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <h3 className="font-bold text-purple-800 mb-4 capitalize flex items-center text-lg">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                        {entries[0][0].replace(/-/g, ' ')}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{entries[0][1]}</p>
                    </div>
                  </div>
                );
              } else if (itemCount === 2) {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {entries.map(([productName, description]) => (
                      <div key={productName} className="bg-white rounded-lg p-6 border border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <h3 className="font-bold text-purple-800 mb-4 capitalize flex items-center text-lg">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                          {productName.replace(/-/g, ' ')}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{description}</p>
                      </div>
                    ))}
                  </div>
                );
              } else if (itemCount === 3) {
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {entries.slice(0, 2).map(([productName, description]) => (
                        <div key={productName} className="bg-white rounded-lg p-6 border border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <h3 className="font-bold text-purple-800 mb-4 capitalize flex items-center text-lg">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                            {productName.replace(/-/g, ' ')}
                          </h3>
                          <p className="text-gray-700 leading-relaxed">{description}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <h3 className="font-bold text-purple-800 mb-4 capitalize flex items-center text-lg">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                        {entries[2][0].replace(/-/g, ' ')}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{entries[2][1]}</p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {entries.map(([productName, description]) => (
                      <div key={productName} className="bg-white rounded-lg p-6 border border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <h3 className="font-bold text-purple-800 mb-4 capitalize flex items-center text-lg">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                          {productName.replace(/-/g, ' ')}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{description}</p>
                      </div>
                    ))}
                  </div>
                );
              }
            })()}
          </div>
        </div>

        {/* Development Resources */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Development Resources</h2>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
            <ul className="space-y-4">
              {lessonPlanData.materials.map((material, index) => (
                <li key={index} className="flex items-start group">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mt-2 mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform"></div>
                  <span className="text-gray-800 leading-relaxed font-medium text-lg">{material}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Content Creation Prompts */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Content Creation Prompts</h2>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
            <div className="space-y-6">
              {lessonPlanData.suggestedPrompts.map((prompt, index) => (
                <div key={index} className="bg-white rounded-lg p-6 border border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-3 h-3 bg-amber-500 rounded-full mr-4 mt-2 flex-shrink-0">
                    </div>
                    <p className="text-gray-800 leading-relaxed font-medium text-lg">{prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600 text-m leading-relaxed max-w-2xl mx-auto">
            This comprehensive lesson plan follows instructional design best practices and serves as a complete task specification for Content Developers.
          </p>
        </div>
      </div>
    </div>
  );
}; 