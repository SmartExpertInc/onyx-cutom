"use client";

import React from 'react';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { getAllTemplates, getTemplate } from '@/components/templates/registry';

interface TemplateSelectorProps {
  currentSlideCount: number;
  onAddSlide: (newSlide: ComponentBasedSlide) => void;
}

export default function TemplateSelector({ currentSlideCount, onAddSlide }: TemplateSelectorProps) {
  // Get available templates (restricted to allowed list for video lessons)
  const allowedTemplateIds = new Set<string>([
    'course-overview-slide',
    'work-life-balance-slide',
    'phishing-definition-slide',
    'culture-values-three-columns',
    'percent-circles',
    'benefits-list-slide',
    'impact-statements-slide',
    'dei-methods',
    'company-tools-resources-slide',
    'ai-pharma-market-growth-slide',
    'critical-thinking-slide',
    'benefits-tags-slide',
    'kpi-update-slide',
    'phishing-rise-slide',
    'soft-skills-assessment-slide',
    'problems-grid',
    'solution-steps-slide',
    'hybrid-work-best-practices-slide'
  ]);

  const availableTemplates = getAllTemplates().filter(t => allowedTemplateIds.has(t.id));

  const displayNameById: Record<string, string> = {
    'course-overview-slide': 'Title + Big Avatar Right',
    'work-life-balance-slide': 'Text + Big Avatar',
    'phishing-definition-slide': 'Definitions + Right Image',
    'culture-values-three-columns': '3 Columns + Avatar',
    'percent-circles': 'Percent Circles + Avatar',
    'benefits-list-slide': 'List + Progress Dots + Avatar',
    'impact-statements-slide': 'Impact Metrics + Big Avatar Left',
    'dei-methods': 'Two Sections + Avatar Rings',
    'company-tools-resources-slide': '2x2 Grid Sections',
    'ai-pharma-market-growth-slide': 'Bars Right + Photo',
    'critical-thinking-slide': 'Highlighted Phrases + Logo',
    'benefits-tags-slide': 'Tags + Small Avatar',
    'kpi-update-slide': 'KPI Grid + Footer',
    'phishing-rise-slide': 'Text + Black Bar Chart + Actor',
    'soft-skills-assessment-slide': 'Tips List + Avatar',
    'problems-grid': '2x2 Problem Cards + Right Paragraph + Avatar',
    'solution-steps-slide': 'Steps Timeline + Footer',
    'hybrid-work-best-practices-slide': 'Numbered Practices + Team Image'
  };

  const PLACEHOLDER_TEXT = 'Add your text here';
  const sanitizeTextualProps = (value: any, key?: string): any => {
    if (typeof value === 'string') {
      const k = (key || '').toLowerCase();
      if (k.includes('title')) return value;
      return PLACEHOLDER_TEXT;
    }
    if (Array.isArray(value)) {
      return value.map((item) => sanitizeTextualProps(item));
    }
    if (value && typeof value === 'object') {
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) out[k] = sanitizeTextualProps(v, k);
      return out;
    }
    return value;
  };

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
      props: sanitizeTextualProps({
        ...template.defaultProps,
        title: template.defaultProps.title || `Slide ${currentSlideCount + 1}`,
        content: PLACEHOLDER_TEXT
      }) as any,
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
                  {displayNameById[template.id] || template.name}
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
