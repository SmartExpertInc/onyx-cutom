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
  isMetadata?: boolean; // Flag to indicate if this is a metadata slide
}

export interface ImageInfo {
  placeholder: string; // e.g., "LARGE | LEFT | Engaging visual representing..."
  size: 'LARGE' | 'MEDIUM' | 'SMALL';
  position: 'LEFT' | 'RIGHT' | 'CENTER' | 'BACKGROUND';
  description: string;
}

export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'list' | 'image' | 'quote' | 'process-step' | 'big-numbers';
  level?: number; // for headings
  content: string;
  items?: string[]; // for lists
  imageInfo?: ImageInfo;
  stepNumber?: number; // for process steps
  numbersData?: { number: string; label: string; description: string; }[]; // for big numbers
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

// Function to detect if a slide is a metadata slide (should be hidden in preview)
function isMetadataSlide(content: string): boolean {
  const trimmedContent = content.trim();
  
  // Check for metadata patterns like "**Title** : **Type** : **Title**"
  const metadataPattern = /^\*\*[^*]+\*\*\s*:\s*\*\*[^*]+\*\*\s*:\s*\*\*[^*]+\*\*\s*$/m;
  if (metadataPattern.test(trimmedContent)) {
    return true;
  }
  
  // Check for other metadata patterns - slides that contain project info but no actual slide content
  // Use more flexible pattern to match slide titles in any language: **Word(s) Number:**
  const hasSlideTitle = /\*\*[^*]+\s+\d+\s*:/.test(trimmedContent);
  const hasColonPattern = /\*\*[^*]+\*\*\s*:\s*\*\*[^*]+\*\*/.test(trimmedContent);
  
  // If it has colon patterns but no "Word Number:" format, it's likely metadata
  if (hasColonPattern && !hasSlideTitle) {
    return true;
  }
  
  return false;
}

