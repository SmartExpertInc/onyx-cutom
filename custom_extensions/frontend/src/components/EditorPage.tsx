import React, { useState, useEffect } from 'react';
import { SlideDeckData, DeckSlide, AnyContentBlock } from '@/types/pdfLesson';
import './EditorPage.css';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

interface EditorPageProps {
  projectId?: string;
}

const EditorPage: React.FC<EditorPageProps> = ({ projectId }) => {
  const [slideDeckData, setSlideDeckData] = useState<SlideDeckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <div className="nav-icon">🏠</div>
                  <div className="breadcrumb">
          <span>{slideDeckData.lessonTitle.length > 50 ? slideDeckData.lessonTitle.substring(0, 47) + '...' : slideDeckData.lessonTitle}</span>
        </div>
        </div>
        <div className="nav-right">
          <button className="nav-button theme-button">
            <span className="button-icon">🎨</span>
            Theme
          </button>
          <button className="nav-button share-button">
            <span className="button-icon">🔗</span>
            Share
          </button>
          <button className="nav-button present-button">
            <span className="button-icon">▶️</span>
            Present
            <span className="dropdown-arrow">▼</span>
          </button>
          <button className="nav-button more-button">⋯</button>
          <div className="profile-avatar">M</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Left Sidebar - Slide Thumbnails */}
        <div className="left-sidebar">
          <div className="sidebar-header">
            <button className="close-button">×</button>
          </div>
          
          <div className="slides-panel">
            <div className="panel-controls">
              <button className="control-icon">📄</button>
              <button className="control-icon">📋</button>
            </div>
            
            <button className="new-slide-button">
              <span className="plus-icon">+</span>
              New
              <span className="dropdown-arrow">▼</span>
            </button>

            <div className="slide-thumbnails">
              {slideDeckData.slides.map((slide, index) => {
                const slideContent = getMainSlideContent(slide);
                return (
                  <div key={slide.slideId} className={`slide-thumbnail ${index === 0 ? 'active' : ''}`}>
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

        {/* Center - Main Slide View */}
        <div className="center-content">
          <div className="slide-container">
            <div className="slide-controls">
              <button className="control-button">⋯</button>
              <button className="control-button">🔍</button>
              <button className="control-button">⚙️</button>
            </div>
            
            <div className="main-slide">
              <div className="slide-content-main">
                <div className="slide-text-area">
                  <h1 className="main-title">{mainContent.title}</h1>
                  <p className="main-description">
                    {mainContent.content.split('\n').slice(0, 3).join(' ')}
                  </p>
                  <div className="author-info">
                    <div className="author-avatar">U</div>
                    <div className="author-details">
                      <div className="author-name">Slide Deck</div>
                      <div className="last-edited">{slideDeckData.slides.length} slides</div>
                    </div>
                  </div>
                </div>
                <div className="slide-image-area">
                  <div className="earth-globe-image"></div>
                </div>
              </div>
            </div>

            <div className="slide-bottom-controls">
              <button className="bottom-control">+</button>
              <button className="bottom-control">⚙️</button>
              <button className="bottom-control">▼</button>
            </div>
          </div>

          {/* Bottom slide with city image */}
          <div className="bottom-slide-area">
            <div className="city-landscape-image"></div>
          </div>
        </div>

        {/* Right Sidebar - Tools */}
        <div className="right-sidebar">
          <div className="tools-panel">
            <button className="tool-button active">🔍</button>
            <button className="tool-button">🔵</button>
            <button className="tool-button">📱</button>
            <button className="tool-button">🎨</button>
            <button className="tool-button">📊</button>
            <button className="tool-button">📈</button>
            <button className="tool-button">✏️</button>
          </div>
          
          <div className="zoom-control">
            <span className="zoom-text">100%</span>
          </div>
          
          <div className="help-section">
            <button className="help-button">
              <span className="help-text">Get started</span>
              <span className="help-fraction">1/8</span>
            </button>
            <button className="help-icon">?</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage; 