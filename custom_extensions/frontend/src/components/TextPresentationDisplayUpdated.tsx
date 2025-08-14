"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  TextPresentationData, AnyContentBlock, HeadlineBlock, ParagraphBlock,
  BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock, ImageBlock,
} from '@/types/textPresentation';
import {
  CheckCircle, Info as InfoIconLucide, XCircle, AlertTriangle,
  Settings, X, Palette, Type, List, AlertCircle, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { locales } from '@/locales';
import { useLanguage } from '../contexts/LanguageContext';
import { uploadOnePagerImage } from '@/lib/designTemplateApi';
import WordStyleImageEditor from './WordStyleImageEditor';
import ImageBasicActions from './ImageBasicActions';

// Type definitions for internal structuring
type MiniSection = {
  type: "mini_section";
  headline: HeadlineBlock;
  list: BulletListBlock | NumberedListBlock | ParagraphBlock | AlertBlock;
};
type StandaloneBlock = { type: "standalone_block"; content: AnyContentBlock };
type MajorSection = {
  type: "major_section";
  headline: HeadlineBlock;
  items: Array<AnyContentBlock | MiniSection>;
  _skipRenderHeadline?: boolean
};
type RenderableItem = MajorSection | MiniSection | StandaloneBlock;

const parseAndStyleText = (text: string | undefined | null): React.ReactNode[] => {
  if (!text) return [];
  const segments = text.split(/\*\*(.*?)\*\*/g); 
  return segments.map((segment, index) => {
    if (index % 2 === 1) { 
      return <span key={index} className="font-medium text-black">{segment}</span>;
    }
    return segment; 
  }).filter(segment => segment !== ""); 
};

const NewBulletIcon = () => (
  <div className="w-0.75 h-0.75 rounded-full bg-black mr-1.5 mt-[1px] shrink-0" />
);

// Helper function to detect if text starts with an emoji
const startsWithEmoji = (text: string): boolean => {
  const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(text.trim());
};

// Helper function to get the first emoji from text
const getFirstEmoji = (text: string): string | null => {
  const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  const match = text.trim().match(emojiRegex);
  return match ? match[0] : null;
};

// Helper function to render emoji as bullet icon
const EmojiBulletIcon: React.FC<{emoji: string}> = ({ emoji }) => (
  <span className="mr-1.5 mt-[1px] shrink-0 text-base">{emoji}</span>
);

// --- New Icon Set ---
const InfoIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </svg>
);

// Example of how to use the new ImageBasicActions component
const ExampleImageBlock: React.FC<{block: ImageBlock; isEditing: boolean; onTextChange?: (fieldPath: string, value: any) => void; fieldPath: (key: string) => string; setShowWordStyleEditor: (show: boolean) => void}> = ({
  block,
  isEditing,
  onTextChange,
  fieldPath,
  setShowWordStyleEditor
}) => {
  const {
    src: imageSrc,
    alt,
    caption,
    width,
    height,
    alignment,
    borderRadius,
    maxWidth,
    float,
    layoutMode
  } = block;

  const alignmentClass = alignment === 'left' ? 'text-left' : 
                        alignment === 'right' ? 'text-right' : 'text-center';
  
  const floatDirection = float === 'left' ? 'left' : 
                        float === 'right' ? 'right' : 'none';
  
  const marginDirection = float === 'left' ? 'left' : 
                         float === 'right' ? 'right' : 'none';

  return (
    <div className={`my-4 ${alignmentClass} group relative`}>
      {/* Basic Actions Button - NEW IMPLEMENTATION */}
      {isEditing && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
          <ImageBasicActions
            imageBlock={block}
            onImageChange={(updatedBlock) => {
              Object.keys(updatedBlock).forEach(key => {
                if (key !== 'type' && key !== 'src') {
                  onTextChange?.(fieldPath(key), (updatedBlock as any)[key]);
                }
              });
            }}
            onOpenAdvancedSettings={() => setShowWordStyleEditor(true)}
          />
        </div>
      )}
      
      <img 
        src={imageSrc} 
        alt={alt || 'Image'} 
        className="rounded-lg shadow-md"
        style={{
          maxWidth: maxWidth || '200px',
          width: width || 'auto',
          height: height || 'auto',
          borderRadius: borderRadius || '8px',
          float: floatDirection,
          margin: `0 ${marginDirection === 'right' ? '16px' : '0'} 16px ${marginDirection === 'left' ? '16px' : '0'}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'block';
        }}
      />
      <div style={{ display: 'none', padding: '20px', border: '2px dashed #ccc', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
        {alt || 'Image not available'}
      </div>
      {caption && (
        <p style={{ fontSize: '10px', color: '#666', textAlign: 'center', margin: '8px 0 0 0', fontStyle: 'italic', clear: 'both' }}>
          {caption}
        </p>
      )}
    </div>
  );
};

// Main component structure (simplified for demonstration)
const TextPresentationDisplayUpdated: React.FC = () => {
  const [showWordStyleEditor, setShowWordStyleEditor] = useState(false);
  const [showBasicActions, setShowBasicActions] = useState(false);

  const fieldPath = (fieldKey: string) => {
    return `content.0.${fieldKey}`;
  };

  // Example usage
  const exampleImageBlock: ImageBlock = {
    type: 'image',
    src: '/static_design_images/sample-image.jpg',
    alt: 'Sample Image',
    caption: 'This is a sample image',
    width: 300,
    height: 'auto',
    alignment: 'center',
    borderRadius: '8px',
    maxWidth: '100%',
    layoutMode: 'standalone'
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Updated Text Presentation Display</h1>
      
      {/* Example with new ImageBasicActions */}
      <ExampleImageBlock
        block={exampleImageBlock}
        isEditing={true}
        onTextChange={(fieldPath, value) => console.log('Changed:', fieldPath, value)}
        fieldPath={fieldPath}
        setShowWordStyleEditor={setShowWordStyleEditor}
      />

      {/* Advanced Settings Modal */}
      <WordStyleImageEditor
        isOpen={showWordStyleEditor}
        onClose={() => setShowWordStyleEditor(false)}
        imageBlock={exampleImageBlock}
        onImageChange={(updatedBlock) => {
          console.log('Advanced settings updated:', updatedBlock);
        }}
      />
    </div>
  );
};

export default TextPresentationDisplayUpdated;
