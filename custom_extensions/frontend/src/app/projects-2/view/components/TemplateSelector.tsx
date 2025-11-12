"use client";

import React from 'react';
import {
  LayoutGrid,
  Type,
  UserRound,
  BarChart3,
  ListChecks,
  Tags,
  BookOpenText,
  PanelsTopLeft,
  Grid3X3,
  FileText,
  ClipboardList
} from 'lucide-react';
import { ComponentBasedSlide, TemplateComponentInfo } from '@/types/slideTemplates';
import { getAllTemplates, getTemplate } from '@/components/templates/registry';

interface TemplateSelectorProps {
  currentSlideCount: number;
  onAddSlide: (newSlide: ComponentBasedSlide) => void;
}

export default function TemplateSelector({ currentSlideCount, onAddSlide }: TemplateSelectorProps) {
  // Override names for UI to reflect structural layout (Video Lesson only)
  const nameOverrides: Record<string, string> = {
    'course-overview-slide': 'Title + Bullets',
    'work-life-balance-slide': 'Text + Big Avatar',
    'phishing-definition-slide': 'Definition + Accent Badge',
    'culture-values-three-columns': 'Three Columns + Icons',  // ✅ Fixed: corrected ID
    'percent-circles': 'Percent Circles + Labels',            // ✅ Fixed: corrected ID
    'benefits-list-slide': 'Bulleted List + Checkmarks',
    'impact-statements-slide': 'Impact Statements + Callouts',
    'dei-methods': 'Methods Grid + Icons',                    // ✅ Fixed: corrected ID
    'company-tools-resources-slide': 'Resources List + Icon Left',
    'ai-pharma-market-growth-slide': 'Bar Chart + Photo',
    'critical-thinking-slide': 'Question + Supporting Points',
    'benefits-tags-slide': 'Tags + Small Avatar',
    'kpi-update-slide': 'KPI Cards + Trend Arrows',
    'phishing-rise-slide': 'Bar Chart + Narrative',
    'soft-skills-assessment-slide': 'Assessment Scale + Notes',
    'problems-grid': 'Problems Grid',                         // ✅ Fixed: corrected ID
    'solution-steps-slide': 'Numbered Steps + Icons',
    'hybrid-work-best-practices-slide': 'Tips List + Illustration',
    'thank-you-slide': 'Thank You + Contact Info',
    'interest-growth-slide': 'Interest Growth + Photo Panel'
  };

  const hasAvatarImageField = (template: TemplateComponentInfo) => {
    const schemaEntries = Object.entries(template.propSchema || {});
    return schemaEntries.some(([key, def]) => {
      if (!def || def.type !== 'image') return false;
      const lowerKey = key.toLowerCase();
      return lowerKey.includes('avatar') || lowerKey.includes('profile') || lowerKey.includes('actor');
    });
  };

  // Whitelist of all slide IDs that exist in avatar_slide_template.html
  // Only slides that are actually rendered in the HTML template
  const videoSlideWhitelist = new Set([
    'avatar-checklist',
    'avatar-crm',
    'avatar-service',
    'avatar-service-slide',
    'avatar-buttons',
    'avatar-with-buttons',
    'avatar-steps',
    'course-overview-slide',
    'course-overview',
    'work-life-balance-slide',
    'work-life-balance',
    'phishing-definition-slide',
    'phishing-definition',
    'culture-values-three-columns-slide',
    'culture-values-three-columns',
    'key-skills-data-analysis-slide',
    'key-skills-data-analysis',
    'percent-circles-slide',
    'percent-circles',
    'benefits-list-slide',
    'benefits-list',
    'impact-statements-slide',
    'impact-statements',
    'hybrid-work-best-practices-slide',
    'hybrid-work',
    'dei-methods-slide',
    'dei-methods',
    'company-tools-resources-slide',
    'company-tools-resources',
    'ai-pharma-market-growth-slide',
    'ai-pharma-market-growth',
    'critical-thinking-slide',
    'critical-thinking',
    'benefits-tags-slide',
    'benefits-tags',
    'kpi-update-slide',
    'kpi-update',
    'phishing-rise-slide',
    'phishing-rise',
    'soft-skills-assessment-slide',
    'soft-skills-assessment',
    'four-box-grid',
    'four-box-grid-slide',
    'solution-steps-slide',
    'solution-steps',
    'benefits-perks-columns-slide',
    'benefits-perks-columns',
    'benefits-and-perks-columns',
    'benefits-and-perks-columns-slide',
    'benefits-perks',
    'soft-skills-types-slide',
    'soft-skills-types',
    'soft-skills',
    'skills-types',
    'psychological-safety-slide',
    'psychological-safety',
    'marketing-agency-thank-you-slide',
    'marketing-agency-thank-you',
    'problems-grid-slide',
    'problems-grid',
    'problems',
    'problems-slide',
    'soft-skills-develop-slide',
    'soft-skills-develop',
    'soft-skills-development',
    'oral-hygiene-signs-slide',
    'oral-hygiene-signs',
    'oral-hygiene',
    'high-performing-teams-slide',
    'high-performing-teams',
    'resilience-behaviors-slide',
    'resilience-behaviors',
    'resilience',
    'stay-safe-tips-slide',
    'stay-safe-tips',
    'stay-safe',
    'topics',
    'resources-list-slide',
    'table-of-contents-slide',
    'course-rules-timeline-slide',
    'impact-metrics-right-image',
    'enterprise-roadmap-slide',
    'enterprise-roadmap',
    'thank-you-slide',
    'interest-growth-slide'
  ]);

  // Source ONLY templates that are in avatar_slide_template.html
  const excludedTemplateIds = new Set(['learning-topics-slide', 'learning-topics']);

  const availableTemplates = getAllTemplates()
    .filter(t => !t.id.endsWith('_old'))
    .filter(t => !(typeof t.name === 'string' && t.name.toLowerCase().includes('(old')))
    .filter(t => !excludedTemplateIds.has(t.id))
    .filter(t => videoSlideWhitelist.has(t.id)) // ONLY slides from avatar_slide_template.html
    .map(t => ({ ...t, name: nameOverrides[t.id] || t.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Lucide icon overrides to better visualize structure
  const iconOverrides: Record<string, React.ReactNode> = {
    'course-overview-slide': <ListChecks className="text-gray-700" />, // Title + bullets
    'work-life-balance-slide': <UserRound className="text-gray-700" />, // Big avatar + text
    'phishing-definition-slide': <BookOpenText className="text-gray-700" />, // Definition
    'culture-values-three-columns': <Grid3X3 className="text-gray-700" />, // 3 columns ✅ Fixed
    'percent-circles': <PanelsTopLeft className="text-gray-700" />, // Multi-cards ✅ Fixed
    'benefits-list-slide': <ListChecks className="text-gray-700" />, // Bullet list
    'impact-statements-slide': <Type className="text-gray-700" />, // Text callouts
    'dei-methods': <LayoutGrid className="text-gray-700" />, // Grid + icons ✅ Fixed
    'company-tools-resources-slide': <FileText className="text-gray-700" />, // List + icon
    'ai-pharma-market-growth-slide': <BarChart3 className="text-gray-700" />, // Bar chart + photo
    'critical-thinking-slide': <Type className="text-gray-700" />, // Question + points
    'benefits-tags-slide': <Tags className="text-gray-700" />, // Tags + avatar
    'kpi-update-slide': <BarChart3 className="text-gray-700" />, // KPI cards
    'phishing-rise-slide': <BarChart3 className="text-gray-700" />, // Bar chart narrative
    'soft-skills-assessment-slide': <Type className="text-gray-700" />, // Scale + notes
    'problems-grid': <LayoutGrid className="text-gray-700" />, // Grid of problems ✅ Fixed
    'solution-steps-slide': <ListChecks className="text-gray-700" />, // Numbered steps
    'hybrid-work-best-practices-slide': <BookOpenText className="text-gray-700" />, // Tips list
    'thank-you-slide': <UserRound className="text-gray-700" />, // Thank you + avatar
    'interest-growth-slide': <BarChart3 className="text-gray-700" /> // Interest growth + photo
  };

  const renderIcon = (templateId: string, fallback?: React.ReactNode) => {
    const icon = iconOverrides[templateId];
    return (
      <div className="w-6 h-6 flex items-center justify-center">
        {icon ?? fallback ?? <LayoutGrid className="text-gray-700" />}
      </div>
    );
  };

  const handleAddSlide = (templateId: string) => {
    const template = getTemplate(templateId);
    if (!template) {
      console.error(`Template ${templateId} not found`);
      return;
    }

    const placeholder = 'Add your text here';

    // Build props with placeholders for all text fields in the schema
    const initialProps: Record<string, any> = { ...template.defaultProps };
    const schema = (template as any).propSchema || {};
    Object.entries(schema).forEach(([key, def]: [string, any]) => {
      if (def?.type === 'text') {
        initialProps[key] = placeholder;
      }
    });

    // Recursively sanitize common narrative text fields across nested structures
    const narrativeKeys = new Set([
      'title', 'subtitle', 'description', 'content', 'text', 'body', 'paragraph', 'paragraphs', 'message'
    ]);
    const chartLabelSkipKeys = new Set(['year', 'valueLabel']);

    // Special placeholder for tags in benefits-tags-slide
    const tagPlaceholder = templateId === 'benefits-tags-slide' ? 'Add' : placeholder;

    const sanitize = (node: any) => {
      if (node && typeof node === 'object') {
        if (Array.isArray(node)) {
          node.forEach(sanitize);
        } else {
          Object.keys(node).forEach((k) => {
            const v = node[k];
            if (typeof v === 'string' && narrativeKeys.has(k)) {
              // Use "Add" for tag text fields in benefits-tags-slide
              node[k] = (templateId === 'benefits-tags-slide' && k === 'text') ? tagPlaceholder : placeholder;
            } else if (typeof v === 'string' && chartLabelSkipKeys.has(k)) {
              // leave chart-specific labels as-is
            } else if (Array.isArray(v) || (v && typeof v === 'object')) {
              sanitize(v);
            }
          });
        }
      }
    };

    sanitize(initialProps);

    const newSlide: ComponentBasedSlide = {
      slideId: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slideNumber: currentSlideCount + 1,
      templateId: templateId,
      props: initialProps,
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
              <div className="flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                {renderIcon(template.id, template.icon as any)}
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
            <div className="text-gray-400 flex items-center justify-center mb-2">
              <ClipboardList className="w-10 h-10" />
            </div>
            <p className="text-gray-600">No templates available</p>
          </div>
        )}
      </div>
    </div>
  );
}
