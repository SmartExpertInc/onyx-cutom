"use client";

import React from 'react';

// Types for presentation slides
export interface PresentationSlide {
  id: string;
  slideNumber: number;
  title: string;
  layout: string; // e.g., 'big-image-left', 'bullet-points', 'title-slide', etc.
  content: string; // Raw markdown content for the slide
  parsedContent: ContentBlock[];
  imageInfo?: ImageInfo;
}

export interface ImageInfo {
  placeholder: string; // e.g., "LARGE | LEFT | Engaging visual representing..."
  size: 'LARGE' | 'MEDIUM' | 'SMALL';
  position: 'LEFT' | 'RIGHT' | 'CENTER' | 'BACKGROUND';
  description: string;
}

export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'list' | 'image' | 'quote';
  level?: number; // for headings
  content: string;
  items?: string[]; // for lists
  imageInfo?: ImageInfo;
}

export interface PresentationData {
  title?: string;
  slides: PresentationSlide[];
  totalSlides: number;
}

// Layout type mapping based on common slide patterns
const LAYOUT_PATTERNS = {
  'big-image-left': 'big-image-left',
  'big-image-right': 'big-image-right', 
  'bullet-points': 'bullet-points',
  'bullet-points-right': 'bullet-points-right',
  'two-column': 'two-column',
  'title-slide': 'title-slide',
  'hero-title-slide': 'hero-title-slide',
  'content-slide': 'content-slide',
  'process-steps': 'process-steps',
  'big-numbers': 'big-numbers',
  'four-box-grid': 'four-box-grid',
  'quote-slide': 'quote-slide'
};

// Function to extract layout from slide content
function extractLayoutFromSlide(slideContent: string): string {
  const lines = slideContent.split('\n');
  
  // Look for layout hint in backticks at the end of the title line
  for (const line of lines) {
    if (line.trim().startsWith('**Slide ') && line.includes('`')) {
      const match = line.match(/`([^`]+)`/);
      if (match) {
        const layoutHint = match[1].trim();
        return LAYOUT_PATTERNS[layoutHint as keyof typeof LAYOUT_PATTERNS] || 'content-slide';
      }
    }
  }
  
  // Auto-detect layout based on content patterns
  const contentStr = slideContent.toLowerCase();
  
  if (contentStr.includes('introduction') || contentStr.includes('title')) {
    return 'title-slide';
  }
  if (contentStr.includes('- ') || contentStr.includes('* ')) {
    return 'bullet-points';
  }
  if (contentStr.includes('###') && contentStr.includes('###')) {
    return 'two-column';
  }
  if (contentStr.includes('1.') || contentStr.includes('2.') || contentStr.includes('3.')) {
    return 'process-steps';
  }
  
  return 'content-slide';
}

// Function to extract image information from IMAGE_PLACEHOLDER
function extractImageInfo(content: string): ImageInfo | undefined {
  const imageMatch = content.match(/\[IMAGE_PLACEHOLDER:\s*([^\]]+)\]/);
  if (!imageMatch) return undefined;
  
  const imagePlaceholder = imageMatch[1];
  const parts = imagePlaceholder.split('|').map(part => part.trim());
  
  if (parts.length >= 3) {
    return {
      placeholder: imagePlaceholder,
      size: (parts[0] as any) || 'MEDIUM',
      position: (parts[1] as any) || 'CENTER', 
      description: parts[2] || 'Visual content'
    };
  }
  
  return {
    placeholder: imagePlaceholder,
    size: 'MEDIUM',
    position: 'CENTER',
    description: imagePlaceholder
  };
}

// Function to parse slide content into structured blocks
function parseSlideContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentBlock: Partial<ContentBlock> | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Skip the slide title line (starts with **Slide)
    if (line.startsWith('**Slide ')) continue;
    
    // Parse headings
    if (line.startsWith('##')) {
      if (currentBlock) {
        blocks.push(currentBlock as ContentBlock);
        currentBlock = null;
      }
      
      const level = line.match(/^#+/)?.[0].length || 2;
      const headingText = line.replace(/^#+\s*/, '').replace(/\*\*/g, '');
      
      blocks.push({
        type: 'heading',
        level,
        content: headingText
      });
    }
    // Parse lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (currentBlock?.type !== 'list') {
        if (currentBlock) {
          blocks.push(currentBlock as ContentBlock);
        }
        currentBlock = {
          type: 'list',
          content: '',
          items: []
        };
      }
      
      const listItem = line.replace(/^[*-]\s+/, '').replace(/\*\*([^*]+)\*\*/g, '$1');
      currentBlock.items?.push(listItem);
    }
    // Parse image placeholders
    else if (line.includes('[IMAGE_PLACEHOLDER:')) {
      if (currentBlock) {
        blocks.push(currentBlock as ContentBlock);
        currentBlock = null;
      }
      
      const imageInfo = extractImageInfo(line);
      blocks.push({
        type: 'image',
        content: line,
        imageInfo
      });
    }
    // Parse regular paragraphs
    else {
      if (currentBlock?.type !== 'paragraph') {
        if (currentBlock) {
          blocks.push(currentBlock as ContentBlock);
        }
        currentBlock = {
          type: 'paragraph',
          content: ''
        };
      }
      
      // Append to current paragraph
      const cleanLine = line.replace(/\*\*([^*]+)\*\*/g, '$1');
      currentBlock.content = currentBlock.content 
        ? currentBlock.content + ' ' + cleanLine 
        : cleanLine;
    }
  }
  
  // Add the final block
  if (currentBlock) {
    blocks.push(currentBlock as ContentBlock);
  }
  
  return blocks;
}

// Main function to parse presentation markdown
export function parsePresentationMarkdown(markdown: string): PresentationData {
  if (!markdown || !markdown.trim()) {
    return {
      slides: [],
      totalSlides: 0
    };
  }
  
  // Split by slide separators
  const rawSlides = markdown.split(/^---\s*$/m).filter(slide => slide.trim());
  
  const slides: PresentationSlide[] = rawSlides.map((slideContent, index) => {
    const trimmedContent = slideContent.trim();
    
    // Extract slide title (first line that starts with **Slide)
    const titleMatch = trimmedContent.match(/\*\*Slide \d+:\s*([^*`]+)/);
    const title = titleMatch ? titleMatch[1].trim() : `Slide ${index + 1}`;
    
    // Extract layout
    const layout = extractLayoutFromSlide(trimmedContent);
    
    // Parse content blocks
    const parsedContent = parseSlideContent(trimmedContent);
    
    return {
      id: `slide-${index + 1}`,
      slideNumber: index + 1,
      title,
      layout,
      content: trimmedContent,
      parsedContent,
      imageInfo: extractImageInfo(trimmedContent)
    };
  });
  
  return {
    slides,
    totalSlides: slides.length
  };
}

// Utility function to convert parsed data back to markdown
export function convertToMarkdown(presentationData: PresentationData): string {
  return presentationData.slides
    .map(slide => slide.content)
    .join('\n\n---\n\n');
} 