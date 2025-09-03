"use client";

import React from 'react';
import { BookOpen, Target, FileText, Package, Wrench, Lightbulb } from 'lucide-react';
import { LessonPlanData } from '@/types/projectSpecificTypes';

interface LessonPlanViewProps {
  lessonPlanData: LessonPlanData;
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({ lessonPlanData }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {lessonPlanData.lessonTitle}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {lessonPlanData.shortDescription}
        </p>
      </div>

      {/* Learning Objectives */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Learning Objectives</h2>
          <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Measurable Outcomes</span>
        </div>
        <div className="bg-blue-50 rounded-lg p-6">
          <p className="text-sm text-blue-700 mb-4 italic">What learners will be able to demonstrate after completing this lesson:</p>
          <ul className="space-y-3">
            {lessonPlanData.lessonObjectives.map((objective, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed font-medium">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Content Development Specifications */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Content Development Specifications</h2>
          <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Product Requirements</span>
        </div>
        <div className="bg-purple-50 rounded-lg p-6">
          <p className="text-sm text-purple-700 mb-4 italic">Detailed specifications for Content Developers to create effective educational materials:</p>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(lessonPlanData.recommendedProductTypes).map(([productName, description]) => (
              <div key={productName} className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                <h3 className="font-semibold text-purple-800 mb-3 capitalize flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  {productName.replace(/-/g, ' ')}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Development Resources */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <Wrench className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Development Resources</h2>
          <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Tools & Materials</span>
        </div>
        <div className="bg-green-50 rounded-lg p-6">
          <p className="text-sm text-green-700 mb-4 italic">Essential resources and tools needed for content creation:</p>
          <ul className="space-y-3">
            {lessonPlanData.materials.map((material, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed font-medium">{material}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Content Creation Prompts */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Content Creation Prompts</h2>
          <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Actionable Tasks</span>
        </div>
        <div className="bg-yellow-50 rounded-lg p-6">
          <p className="text-sm text-yellow-700 mb-4 italic">Detailed prompts aligned with learning objectives for effective content development:</p>
          <div className="space-y-4">
            {lessonPlanData.suggestedPrompts.map((prompt, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 rounded-full mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-xs font-semibold text-yellow-700">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed font-medium">{prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-6 border-t border-gray-200">
        <div className="inline-flex items-center px-3 py-2 bg-gray-50 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          <p className="text-sm text-gray-600 font-medium">
            Instructional Design Specification
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This comprehensive lesson plan follows instructional design best practices and serves as a complete task specification for Content Developers.
        </p>
      </div>
    </div>
  );
}; 