// custom_extensions/frontend/src/components/ComponentBasedSlideRenderer.tsx

import React from 'react';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { getTemplateResolved } from './templates/registry';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import HybridTemplateBase from './templates/base/HybridTemplateBase';

interface ComponentBasedSlideRendererProps {
  slide: ComponentBasedSlide;
  isEditable?: boolean;
  onSlideUpdate?: (updatedSlide: ComponentBasedSlide) => void;
  onTemplateChange?: (slideId: string, newTemplateId: string) => void;
  onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;
  theme?: string;
  deckTemplateVersion?: string;
  getPlaceholderGenerationState?: (elementId: string) => { isGenerating: boolean; hasImage: boolean; error?: string };
  isVideoMode?: boolean; // Flag for video editor mode
  forceHybridView?: boolean;
}

export const ComponentBasedSlideRenderer: React.FC<ComponentBasedSlideRendererProps> = ({
  slide,
  isEditable = false,
  onSlideUpdate,
  onTemplateChange,
  onEditorActive,
  theme,
  deckTemplateVersion,
  getPlaceholderGenerationState,
  isVideoMode = false,
  forceHybridView = false
}) => {
  const template = getTemplateResolved(slide.templateId, deckTemplateVersion);
  const currentTheme = getSlideTheme(theme || DEFAULT_SLIDE_THEME, deckTemplateVersion);

  // Debug logging for version resolution (enable with window.__DEBUG_SLIDE_VERSIONS__ = true)
  if (typeof window !== 'undefined' && (window as any).__DEBUG_SLIDE_VERSIONS__) {
    console.log('🔍 Slide Version Debug:', {
      slideId: slide.slideId,
      originalTemplateId: slide.templateId,
      deckTemplateVersion,
      resolvedTemplateId: template?.id,
      templateFound: !!template,
      templateName: template?.name
    });
  }

  // Handle template prop updates
  const handlePropsUpdate = (newProps: any) => {
    if (onSlideUpdate) {
      const updatedSlide: ComponentBasedSlide = {
        ...slide,
        props: { ...slide.props, ...newProps },
        metadata: {
          ...slide.metadata,
          updatedAt: new Date().toISOString()
        }
      };
      onSlideUpdate(updatedSlide);
    }
  };

  // Fallback for unknown templates
  if (!template) {
    return (
      <div style={{
        width: '100%',
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        border: '2px dashed #dee2e6',
        borderRadius: '8px',
        padding: '40px'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 600, color: '#6c757d', marginBottom: '16px' }}>
          Template Not Found
        </div>
        <div style={{ fontSize: '16px', color: '#6c757d', textAlign: 'center' }}>
          Template ID: <code>{slide.templateId}</code>
        </div>
        <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '16px' }}>
          Slide ID: {slide.slideId}
        </div>
        {isEditable && onTemplateChange && (
          <button 
            style={{
              marginTop: '20px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => onTemplateChange(slide.slideId, 'content-slide')}
          >
            Switch to Default Template
          </button>
        )}
      </div>
    );
  }

  // Always use positioning for editable slides - PowerPoint-like behavior
  const shouldUsePositioning = isEditable || forceHybridView;
  const effectivePositioningMode = slide.positioningMode || (shouldUsePositioning ? 'hybrid' : 'template');
  
  // Render the template component with props and theme
  const TemplateComponent = template.component;
  const templateProps = {
    ...slide.props,
    slideId: slide.slideId,
    isEditable,
    onUpdate: handlePropsUpdate,
    onEditorActive,
    theme: currentTheme,
    getPlaceholderGenerationState
  };

  // Debug theme information for specific templates
  if (slide.templateId === 'course-overview-slide' || slide.templateId === 'work-life-balance-slide' || slide.templateId === 'thank-you-slide') {
    console.log('🎨 ComponentBasedSlideRenderer Theme Debug:', {
      slideId: slide.slideId,
      templateId: slide.templateId,
      themeType: typeof theme,
      themeValue: theme,
      currentThemeId: currentTheme.id,
      currentThemeBg: currentTheme.colors.backgroundColor,
      templatePropsTheme: templateProps.theme.id
    });
  }



  // Use HybridTemplateBase for all editable slides (positioning enabled by default)
  if (shouldUsePositioning) {
    const hybridContent = (
      <div 
        className={`slide-${slide.slideId} template-${slide.templateId} theme-${theme || DEFAULT_SLIDE_THEME} positioning-enabled`}
        data-theme={theme || DEFAULT_SLIDE_THEME}
      >
        <HybridTemplateBase
          slideId={slide.slideId}
          slide={slide}
          items={slide.items}
          canvasConfig={slide.canvasConfig}
          positioningMode={effectivePositioningMode}
          theme={currentTheme}
          isEditable={isEditable}
          onUpdate={handlePropsUpdate}
          onSlideUpdate={onSlideUpdate}
          isVideoMode={isVideoMode}
          forceAspectRatio={forceHybridView && !isEditable}
        >
          <TemplateComponent {...templateProps} />
        </HybridTemplateBase>
      </div>
    );

    return hybridContent;
  }

  // Default template rendering
  return (
    <div 
      className={`slide-${slide.slideId} template-${slide.templateId} theme-${theme || DEFAULT_SLIDE_THEME} w-full h-full`}
      data-theme={theme || DEFAULT_SLIDE_THEME}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <TemplateComponent {...templateProps} />
    </div>
  );
};

// Utility component for rendering multiple slides
interface ComponentBasedSlideDeckRendererProps {
  slides: ComponentBasedSlide[];
  selectedSlideId?: string;
  isEditable?: boolean;
  onSlideUpdate?: (updatedSlide: ComponentBasedSlide) => void;
  onTemplateChange?: (slideId: string, newTemplateId: string) => void;
  onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;
  theme?: string;
  deckTemplateVersion?: string;
  getPlaceholderGenerationState?: (elementId: string) => { isGenerating: boolean; hasImage: boolean; error?: string };
  isVideoMode?: boolean; // Flag for video editor mode
}

export const ComponentBasedSlideDeckRenderer: React.FC<ComponentBasedSlideDeckRendererProps> = ({
  slides,
  selectedSlideId,
  isEditable = false,
  onSlideUpdate,
  onTemplateChange,
  onEditorActive,
  theme,
  deckTemplateVersion,
  getPlaceholderGenerationState,
  isVideoMode = false
}) => {
  // Safety check for slides array
  if (!slides || !Array.isArray(slides) || slides.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        No slides to display
      </div>
    );
  }

  return (
    <div className="component-based-slide-deck w-full h-full">
      {slides.map((slide) => (
        <div 
          key={slide.slideId}
          className={`slide-container ${selectedSlideId === slide.slideId ? 'active' : ''}`}
          style={{
            display: selectedSlideId ? (selectedSlideId === slide.slideId ? 'block' : 'none') : 'block',
            width: '100%',
            height: '100%',
            marginBottom: selectedSlideId ? 0 : '40px'
          }}
        >
          <ComponentBasedSlideRenderer
            slide={slide}
            isEditable={isEditable}
            onSlideUpdate={onSlideUpdate}
            onTemplateChange={onTemplateChange}
            onEditorActive={onEditorActive}
            theme={theme}
            deckTemplateVersion={deckTemplateVersion}
            getPlaceholderGenerationState={getPlaceholderGenerationState}
            isVideoMode={isVideoMode}
          />
        </div>
      ))}
    </div>
  );
};

export default ComponentBasedSlideRenderer; 