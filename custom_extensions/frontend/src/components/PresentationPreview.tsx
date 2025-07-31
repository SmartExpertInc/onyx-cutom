"use client";

import React, { useState, useEffect } from 'react';
import { 
  PresentationData, 
  PresentationSlide, 
  ContentBlock, 
  ImageInfo,
  parsePresentationMarkdown,
  convertToMarkdown,
  contentBlocksToMarkdown
} from './PresentationParser';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  FileText, 
  Image, 
  List, 
  Type,
  Eye,
  Edit3
} from 'lucide-react';

// Theme colors for consistent styling
const THEME_COLORS = {
  primary: '#0540AB',
  primaryHover: '#043a99', 
  accent: '#FF1414',
  accentLight: '#FFF5F5',
  backgroundGray: '#F4F5F6',
  backgroundLight: '#FAFAFA',
  textPrimary: '#20355D',
  textSecondary: '#858587',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  borderActive: '#FF1414',
  white: '#FFFFFF'
};

interface PresentationPreviewProps {
  markdown: string;
  isEditing?: boolean;
  onContentChange?: (newMarkdown: string) => void;
  className?: string;
}

// Image placeholder component
const ImagePlaceholder: React.FC<{ imageInfo?: ImageInfo }> = ({ imageInfo }) => {
  if (!imageInfo) return null;
  
  const sizeClasses = {
    'LARGE': 'h-48 md:h-64',
    'MEDIUM': 'h-32 md:h-40', 
    'SMALL': 'h-24 md:h-32'
  };
  
  const positionClasses = {
    'LEFT': 'float-left mr-6 mb-4',
    'RIGHT': 'float-right ml-6 mb-4',
    'CENTER': 'mx-auto mb-6',
    'BACKGROUND': 'absolute inset-0 z-0'
  };
  
  return (
    <div 
      className={`
        ${sizeClasses[imageInfo.size]} 
        ${positionClasses[imageInfo.position]} 
        bg-gradient-to-br from-blue-100 to-purple-100 
        border-2 border-dashed border-gray-300 
        rounded-lg flex items-center justify-center 
        text-gray-500 text-sm
        ${imageInfo.position === 'BACKGROUND' ? 'opacity-20' : ''}
      `}
      style={{ minWidth: imageInfo.size === 'LARGE' ? '300px' : imageInfo.size === 'MEDIUM' ? '200px' : '150px' }}
    >
      <div className="text-center p-4">
        <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <div className="font-medium">{imageInfo.size} Image</div>
        <div className="text-xs mt-1 opacity-75">{imageInfo.description}</div>
      </div>
    </div>
  );
};