// Function to extract layout from slide content
function extractLayoutFromSlide(slideContent: string): string {
  const lines = slideContent.split('\n');
  
  // Look for layout hint in backticks at the end of the title line
  // Use more flexible pattern to match any slide title format with backticks
  for (const line of lines) {
    if (line.trim().startsWith('**') && line.includes('`')) {
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
  if (contentStr.includes('|') && contentStr.includes('%') && contentStr.includes(':---')) {
    return 'big-numbers';
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

// Function to parse table format for big-numbers
function parseBigNumbersTable(content: string): { number: string; label: string; description: string; }[] {
  const lines = content.split('\n');
  const numbersData: { number: string; label: string; description: string; }[] = [];
  
  // Look for table format like:
  // | 75% | 5+ | 10+ |
  // |:----:|:---:|:---:|
  // | User Adoption | Tools Available | Templates Offered |
  // | 75% of businesses... | There are over... | Many tools offer... |
  
  let numberRow = '';
  let labelRow = '';
  let descriptionRow = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && !trimmed.includes(':---')) {
      if (!numberRow && /\|\s*\d+[%+]?\s*\|/.test(trimmed)) {
        numberRow = trimmed;
      } else if (numberRow && !labelRow) {
        labelRow = trimmed;
      } else if (labelRow && !descriptionRow) {
        descriptionRow = trimmed;
      }
    }
  }
  
  if (numberRow && labelRow && descriptionRow) {
    const numbers = numberRow.split('|').map(s => s.trim()).filter(s => s);
    const labels = labelRow.split('|').map(s => s.trim()).filter(s => s);
    const descriptions = descriptionRow.split('|').map(s => s.trim()).filter(s => s);
    
    for (let i = 0; i < Math.min(numbers.length, labels.length, descriptions.length); i++) {
      numbersData.push({
        number: numbers[i],
        label: labels[i], 
        description: descriptions[i]
      });
    }
  }
  
  return numbersData;
}

// Function to parse slide content into structured blocks
function parseSlideContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentBlock: Partial<ContentBlock> | null = null;
  
  // Check for big-numbers table format first
  if (content.includes('|') && content.includes('%') && content.includes(':---')) {
    const numbersData = parseBigNumbersTable(content);
    if (numbersData.length > 0) {
      // Extract heading if present
      for (const line of lines) {
        if (line.startsWith('##')) {
          const level = line.match(/^#+/)?.[0].length || 2;
          const headingText = line.replace(/^#+\s*/, '').replace(/\*\*/g, '');
          blocks.push({
            type: 'heading',
            level,
            content: headingText
          });
        }
      }
      
      blocks.push({
        type: 'big-numbers',
        content: content,
        numbersData
      });
      
      return blocks;
    }
  }
  
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
    // Parse numbered process steps (1., 2., 3., etc.)
    else if (/^\d+\.\s+/.test(line)) {
      if (currentBlock) {
        blocks.push(currentBlock as ContentBlock);
        currentBlock = null;
      }
      
      const stepMatch = line.match(/^(\d+)\.\s+(.+)/);
      if (stepMatch) {
        const stepNumber = parseInt(stepMatch[1]);
        const stepContent = stepMatch[2].replace(/\*\*([^*]+)\*\*/g, '$1');
        
        blocks.push({
          type: 'process-step',
          content: stepContent,
          stepNumber
        });
      }
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
    // Skip table separator lines
    else if (line.includes(':---')) {
      continue;
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
    
    // Extract slide title using more flexible pattern that works for any language
    // Look for pattern: **[anything] [number]: [title]** or **[title]** at the beginning
    let title = `Slide ${index + 1}`;
    
    // First try to match numbered slide pattern: **Word(s) Number: Title**
    const numberedTitleMatch = trimmedContent.match(/\*\*([^*]+)\s+(\d+)\s*:\s*([^*`]+)/);
    if (numberedTitleMatch) {
      title = numberedTitleMatch[3].trim();
    } else {
      // If no numbered pattern, try to get first bold text as title: **Title**
      const simpleTitleMatch = trimmedContent.match(/\*\*([^*`]+)\*\*/);
      if (simpleTitleMatch) {
        // Clean up the title - remove template indicators and extra formatting
        let extractedTitle = simpleTitleMatch[1].trim();
        // Remove template indicators in backticks
        extractedTitle = extractedTitle.replace(/\s*`[^`]*`\s*$/, '').trim();
        // Only use it if it's not just a number or very short
        if (extractedTitle.length > 3 && !/^\d+$/.test(extractedTitle)) {
          title = extractedTitle;
        }
      }
    }
    
    // Extract layout
    const layout = extractLayoutFromSlide(trimmedContent);
    
    // Parse content blocks
    const parsedContent = parseSlideContent(trimmedContent);
    
    // Check if this is a metadata slide
    const isMetadata = isMetadataSlide(trimmedContent);
    
    return {
      id: `slide-${index + 1}`,
      slideNumber: index + 1,
      title,
      layout,
      content: trimmedContent,
      parsedContent,
      imageInfo: extractImageInfo(trimmedContent),
      isMetadata
    };
  });
  
  return {
    slides,
    totalSlides: slides.length
  };
}

// Utility function to convert content blocks back to markdown
export function contentBlocksToMarkdown(blocks: ContentBlock[]): string {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading':
        const prefix = '#'.repeat(block.level || 2);
        return `${prefix} ${block.content}`;
      case 'paragraph':
        return block.content;
      case 'list':
        return block.items?.map(item => `- ${item}`).join('\n') || '';
      case 'process-step':
        return `${block.stepNumber}. ${block.content}`;
      case 'big-numbers':
        return block.content; // Preserve original table format
      case 'image':
        return block.content; // Preserve original image placeholder text
      default:
        return block.content;
    }
  }).join('\n\n');
}

// Utility function to convert parsed data back to markdown
export function convertToMarkdown(presentationData: PresentationData): string {
  return presentationData.slides
    .map(slide => {
      // If the slide has parsed content that might have been edited, reconstruct from blocks
      if (slide.parsedContent && slide.parsedContent.length > 0) {
        const slideTitle = slide.title;
        const layout = slide.layout ? ` \`${slide.layout}\`` : '';
        const reconstructedContent = contentBlocksToMarkdown(slide.parsedContent);
        
        // Reconstruct the slide with title and content
        return `**${slideTitle}**${layout}\n\n${reconstructedContent}`;
      }
      
      // Fallback to original content if no parsed content
      return slide.content;
    })
    .join('\n\n---\n\n');
} 