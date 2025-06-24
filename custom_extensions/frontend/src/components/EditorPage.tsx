"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SlideDeckData, DeckSlide, AnyContentBlock } from '@/types/pdfLesson';
import { 
  Home, 
  Palette, 
  Share2, 
  Play, 
  MoreHorizontal, 
  User, 
  X, 
  Plus,
  ZoomIn,
  ZoomOut,
  HelpCircle
} from 'lucide-react';
import './EditorPage.css';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

interface EditorPageProps {
  projectId?: string;
}

const EditorPage: React.FC<EditorPageProps> = ({ projectId }) => {
  const [slideDeckData, setSlideDeckData] = useState<SlideDeckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch slide deck data
  useEffect(() => {
    const fetchSlideData = async () => {
      if (!projectId) {
        setError("No project ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const commonHeaders: HeadersInit = {};
        const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") || "dummy-onyx-user-id-for-testing" : "dummy-onyx-user-id-for-testing";
        if (devUserId && process.env.NODE_ENV === 'development') {
          commonHeaders['X-Dev-Onyx-User-ID'] = devUserId;
        }

        const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${projectId}`, {
          cache: 'no-store',
          headers: commonHeaders
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch project data: ${response.status}`);
        }

        const projectData = await response.json();
        
        // Check if this is a slide deck project
        if (projectData.component_name !== 'SlideDeckDisplay') {
          throw new Error("This project is not a slide deck");
        }

        if (projectData.details) {
          setSlideDeckData(projectData.details as SlideDeckData);
        } else {
          throw new Error("No slide deck data found");
        }
      } catch (err: any) {
        console.error("Error fetching slide data:", err);
        setError(err.message || "Failed to load slide data");
      } finally {
        setLoading(false);
      }
    };

    fetchSlideData();
  }, [projectId]);

  // Handle scroll to update active slide
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || !slideDeckData) return;

      const container = scrollContainerRef.current;
      const containerTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const containerCenter = containerTop + containerHeight / 2;

      let closestSlide = 0;
      let closestDistance = Infinity;

      slideRefs.current.forEach((slideRef, index) => {
        if (slideRef) {
          const slideTop = slideRef.offsetTop;
          const slideHeight = slideRef.offsetHeight;
          const slideCenter = slideTop + slideHeight / 2;
          const distance = Math.abs(containerCenter - slideCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestSlide = index;
          }
        }
      });

      setActiveSlideIndex(closestSlide);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [slideDeckData]);

  // Initialize slide refs array
  useEffect(() => {
    if (slideDeckData) {
      slideRefs.current = new Array(slideDeckData.slides.length).fill(null);
    }
  }, [slideDeckData]);

  // Function to scroll to specific slide
  const scrollToSlide = (index: number) => {
    const slideRef = slideRefs.current[index];
    if (slideRef && scrollContainerRef.current) {
      slideRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Render content block to text for thumbnails
  const renderContentToText = (blocks: AnyContentBlock[]): string => {
    return blocks
      .map(block => {
        switch (block.type) {
          case 'headline':
            return block.text;
          case 'paragraph':
            return block.text.substring(0, 100) + (block.text.length > 100 ? '...' : '');
          case 'bullet_list':
            return block.items.map(item => 
              typeof item === 'string' ? `• ${item}` : '• Content'
            ).join('\n');
          case 'numbered_list':
            return block.items.map((item, index) => 
              typeof item === 'string' ? `${index + 1}. ${item}` : `${index + 1}. Content`
            ).join('\n');
          default:
            return '';
        }
      })
      .join('\n');
  };

  // Get main slide content for display
  const getMainSlideContent = (slide: DeckSlide) => {
    const titleBlock = slide.contentBlocks.find(block => block.type === 'headline');
    const contentBlocks = slide.contentBlocks.filter(block => block.type !== 'headline');
    
    return {
      title: titleBlock ? titleBlock.text : slide.slideTitle,
      content: renderContentToText(contentBlocks)
    };
  };

  // Render individual content blocks
  const renderContentBlock = (block: AnyContentBlock) => {
    switch (block.type) {
      case 'headline':
        switch (block.level) {
          case 1: return <h1 className="content-headline level-1">{block.text}</h1>;
          case 2: return <h2 className="content-headline level-2">{block.text}</h2>;
          case 3: return <h3 className="content-headline level-3">{block.text}</h3>;
          case 4: return <h4 className="content-headline level-4">{block.text}</h4>;
          default: return <h2 className="content-headline level-2">{block.text}</h2>;
        }
      
      case 'paragraph':
        return <p className="content-paragraph">{block.text}</p>;
      
      case 'bullet_list':
        return (
          <ul className="content-bullet-list">
            {block.items.map((item, index) => (
              <li key={index} className="bullet-item">
                {typeof item === 'string' ? item : 'Complex item'}
              </li>
            ))}
          </ul>
        );
      
      case 'numbered_list':
        return (
          <ol className="content-numbered-list">
            {block.items.map((item, index) => (
              <li key={index} className="numbered-item">
                {typeof item === 'string' ? item : 'Complex item'}
              </li>
            ))}
          </ol>
        );
      
      case 'alert':
        return (
          <div className={`content-alert alert-${block.alertType}`}>
            {block.title && <div className="alert-title">{block.title}</div>}
            <div className="alert-text">{block.text}</div>
          </div>
        );
      
      case 'section_break':
        return <hr className="content-section-break" />;
      
      default:
        return <div className="content-unknown">Unknown content type</div>;
    }
  };

  if (loading) {
    return (
      <div className="editor-page">
        <div className="flex items-center justify-center min-h-screen">
          <div className="p-8 text-center text-lg text-gray-600">Loading slide deck...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="editor-page">
        <div className="flex items-center justify-center min-h-screen">
          <div className="p-8 text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!slideDeckData || !slideDeckData.slides.length) {
    return (
      <div className="editor-page">
        <div className="flex items-center justify-center min-h-screen">
          <div className="p-8 text-center text-gray-500">No slides found</div>
        </div>
      </div>
    );
  }

  const currentSlide = slideDeckData.slides[0]; // Display first slide by default
  const mainContent = getMainSlideContent(currentSlide);

  return (
    <div className="editor-page">
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="nav-left">
          <div className="nav-icon">
            <Home size={16} />
          </div>
          <div className="breadcrumb">
            <span>{slideDeckData.lessonTitle.length > 50 ? slideDeckData.lessonTitle.substring(0, 47) + '...' : slideDeckData.lessonTitle}</span>
          </div>
        </div>
        <div className="nav-right">
          <button className="nav-button theme-button">
            <span className="button-icon">
              <Palette size={16} />
            </span>
            Theme
          </button>
          <button className="nav-button share-button">
            <span className="button-icon">
              <Share2 size={16} />
            </span>
            Share
          </button>
          <button className="nav-button present-button">
            <span className="button-icon">
              <Play size={16} />
            </span>
            Present
            <span className="dropdown-arrow">▼</span>
          </button>
          <button className="nav-button more-button">
            <MoreHorizontal size={16} />
          </button>
          <div className="profile-avatar">
            <User size={16} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Left Sidebar - Slide Thumbnails */}
        <div className="left-sidebar">
          <div className="sidebar-header">
            <button className="close-button">
              <X size={16} />
            </button>
          </div>
          
          <div className="slides-panel">
            <div className="panel-controls">
              <button className="control-icon">📄</button>
              <button className="control-icon">📋</button>
            </div>
            
            <button className="new-slide-button">
              <span className="plus-icon">
                <Plus size={16} />
              </span>
              New
              <span className="dropdown-arrow">▼</span>
            </button>

            <div className="slide-thumbnails">
              {slideDeckData.slides.map((slide, index) => {
                const slideContent = getMainSlideContent(slide);
                return (
                  <div 
                    key={slide.slideId} 
                    className={`slide-thumbnail ${index === activeSlideIndex ? 'active' : ''}`}
                    onClick={() => scrollToSlide(index)}
                  >
                    <div className="slide-number">{slide.slideNumber}</div>
                    <div className="slide-preview">
                      <div className="slide-content">
                        <div className="slide-title-small">{slideContent.title}</div>
                        <div className="slide-text-small">
                          {slideContent.content.split('\n').slice(0, 3).join('\n')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center - Real Slides Display */}
        <div className="center-content">
          <div className="slides-scroll-container" ref={scrollContainerRef}>
            {slideDeckData.slides.map((slide, index) => (
              <div 
                key={slide.slideId} 
                className="real-slide"
                ref={(el) => { slideRefs.current[index] = el; }}
              >
                <div className="slide-header">
                  <h2 className="slide-title">Slide {slide.slideNumber}: {slide.slideTitle}</h2>
                </div>
                <div className="slide-content-blocks">
                  {slide.contentBlocks.map((block, blockIndex) => (
                    <div key={blockIndex} className="content-block">
                      {renderContentBlock(block)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Tools */}
        <div className="right-sidebar">
          <div className="tools-panel">
            <button className="tool-button active">
              <ZoomIn size={16} />
            </button>
            <button className="tool-button">🔵</button>
            <button className="tool-button">📱</button>
            <button className="tool-button">🎨</button>
            <button className="tool-button">📊</button>
            <button className="tool-button">📈</button>
            <button className="tool-button">✏️</button>
          </div>
          
          <div className="zoom-control">
            <button className="zoom-button">
              <ZoomOut size={14} />
            </button>
            <span className="zoom-text">100%</span>
            <button className="zoom-button">
              <ZoomIn size={14} />
            </button>
          </div>
          
          <div className="help-section">
            <button className="help-button">
              <span className="help-text">Get started</span>
              <span className="help-fraction">1/8</span>
            </button>
            <button className="help-icon">
              <HelpCircle size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage; 