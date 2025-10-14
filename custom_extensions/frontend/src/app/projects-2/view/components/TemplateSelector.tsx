"use client";

import React from 'react';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { getAllTemplates, getTemplate } from '@/components/templates/registry';

interface TemplateSelectorProps {
  currentSlideCount: number;
  onAddSlide: (newSlide: ComponentBasedSlide) => void;
}

export default function TemplateSelector({ currentSlideCount, onAddSlide }: TemplateSelectorProps) {
  // Get available templates
  const availableTemplates = getAllTemplates();

  // Add new slide with template selection
  const handleAddSlide = (templateId: string) => {
    const template = getTemplate(templateId);
    if (!template) {
      console.error(`Template ${templateId} not found`);
      return;
    }

    const newSlide: ComponentBasedSlide = {
      slideId: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slideNumber: currentSlideCount + 1,
      templateId: templateId,
      props: {
        ...template.defaultProps,
        title: template.defaultProps.title || `Slide ${currentSlideCount + 1}`,
        content: template.defaultProps.content || 'Add your content here...'
      },
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0'
      }
    };

    console.log('🔍 TemplateSelector: Creating new slide:', {
      templateId,
      template,
      newSlide
    });

    onAddSlide(newSlide);
  };

  return (
    <div className="h-full bg-white relative w-full border-0 overflow-y-auto">
      <div className="relative z-10 flex flex-col items-start justify-start w-full p-4">
        {/* Header */}
        <div className="w-full mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Choose Template</h2>
          <p className="text-sm text-gray-600 mt-1">Select a template to add a new slide</p>
        </div>

        {/* Template List */}
        <div className="w-full space-y-2">
          {availableTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleAddSlide(template.id)}
              className="w-full p-4 border border-gray-200 rounded-lg bg-white cursor-pointer flex items-start gap-3 text-left transition-all hover:border-blue-500 hover:bg-blue-50 group"
            >
              {/* Icon */}
              <div className="flex-shrink-0 text-2xl mt-0.5 group-hover:scale-110 transition-transform">
                {template.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-700">
                  {template.name}
                </div>
                <div className="text-xs text-gray-600 leading-relaxed group-hover:text-blue-600">
                  {template.description}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-blue-500"
                >
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Empty state if no templates */}
        {availableTemplates.length === 0 && (
          <div className="w-full text-center py-12">
            <div className="text-gray-400 text-4xl mb-2">📋</div>
            <p className="text-gray-600">No templates available</p>
          </div>
        )}
      </div>
    </div>
  );
}
