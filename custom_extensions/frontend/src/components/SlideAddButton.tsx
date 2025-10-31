"use client";

// components/SlideAddButton.tsx
// Fixed-position slide adding button with template selection

import React, { useState, useRef, useEffect } from 'react';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { getAllTemplates, getTemplate } from './templates/registry';

interface SlideAddButtonProps {
  /** Current slide count for numbering */
  currentSlideCount: number;
  /** Callback when a new slide is added */
  onAddSlide: (newSlide: ComponentBasedSlide) => void;
  /** Whether the button should be visible */
  isVisible?: boolean;
  /** Positioning props - if not provided, uses default fixed positioning */
  position?: 'fixed' | 'absolute' | 'relative';
  left?: string | number;
  top?: string | number;
  transform?: string;
  /** Custom container styles */
  containerStyle?: React.CSSProperties;
}

export const SlideAddButton: React.FC<SlideAddButtonProps> = ({
  currentSlideCount,
  onAddSlide,
  isVisible = true,
  position = 'fixed',
  left = '20px',
  top = '50%',
  transform = 'translateY(-50%)',
  containerStyle = {}
}) => {
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{ x: number; y: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get available templates (restricted for video lesson slide options)
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

  // Set fixed position in left corner when dropdown opens
  useEffect(() => {
    if (showTemplateDropdown) {
      setButtonPosition({
        x: 16, // Fixed left position with small margin
        y: 150 // Fixed top position below toolbar
      });
    }
  }, [showTemplateDropdown]);

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

    console.log('🔍 SlideAddButton: Creating new slide:', {
      templateId,
      template,
      newSlide
    });

    onAddSlide(newSlide);
    setShowTemplateDropdown(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div 
        style={{
          position,
          left,
          top,
          transform,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          ...containerStyle
        }}
      >
        {/* Main Add Button */}
        <button
          onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.2s ease',
            marginBottom: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Add new slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      {/* Template Dropdown - Rendered at fixed position in left corner */}
      {showTemplateDropdown && buttonPosition && (
        <>
          {/* Background overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowTemplateDropdown(false)}
          />
          
          <div
            ref={dropdownRef}
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg"
            style={{
              left: `${buttonPosition.x}px`,
              top: `${buttonPosition.y}px`,
              minWidth: '320px',
              maxWidth: '400px',
              maxHeight: 'calc(100vh - 170px)', // Dynamic height to fit screen
              overflowY: 'auto'
            }}
          >
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Choose Template
            </h3>
            <button
              onClick={() => setShowTemplateDropdown(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                color: '#6b7280'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Template List */}
          <div style={{ padding: '4px 0' }}>
            {availableTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleAddSlide(template.id)}
                className="w-full px-4 py-3 border-none bg-transparent cursor-pointer flex items-center gap-3 text-left transition-colors hover:bg-gray-50 rounded-md"
              >
                <span style={{ fontSize: '18px' }}>{template.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="text-sm font-medium text-gray-900 mb-0.5">
                    {displayNameById[template.id] || template.name}
                  </div>
                  <div className="text-xs text-gray-600 leading-tight">
                    {template.description}
                  </div>
                </div>
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-gray-400 flex-shrink-0"
                >
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            ))}
          </div>
        </div>
        </>
      )}
    </>
  );
};

export default SlideAddButton; 