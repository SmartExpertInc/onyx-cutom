"use client";

import React from 'react';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { getAllTemplates, getTemplate } from '@/components/templates/registry';

interface TemplateSelectorProps {
  currentSlideCount: number;
  onAddSlide: (newSlide: ComponentBasedSlide) => void;
}

export default function TemplateSelector({ currentSlideCount, onAddSlide }: TemplateSelectorProps) {
  // Whitelist of template IDs allowed for Video Lessons only
  const allowedVideoTemplateIds = [
    'course-overview-slide',
    'work-life-balance-slide',
    'phishing-definition-slide',
    'culture-values-three-columns-slide',
    'percent-circles-slide',
    'benefits-list-slide',
    'impact-statements-slide',
    'dei-methods-slide',
    'company-tools-resources-slide',
    'ai-pharma-market-growth-slide',
    'critical-thinking-slide',
    'benefits-tags-slide',
    'kpi-update-slide',
    'phishing-rise-slide',
    'soft-skills-assessment-slide',
    'problems-grid-slide',
    'solution-steps-slide',
    'hybrid-work-best-practices-slide'
  ];

  // Override names for UI to reflect structural layout (Video Lesson only)
  const nameOverrides: Record<string, string> = {
    'course-overview-slide': 'Title + Bullets',
    'work-life-balance-slide': 'Text + Big Avatar',
    'phishing-definition-slide': 'Definition + Accent Badge',
    'culture-values-three-columns-slide': 'Three Columns + Icons',
    'percent-circles-slide': 'Percent Circles + Labels',
    'benefits-list-slide': 'Bulleted List + Checkmarks',
    'impact-statements-slide': 'Impact Statements + Callouts',
    'dei-methods-slide': 'Methods Grid + Icons',
    'company-tools-resources-slide': 'Resources List + Icon Left',
    'ai-pharma-market-growth-slide': 'Chart + Trend Callout',
    'critical-thinking-slide': 'Question + Supporting Points',
    'benefits-tags-slide': 'Tags + Small Avatar',
    'kpi-update-slide': 'KPI Cards + Trend Arrows',
    'phishing-rise-slide': 'Donut Chart + Stats',
    'soft-skills-assessment-slide': 'Assessment Scale + Notes',
    'problems-grid-slide': 'Problems Grid',
    'solution-steps-slide': 'Numbered Steps + Icons',
    'hybrid-work-best-practices-slide': 'Tips List + Illustration'
  };

  // Source all templates, then filter to video-allowed list only
  const availableTemplates = getAllTemplates()
    .filter(t => allowedVideoTemplateIds.includes(t.id))
    .map(t => ({ ...t, name: nameOverrides[t.id] || t.name }));

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
        content: 'Add your text here'
      },
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0'
      }
    };

    onAddSlide(newSlide);
  };

  return (
    <div className="h-full bg-white relative w-full border-0 overflow-y-auto">
      <div className="relative z-10 flex flex-col items-start justify-start w-full p-4">
        <div className="w-full mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Choose Template</h2>
          <p className="text-sm text-gray-600 mt-1">Select a template to add a new slide</p>
        </div>
        <div className="w-full space-y-2">
          {availableTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleAddSlide(template.id)}
              className="w-full p-4 border border-gray-200 rounded-lg bg-white cursor-pointer flex items-start gap-3 text-left transition-all hover:border-blue-500 hover:bg-blue-50 group"
            >
              <div className="flex-shrink-0 text-2xl mt-0.5 group-hover:scale-110 transition-transform">
                {template.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-700">
                  {template.name}
                </div>
                <div className="text-xs text-gray-600 leading-relaxed group-hover:text-blue-600">
                  {template.description}
                </div>
              </div>
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