// Editable content block component
const EditableBlock: React.FC<{
  block: ContentBlock;
  isEditing: boolean;
  onContentChange: (newContent: string) => void;
  onItemChange?: (index: number, newContent: string) => void;
}> = ({ block, isEditing, onContentChange, onItemChange }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editContent, setEditContent] = useState(block.content);

  // Sync editContent with block.content changes to prevent stale data
  useEffect(() => {
    if (!isEditMode) {
      setEditContent(block.content);
    }
  }, [block.content, isEditMode]);

  const handleSave = () => {
    onContentChange(editContent);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditContent(block.content);
    setIsEditMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  switch (block.type) {
    case 'heading':
      const headingLevel = Math.min(block.level || 2, 6);
      const headingClasses = {
        1: 'text-3xl md:text-4xl font-bold text-gray-900 mb-6 break-words',
        2: 'text-2xl md:text-3xl font-bold text-gray-900 mb-4 break-words',
        3: 'text-xl md:text-2xl font-semibold text-gray-800 mb-3 break-words',
        4: 'text-lg md:text-xl font-semibold text-gray-800 mb-3 break-words',
        5: 'text-base md:text-lg font-medium text-gray-700 mb-2 break-words',
        6: 'text-sm md:text-base font-medium text-gray-700 mb-2 break-words'
      }[headingLevel];

      if (isEditMode && isEditing) {
        return (
          <div className="mb-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="w-full p-2 border border-yellow-400 rounded-md bg-yellow-50 focus:ring-1 focus:ring-yellow-500 outline-none text-lg font-semibold resize-none break-words min-h-[2.5rem]"
              autoFocus
              rows={Math.max(1, Math.ceil(editContent.length / 50))}
              style={{
                height: 'auto',
                minHeight: '2.5rem'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.max(40, target.scrollHeight) + 'px';
              }}
              onFocus={(e) => {
                // Ensure proper sizing on focus
                const target = e.target as HTMLTextAreaElement;
                setTimeout(() => {
                  target.style.height = 'auto';
                  target.style.height = Math.max(40, target.scrollHeight) + 'px';
                }, 0);
              }}
            />
          </div>
        );
      }

      const renderHeading = () => {
        const content = (
          <>
            {block.content}
            {isEditing && (
              <Edit3 className="inline-block w-4 h-4 ml-2 opacity-0 group-hover:opacity-50 transition-opacity" />
            )}
          </>
        );

        switch (headingLevel) {
          case 1:
            return <h1 className={headingClasses}>{content}</h1>;
          case 2:
            return <h2 className={headingClasses}>{content}</h2>;
          case 3:
            return <h3 className={headingClasses}>{content}</h3>;
          case 4:
            return <h4 className={headingClasses}>{content}</h4>;
          case 5:
            return <h5 className={headingClasses}>{content}</h5>;
          case 6:
            return <h6 className={headingClasses}>{content}</h6>;
          default:
            return <h2 className={headingClasses}>{content}</h2>;
        }
      };

      return (
        <div 
          className={`group cursor-pointer ${isEditing ? 'hover:bg-gray-50 rounded-md p-2 -m-2' : ''}`}
          onClick={() => isEditing && setIsEditMode(true)}
        >
          {renderHeading()}
        </div>
      );

    case 'paragraph':
      if (isEditMode && isEditing) {
        return (
          <div className="mb-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="w-full p-3 border border-yellow-400 rounded-md bg-yellow-50 focus:ring-1 focus:ring-yellow-500 outline-none leading-relaxed resize-none break-words min-h-[4rem]"
              autoFocus
              rows={Math.max(2, Math.ceil(editContent.length / 60))}
              style={{
                height: 'auto',
                minHeight: '4rem'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.max(64, target.scrollHeight) + 'px';
              }}
              onFocus={(e) => {
                // Ensure proper sizing on focus
                const target = e.target as HTMLTextAreaElement;
                setTimeout(() => {
                  target.style.height = 'auto';
                  target.style.height = Math.max(64, target.scrollHeight) + 'px';
                }, 0);
              }}
            />
          </div>
        );
      }

      return (
        <div 
          className={`group cursor-pointer ${isEditing ? 'hover:bg-gray-50 rounded-md p-2 -m-2' : ''}`}
          onClick={() => isEditing && setIsEditMode(true)}
        >
          <p className="text-gray-700 leading-relaxed mb-4 text-base break-words whitespace-pre-wrap">
            {block.content}
            {isEditing && (
              <Edit3 className="inline-block w-4 h-4 ml-2 opacity-0 group-hover:opacity-50 transition-opacity" />
            )}
          </p>
        </div>
      );

    case 'list':
      return (
        <div className={`mb-4 ${isEditing ? 'group' : ''}`}>
          <ul className="space-y-2">
            {block.items?.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 font-bold mr-3 mt-1">•</span>
                {isEditing ? (
                  <textarea
                    value={item}
                    onChange={(e) => onItemChange?.(index, e.target.value)}
                    className="flex-1 p-1 border-b border-transparent hover:border-yellow-400 focus:border-yellow-400 focus:bg-yellow-50 outline-none transition-colors resize-none break-words min-h-[1.5rem]"
                    rows={Math.max(1, Math.ceil(item.length / 40))}
                    style={{
                      height: 'auto',
                      minHeight: '1.5rem'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.max(24, target.scrollHeight) + 'px';
                    }}
                    onFocus={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      setTimeout(() => {
                        target.style.height = 'auto';
                        target.style.height = Math.max(24, target.scrollHeight) + 'px';
                      }, 0);
                    }}
                  />
                ) : (
                  <span className="text-gray-700 flex-1 break-words text-sm">{item}</span>
                )}
              </li>
            ))}
          </ul>
          {isEditing && (
            <Edit3 className="w-4 h-4 mt-2 opacity-0 group-hover:opacity-50 transition-opacity" />
          )}
        </div>
      );

    case 'process-step':
      if (isEditMode && isEditing) {
        return (
          <div className="mb-4">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {block.stepNumber}
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="flex-1 p-3 border border-yellow-400 rounded-md bg-yellow-50 focus:ring-1 focus:ring-yellow-500 outline-none leading-relaxed resize-none break-words min-h-[4rem]"
                autoFocus
                rows={Math.max(2, Math.ceil(editContent.length / 60))}
                style={{
                  height: 'auto',
                  minHeight: '4rem'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.max(64, target.scrollHeight) + 'px';
                }}
                onFocus={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  setTimeout(() => {
                    target.style.height = 'auto';
                    target.style.height = Math.max(64, target.scrollHeight) + 'px';
                  }, 0);
                }}
              />
            </div>
          </div>
        );
      }

      return (
        <div 
          className={`group cursor-pointer ${isEditing ? 'hover:bg-gray-50 rounded-md p-2 -m-2' : ''} mb-4`}
          onClick={() => isEditing && setIsEditMode(true)}
        >
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {block.stepNumber}
            </div>
            <div className="flex-1">
              <p className="text-gray-700 leading-relaxed break-words text-sm">
                {block.content}
                {isEditing && (
                  <Edit3 className="inline-block w-4 h-4 ml-2 opacity-0 group-hover:opacity-50 transition-opacity" />
                )}
              </p>
            </div>
          </div>
        </div>
      );

    case 'big-numbers':
      if (isEditMode && isEditing) {
        return (
          <div className="mb-6">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="w-full p-3 border border-yellow-400 rounded-md bg-yellow-50 focus:ring-1 focus:ring-yellow-500 outline-none leading-relaxed resize-none break-words min-h-[8rem]"
              autoFocus
              rows={Math.max(4, Math.ceil(editContent.length / 80))}
              style={{
                height: 'auto',
                minHeight: '8rem'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.max(128, target.scrollHeight) + 'px';
              }}
              onFocus={(e) => {
                const target = e.target as HTMLTextAreaElement;
                setTimeout(() => {
                  target.style.height = 'auto';
                  target.style.height = Math.max(128, target.scrollHeight) + 'px';
                }, 0);
              }}
            />
          </div>
        );
      }

      return (
        <div 
          className={`group cursor-pointer ${isEditing ? 'hover:bg-gray-50 rounded-md p-2 -m-2' : ''} mb-6`}
          onClick={() => isEditing && setIsEditMode(true)}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {block.numbersData?.map((item, index) => (
              <div key={index} className="text-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {item.number}
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  {item.label}
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
          {isEditing && (
            <Edit3 className="w-4 h-4 mt-2 opacity-0 group-hover:opacity-50 transition-opacity" />
          )}
        </div>
      );

    case 'image':
      // Hide image placeholders in preview, but preserve them for finalization
      return null;

    default:
      return null;
  }
};

// Main slide display component
const SlideDisplay: React.FC<{
  slide: PresentationSlide;
  isEditing: boolean;
  onSlideChange: (newSlide: PresentationSlide) => void;
}> = ({ slide, isEditing, onSlideChange }) => {
  const updateSlideContent = (blockIndex: number, newContent: string) => {
    const updatedBlocks = [...slide.parsedContent];
    updatedBlocks[blockIndex] = { ...updatedBlocks[blockIndex], content: newContent };
    
    // Reconstruct the slide content from updated blocks
    const reconstructedContent = contentBlocksToMarkdown(updatedBlocks);
    const slideTitle = slide.title;
    const layout = slide.layout ? ` \`${slide.layout}\`` : '';
    const newSlideContent = `**${slideTitle}**${layout}\n\n${reconstructedContent}`;
    
    const updatedSlide = { 
      ...slide, 
      parsedContent: updatedBlocks,
      content: newSlideContent // Update the raw content too
    };
    onSlideChange(updatedSlide);
  };

  const updateListItem = (blockIndex: number, itemIndex: number, newContent: string) => {
    const updatedBlocks = [...slide.parsedContent];
    const listBlock = updatedBlocks[blockIndex];
    
    if (listBlock.items) {
      const updatedItems = [...listBlock.items];
      updatedItems[itemIndex] = newContent;
      updatedBlocks[blockIndex] = { ...listBlock, items: updatedItems };
      
      // Reconstruct the slide content from updated blocks
      const reconstructedContent = contentBlocksToMarkdown(updatedBlocks);
      const slideTitle = slide.title;
      const layout = slide.layout ? ` \`${slide.layout}\`` : '';
      const newSlideContent = `**${slideTitle}**${layout}\n\n${reconstructedContent}`;
      
      const updatedSlide = { 
        ...slide, 
        parsedContent: updatedBlocks,
        content: newSlideContent // Update the raw content too
      };
      onSlideChange(updatedSlide);
    }
  };

  // Layout-specific rendering
  const renderSlideContent = () => {
    const { layout, parsedContent } = slide;
    
    // Special handling for two-column layout
    if (layout === 'two-column') {
      const headings = parsedContent.filter(block => block.type === 'heading');
      const otherContent = parsedContent.filter(block => block.type !== 'heading');
      const midPoint = Math.ceil(otherContent.length / 2);
      const leftContent = otherContent.slice(0, midPoint);
      const rightContent = otherContent.slice(midPoint);
      
      return (
        <div className="p-6">
          {/* Main headings */}
          {headings.map((block, index) => (
            <EditableBlock
              key={`heading-${index}`}
              block={block}
              isEditing={isEditing}
              onContentChange={(newContent) => updateSlideContent(parsedContent.indexOf(block), newContent)}
              onItemChange={(itemIndex, newContent) => updateListItem(parsedContent.indexOf(block), itemIndex, newContent)}
            />
          ))}
          
          {/* Two column content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="space-y-4">
              {leftContent.map((block, index) => (
                <EditableBlock
                  key={`left-${index}`}
                  block={block}
                  isEditing={isEditing}
                  onContentChange={(newContent) => updateSlideContent(parsedContent.indexOf(block), newContent)}
                  onItemChange={(itemIndex, newContent) => updateListItem(parsedContent.indexOf(block), itemIndex, newContent)}
                />
              ))}
            </div>
            <div className="space-y-4">
              {rightContent.map((block, index) => (
                <EditableBlock
                  key={`right-${index}`}
                  block={block}
                  isEditing={isEditing}
                  onContentChange={(newContent) => updateSlideContent(parsedContent.indexOf(block), newContent)}
                  onItemChange={(itemIndex, newContent) => updateListItem(parsedContent.indexOf(block), itemIndex, newContent)}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // Special handling for process-steps layout (now handled by individual process-step blocks)
    if (layout === 'process-steps') {
      return (
        <div className="p-6 space-y-4">
          {parsedContent.map((block, index) => (
            <EditableBlock
              key={index}
              block={block}
              isEditing={isEditing}
              onContentChange={(newContent) => updateSlideContent(index, newContent)}
              onItemChange={(itemIndex, newContent) => updateListItem(index, itemIndex, newContent)}
            />
          ))}
        </div>
      );
    }
    
    // Default layout with improved spacing
    const layoutClasses = {
      'title-slide': 'text-center py-16',
      'hero-title-slide': 'text-center py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-lg',
      'big-image-left': 'grid grid-cols-1 md:grid-cols-2 gap-8 items-start',
      'big-image-right': 'grid grid-cols-1 md:grid-cols-2 gap-8 items-start',
      'bullet-points': 'space-y-4',
      'bullet-points-right': 'grid grid-cols-1 md:grid-cols-2 gap-8',
      'big-numbers': 'text-center space-y-8',
      'four-box-grid': 'grid grid-cols-1 md:grid-cols-2 gap-6',
      'content-slide': 'space-y-4'
    }[layout] || 'space-y-4';

    return (
      <div className={`${layoutClasses} p-6`}>
        {parsedContent.map((block, index) => (
          <EditableBlock
            key={index}
            block={block}
            isEditing={isEditing}
            onContentChange={(newContent) => updateSlideContent(index, newContent)}
            onItemChange={(itemIndex, newContent) => updateListItem(index, itemIndex, newContent)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 min-h-[500px] relative overflow-hidden break-words">
      {/* Slide header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-gray-900">{slide.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
              {slide.layout}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {slide.slideNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Slide content */}
      <div className="relative">
        {/* Background images hidden in preview - preserved for finalization */}
        <div className="relative p-6 space-y-4 break-words overflow-wrap-anywhere">
          {renderSlideContent()}
        </div>
      </div>
    </div>
  );
};

// Note: SlideNavigation component removed - now displaying all slides vertically

// Main presentation preview component
const PresentationPreview: React.FC<PresentationPreviewProps> = ({
  markdown,
  isEditing = false,
  onContentChange,
  className = ""
}) => {
  const { t } = useLanguage();
  const [presentationData, setPresentationData] = useState<PresentationData>(() => 
    parsePresentationMarkdown(markdown)
  );

  // Re-parse when markdown changes
  useEffect(() => {
    const newData = parsePresentationMarkdown(markdown);
    setPresentationData(newData);
  }, [markdown]);

  const handleSlideChange = (newSlide: PresentationSlide) => {
    const updatedSlides = [...presentationData.slides];
    const slideIndex = updatedSlides.findIndex(s => s.id === newSlide.id);
    
    if (slideIndex !== -1) {
      updatedSlides[slideIndex] = newSlide;
      const updatedData = { ...presentationData, slides: updatedSlides };
      setPresentationData(updatedData);
      
      // Convert back to markdown and notify parent
      if (onContentChange) {
        const newMarkdown = convertToMarkdown(updatedData);
        onContentChange(newMarkdown);
      }
    }
  };

  if (!presentationData.slides.length) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-8 text-center ${className}`}>
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('presentationPreview.noSlides', 'No slides available')}
        </h3>
        <p className="text-gray-600">
          {t('presentationPreview.noSlidesDescription', 'Start typing to create your first slide.')}
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('presentationPreview.title', 'Presentation Preview')}
              </h2>
              <p className="text-sm text-gray-600">
                {presentationData.slides.filter(slide => !slide.isMetadata).length} {t('presentationPreview.slides', 'slides')}
              </p>
            </div>
          </div>
          
          {isEditing && (
            <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <Edit3 className="w-4 h-4 mr-1" />
              {t('presentationPreview.editMode', 'Edit Mode')}
            </div>
          )}
        </div>
      </div>

      {/* All slides displayed vertically (excluding metadata slides) */}
      <div className="max-h-[600px] overflow-y-auto">
        <div className="p-6 bg-gray-50 space-y-6">
          {presentationData.slides
            .filter(slide => !slide.isMetadata) // Hide metadata slides from preview
            .map((slide) => (
            <SlideDisplay
              key={slide.id}
              slide={slide}
              isEditing={isEditing}
              onSlideChange={handleSlideChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PresentationPreview; 