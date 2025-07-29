// custom_extensions/frontend/src/components/ComponentBasedSlideRenderer.tsx

import React from 'react';
import { ComponentBasedSlide, ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { SLIDE_TEMPLATE_REGISTRY } from './templates/registry';
import { SlideTheme, getSafeSlideTheme } from '@/types/slideThemes';

interface ComponentBasedSlideRendererProps {
  slides: ComponentBasedSlide[];
  onSlideUpdate?: (updatedSlide: ComponentBasedSlide) => void;
  onTemplateChange?: (slideId: string, newTemplateId: string) => void;
  theme?: string;
}

export const ComponentBasedSlideRenderer: React.FC<ComponentBasedSlideRendererProps> = ({
  slides,
  onSlideUpdate,
  onTemplateChange,
  theme
}) => {
  const handleSlideUpdate = (slideId: string, updates: Record<string, unknown>) => {
    const slide = slides.find(s => s.slideId === slideId);
    if (!slide) return;

    const updatedSlide: ComponentBasedSlide = {
      ...slide,
      props: {
        ...slide.props,
        ...updates
      }
    };

    onSlideUpdate?.(updatedSlide);
  };

  return (
    <div className="component-based-slide-renderer">
      {slides.map((slide) => {
        const templateInfo = SLIDE_TEMPLATE_REGISTRY[slide.templateId];
        
        if (!templateInfo) {
          console.warn(`Template not found: ${slide.templateId}`);
          return (
            <div key={slide.slideId} className="error-slide">
              <p>Template not found: {slide.templateId}</p>
            </div>
          );
        }

        const TemplateComponent = templateInfo.component;
        const themeObject = theme ? getSafeSlideTheme(theme) : getSafeSlideTheme();
        const templateProps = {
          ...slide.props,
          slideId: slide.slideId,
          onUpdate: (updates: Record<string, unknown>) => handleSlideUpdate(slide.slideId, updates),
          theme: themeObject
        };

        return (
          <div key={slide.slideId} className="slide-container">
            <TemplateComponent {...templateProps} />
          </div>
        );
      })}
    </div>
  );
};

export default ComponentBasedSlideRenderer; 