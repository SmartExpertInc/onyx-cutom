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
  ClipboardList,
  Image,
  Presentation,
  TrendingUp,
  Users,
  Shield,
  Target,
  Zap,
  CheckCircle2,
  PieChart,
  LineChart,
  Award,
  Lightbulb,
  Briefcase,
  Heart,
  Calendar,
  Map,
  FileCheck,
  List,
  Layers
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
    'interest-growth-slide': 'Interest Growth + Photo Panel',
    'leftbar-avatar-image': 'Left Bar + Avatar + Image'
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
    'interest-growth-slide',
    'leftbar-avatar-image'
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
  // All video slides should have proper Lucide icons instead of emojis
  const iconOverrides: Record<string, React.ReactNode> = {
    'course-overview-slide': <ListChecks className="text-gray-700" />,
    'course-overview': <ListChecks className="text-gray-700" />,
    'work-life-balance-slide': <UserRound className="text-gray-700" />,
    'work-life-balance': <UserRound className="text-gray-700" />,
    'phishing-definition-slide': <BookOpenText className="text-gray-700" />,
    'phishing-definition': <BookOpenText className="text-gray-700" />,
    'culture-values-three-columns-slide': <Grid3X3 className="text-gray-700" />,
    'culture-values-three-columns': <Grid3X3 className="text-gray-700" />,
    'key-skills-data-analysis-slide': <BarChart3 className="text-gray-700" />,
    'key-skills-data-analysis': <BarChart3 className="text-gray-700" />,
    'percent-circles-slide': <PieChart className="text-gray-700" />,
    'percent-circles': <PieChart className="text-gray-700" />,
    'benefits-list-slide': <CheckCircle2 className="text-gray-700" />,
    'benefits-list': <CheckCircle2 className="text-gray-700" />,
    'impact-statements-slide': <Target className="text-gray-700" />,
    'impact-statements': <Target className="text-gray-700" />,
    'hybrid-work-best-practices-slide': <Briefcase className="text-gray-700" />,
    'hybrid-work': <Briefcase className="text-gray-700" />,
    'dei-methods-slide': <Users className="text-gray-700" />,
    'dei-methods': <Users className="text-gray-700" />,
    'company-tools-resources-slide': <FileText className="text-gray-700" />,
    'company-tools-resources': <FileText className="text-gray-700" />,
    'ai-pharma-market-growth-slide': <TrendingUp className="text-gray-700" />,
    'ai-pharma-market-growth': <TrendingUp className="text-gray-700" />,
    'critical-thinking-slide': <Lightbulb className="text-gray-700" />,
    'critical-thinking': <Lightbulb className="text-gray-700" />,
    'benefits-tags-slide': <Tags className="text-gray-700" />,
    'benefits-tags': <Tags className="text-gray-700" />,
    'kpi-update-slide': <LineChart className="text-gray-700" />,
    'kpi-update': <LineChart className="text-gray-700" />,
    'phishing-rise-slide': <BarChart3 className="text-gray-700" />,
    'phishing-rise': <BarChart3 className="text-gray-700" />,
    'soft-skills-assessment-slide': <ClipboardList className="text-gray-700" />,
    'soft-skills-assessment': <ClipboardList className="text-gray-700" />,
    'four-box-grid-slide': <LayoutGrid className="text-gray-700" />,
    'four-box-grid': <LayoutGrid className="text-gray-700" />,
    'solution-steps-slide': <ListChecks className="text-gray-700" />,
    'solution-steps': <ListChecks className="text-gray-700" />,
    'benefits-perks-columns-slide': <Heart className="text-gray-700" />,
    'benefits-perks-columns': <Heart className="text-gray-700" />,
    'benefits-and-perks-columns-slide': <Heart className="text-gray-700" />,
    'benefits-and-perks-columns': <Heart className="text-gray-700" />,
    'benefits-perks': <Heart className="text-gray-700" />,
    'soft-skills-types-slide': <Award className="text-gray-700" />,
    'soft-skills-types': <Award className="text-gray-700" />,
    'soft-skills': <Award className="text-gray-700" />,
    'skills-types': <Award className="text-gray-700" />,
    'psychological-safety-slide': <Shield className="text-gray-700" />,
    'psychological-safety': <Shield className="text-gray-700" />,
    'marketing-agency-thank-you-slide': <Presentation className="text-gray-700" />,
    'marketing-agency-thank-you': <Presentation className="text-gray-700" />,
    'problems-grid-slide': <LayoutGrid className="text-gray-700" />,
    'problems-grid': <LayoutGrid className="text-gray-700" />,
    'problems': <LayoutGrid className="text-gray-700" />,
    'problems-slide': <LayoutGrid className="text-gray-700" />,
    'soft-skills-develop-slide': <Zap className="text-gray-700" />,
    'soft-skills-develop': <Zap className="text-gray-700" />,
    'soft-skills-development': <Zap className="text-gray-700" />,
    'oral-hygiene-signs-slide': <Heart className="text-gray-700" />,
    'oral-hygiene-signs': <Heart className="text-gray-700" />,
    'oral-hygiene': <Heart className="text-gray-700" />,
    'high-performing-teams-slide': <Users className="text-gray-700" />,
    'high-performing-teams': <Users className="text-gray-700" />,
    'resilience-behaviors-slide': <Target className="text-gray-700" />,
    'resilience-behaviors': <Target className="text-gray-700" />,
    'resilience': <Target className="text-gray-700" />,
    'stay-safe-tips-slide': <Shield className="text-gray-700" />,
    'stay-safe-tips': <Shield className="text-gray-700" />,
    'stay-safe': <Shield className="text-gray-700" />,
    'topics': <List className="text-gray-700" />,
    'resources-list-slide': <FileText className="text-gray-700" />,
    'table-of-contents-slide': <Layers className="text-gray-700" />,
    'course-rules-timeline-slide': <Calendar className="text-gray-700" />,
    'impact-metrics-right-image': <Image className="text-gray-700" />,
    'enterprise-roadmap-slide': <Map className="text-gray-700" />,
    'enterprise-roadmap': <Map className="text-gray-700" />,
    'thank-you-slide': <UserRound className="text-gray-700" />,
    'interest-growth-slide': <BarChart3 className="text-gray-700" />,
    'leftbar-avatar-image': <Image className="text-gray-700" />
  };

  const renderIcon = (templateId: string) => {
    // Always use Lucide icons, never emojis from registry
    const icon = iconOverrides[templateId];
    return (
      <div className="w-6 h-6 flex items-center justify-center">
        {icon ?? <LayoutGrid className="text-gray-700" />}
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
                {renderIcon(template.id)}
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
