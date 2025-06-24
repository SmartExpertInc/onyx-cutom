"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SlideDeckData, DeckSlide, AnyContentBlock } from '@/types/pdfLesson';
import { ProjectListItem } from '@/types/products';
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
  FileText,
  Clipboard,
  Circle,
  Smartphone,
  Paintbrush,
  BarChart3,
  TrendingUp,
  Edit,
  ChevronRight
} from 'lucide-react';
import './EditorPage.css';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

interface EditorPageProps {
  projectId?: string;
}

const EditorPage: React.FC<EditorPageProps> = ({ projectId }) => {
  const router = useRouter();
  const [slideDeckData, setSlideDeckData] = useState<SlideDeckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [editingSlideDeckData, setEditingSlideDeckData] = useState<SlideDeckData | null>(null);
  const [allUserMicroproducts, setAllUserMicroproducts] = useState<ProjectListItem[]>([]);
  const [parentProjectName, setParentProjectName] = useState<string | null>(null);
  const [parentProjectId, setParentProjectId] = useState<number | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch slide deck data and parent project information
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

        // Fetch both project data and all projects list
        const [instanceRes, listRes] = await Promise.all([
          fetch(`${CUSTOM_BACKEND_URL}/projects/view/${projectId}`, {
            cache: 'no-store',
            headers: commonHeaders
          }),
          fetch(`${CUSTOM_BACKEND_URL}/projects`, {
            cache: 'no-store',
            headers: commonHeaders
          })
        ]);

        if (!instanceRes.ok) {
          throw new Error(`Failed to fetch project data: ${instanceRes.status}`);
        }

        const projectData = await instanceRes.json();
        
        // Check if this is a slide deck project
        if (projectData.component_name !== 'SlideDeckDisplay') {
          throw new Error("This project is not a slide deck");
        }

        if (projectData.details) {
          const data = projectData.details as SlideDeckData;
          setSlideDeckData(data);
          setEditingSlideDeckData(JSON.parse(JSON.stringify(data))); // Deep copy for editing
        } else {
          throw new Error("No slide deck data found");
        }

        // Handle projects list for breadcrumb navigation
        if (listRes.ok) {
          const allMicroproductsData: ProjectListItem[] = await listRes.json();
          setAllUserMicroproducts(allMicroproductsData);
          
          const currentMicroproductInList = allMicroproductsData.find(mp => mp.id === projectData.project_id);
          if (currentMicroproductInList?.projectName) {
            setParentProjectName(currentMicroproductInList.projectName);
            
            // We need to find the parent training plan by checking all projects with the same project name
            // and looking for the TrainingPlanTable component through their details
            const potentialParents = allMicroproductsData.filter(mp => 
              mp.projectName === currentMicroproductInList.projectName && 
              mp.id !== projectData.project_id
            );
            
            // For now, we'll set the first one as parent if it exists
            // In a real implementation, you'd want to fetch each project's details to check component_name
            if (potentialParents.length > 0) {
              setParentProjectId(potentialParents[0].id);
            }
          }
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

  // Handle scroll to update active slide - FIXED NAVIGATION
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || !slideDeckData) return;

      const container = scrollContainerRef.current;
      const containerTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const viewportTop = containerTop;
      const viewportBottom = containerTop + containerHeight;

      let newActiveIndex = 0;
      let maxVisibilityRatio = 0;

      slideRefs.current.forEach((slideRef, index) => {
        if (slideRef) {
          const slideTop = slideRef.offsetTop;
          const slideHeight = slideRef.offsetHeight;
          const slideBottom = slideTop + slideHeight;

          // If slide is visible in viewport
          if (slideTop < viewportBottom && slideBottom > viewportTop) {
            // Calculate how much of the slide is visible
            const visibleTop = Math.max(slideTop, viewportTop);
            const visibleBottom = Math.min(slideBottom, viewportBottom);
            const visibleHeight = visibleBottom - visibleTop;
            const visibilityRatio = visibleHeight / slideHeight;

            // Track the slide with the highest visibility ratio
            if (visibilityRatio > maxVisibilityRatio) {
              maxVisibilityRatio = visibilityRatio;
              newActiveIndex = index;
            }
          }
        }
      });

      // Update active slide if we have significant visibility
      if (maxVisibilityRatio > 0.2 && newActiveIndex !== activeSlideIndex) {
        setActiveSlideIndex(newActiveIndex);
      }
    };

    const container = scrollContainerRef.current;
    if (container && slideDeckData) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      // Set initial state after a short delay to ensure refs are ready
      const timeoutId = setTimeout(() => {
        handleScroll();
      }, 200);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        clearTimeout(timeoutId);
      };
    }
  }, [slideDeckData, activeSlideIndex]);

  // Initialize slide refs array
  useEffect(() => {
    if (slideDeckData) {
      slideRefs.current = new Array(slideDeckData.slides.length).fill(null);
      // Reset active slide when data changes
      setActiveSlideIndex(0);
    }
  }, [slideDeckData]);

  // Function to scroll to specific slide - FIXED
  const scrollToSlide = (index: number) => {
    const slideRef = slideRefs.current[index];
    if (slideRef && scrollContainerRef.current) {
      // Temporarily set active index to prevent flicker
      setActiveSlideIndex(index);
      
      slideRef.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Navigation functions for breadcrumb
  const navigateToProjects = () => {
    router.push('/projects');
  };

  const navigateToOutline = () => {
    if (parentProjectId) {
      router.push(`/projects/view/${parentProjectId}`);
    }
  };

  // Function to update text content
  const updateTextContent = (slideIndex: number, blockIndex: number, newText: string) => {
    if (!editingSlideDeckData) return;

    const updatedData = { ...editingSlideDeckData };
    const slide = updatedData.slides[slideIndex];
    const block = slide.contentBlocks[blockIndex];

    if (block.type === 'headline' || block.type === 'paragraph') {
      block.text = newText;
    } else if (block.type === 'bullet_list' || block.type === 'numbered_list') {
      // For lists, we'll update the first item for simplicity
      if (block.items.length > 0 && typeof block.items[0] === 'string') {
        block.items[0] = newText;
      }
    }

    setEditingSlideDeckData(updatedData);
  };

  // Function to update slide title
  const updateSlideTitle = (slideIndex: number, newTitle: string) => {
    if (!editingSlideDeckData) return;

    const updatedData = { ...editingSlideDeckData };
    updatedData.slides[slideIndex].slideTitle = newTitle;
    setEditingSlideDeckData(updatedData);
  };

  // Auto-save changes
  const saveChanges = () => {
    if (editingSlideDeckData) {
      setSlideDeckData(editingSlideDeckData);
      // Here you would typically save to backend
      console.log("Auto-saving changes:", editingSlideDeckData);
    }
  };

  // Render content block to text for thumbnails
  const renderContentToText = (blocks: AnyContentBlock[]): string => {
    return blocks.map(block => {
      switch (block.type) {
        case 'headline':
        case 'paragraph':
          return block.text;
        case 'bullet_list':
        case 'numbered_list':
          return block.items.join(', ');
        case 'alert':
          return `${block.title}: ${block.text}`;
        case 'section_break':
          return '---';
        default:
          return '';
      }
    }).join(' ');
  };

  const getMainSlideContent = (slide: DeckSlide) => {
    const contentText = renderContentToText(slide.contentBlocks);
    return {
      title: slide.slideTitle,
      content: contentText
    };
  };

  const renderContentBlock = (block: AnyContentBlock, slideIndex: number, blockIndex: number) => {
    switch (block.type) {
      case 'headline':
        const HeadlineComponent = ({ level, text }: { level: number, text: string }) => {
          const className = `content-headline level-${level} editable-text`;
          const props = {
            className,
            contentEditable: true,
            suppressContentEditableWarning: true,
            onBlur: (e: React.FocusEvent<HTMLElement>) => {
              const newText = e.target.textContent || '';
              updateTextContent(slideIndex, blockIndex, newText);
              saveChanges();
            },
            onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                (e.currentTarget as HTMLElement).blur();
              }
            }
          };
          
          switch (Math.min(level, 6)) {
            case 1: return <h1 {...props}>{text}</h1>;
            case 2: return <h2 {...props}>{text}</h2>;
            case 3: return <h3 {...props}>{text}</h3>;
            case 4: return <h4 {...props}>{text}</h4>;
            case 5: return <h5 {...props}>{text}</h5>;
            case 6: return <h6 {...props}>{text}</h6>;
            default: return <h2 {...props}>{text}</h2>;
          }
        };
        return <HeadlineComponent level={block.level} text={block.text} />;
      
      case 'paragraph':
        return (
          <p 
            className="content-paragraph editable-text"
            contentEditable={true}
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              const newText = e.target.textContent || '';
              updateTextContent(slideIndex, blockIndex, newText);
              saveChanges();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                (e.currentTarget as HTMLElement).blur();
              }
            }}
          >
            {block.text}
          </p>
        );
      
      case 'bullet_list':
        return (
          <ul className="content-bullet-list">
            {block.items.map((item, itemIndex) => (
              <li 
                key={itemIndex} 
                className="bullet-item editable-text"
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  const newText = e.target.textContent || '';
                  if (editingSlideDeckData) {
                    const updatedData = { ...editingSlideDeckData };
                    const slide = updatedData.slides[slideIndex];
                    const listBlock = slide.contentBlocks[blockIndex];
                    if (listBlock.type === 'bullet_list' || listBlock.type === 'numbered_list') {
                      listBlock.items[itemIndex] = newText;
                      setEditingSlideDeckData(updatedData);
                      saveChanges();
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).blur();
                  }
                }}
              >
                {typeof item === 'string' ? item : JSON.stringify(item)}
              </li>
            ))}
          </ul>
        );
      
      case 'numbered_list':
        return (
          <ol className="content-numbered-list">
            {block.items.map((item, itemIndex) => (
              <li 
                key={itemIndex} 
                className="numbered-item editable-text"
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  const newText = e.target.textContent || '';
                  if (editingSlideDeckData) {
                    const updatedData = { ...editingSlideDeckData };
                    const slide = updatedData.slides[slideIndex];
                    const listBlock = slide.contentBlocks[blockIndex];
                    if (listBlock.type === 'bullet_list' || listBlock.type === 'numbered_list') {
                      listBlock.items[itemIndex] = newText;
                      setEditingSlideDeckData(updatedData);
                      saveChanges();
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).blur();
                  }
                }}
              >
                {typeof item === 'string' ? item : JSON.stringify(item)}
              </li>
            ))}
          </ol>
        );
      
      case 'alert':
        return (
          <div className={`content-alert alert-${block.alertType}`}>
            <div 
              className="alert-title editable-text"
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => {
                const newTitle = e.target.textContent || '';
                if (editingSlideDeckData) {
                  const updatedData = { ...editingSlideDeckData };
                  const slide = updatedData.slides[slideIndex];
                  const alertBlock = slide.contentBlocks[blockIndex];
                  if (alertBlock.type === 'alert') {
                    alertBlock.title = newTitle;
                    setEditingSlideDeckData(updatedData);
                    saveChanges();
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  (e.currentTarget as HTMLElement).blur();
                }
              }}
            >
              {block.title}
            </div>
            <div 
              className="alert-text editable-text"
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => {
                const newText = e.target.textContent || '';
                if (editingSlideDeckData) {
                  const updatedData = { ...editingSlideDeckData };
                  const slide = updatedData.slides[slideIndex];
                  const alertBlock = slide.contentBlocks[blockIndex];
                  if (alertBlock.type === 'alert') {
                    alertBlock.text = newText;
                    setEditingSlideDeckData(updatedData);
                    saveChanges();
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  (e.currentTarget as HTMLElement).blur();
                }
              }}
            >
              {block.text}
            </div>
          </div>
        );
      
      case 'section_break':
        return <hr className="content-section-break" />;
      
      default:
        return <div className="content-unknown">Unknown content type: {(block as any).type}</div>;
    }
  };

  if (loading) {
    return (
      <div className="editor-page">
        <div className="loading-container">
          <div className="p-8 text-center text-gray-500">Loading slide deck...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="editor-page">
        <div className="error-container">
          <div className="p-8 text-center text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!slideDeckData || !slideDeckData.slides || slideDeckData.slides.length === 0) {
    return (
      <div className="editor-page">
        <div className="no-slides-container">
          <div className="p-8 text-center text-gray-500">No slides found</div>
        </div>
      </div>
    );
  }

  // Use editing data if available, otherwise use original data
  const displayData = editingSlideDeckData || slideDeckData;

  return (
    <div className="editor-page">
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="nav-left">
          <button className="nav-icon breadcrumb-button" onClick={navigateToProjects}>
            <Home size={16} />
          </button>
          <div className="breadcrumb">
            {parentProjectName && parentProjectId && (
              <>
                <ChevronRight size={14} className="breadcrumb-separator" />
                <button 
                  className="breadcrumb-link"
                  onClick={navigateToOutline}
                >
                  {parentProjectName}
                </button>
              </>
            )}
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-current">
              {displayData.lessonTitle.length > 40 ? displayData.lessonTitle.substring(0, 37) + '...' : displayData.lessonTitle}
            </span>
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
              <button className="control-icon">
                <FileText size={16} />
              </button>
              <button className="control-icon">
                <Clipboard size={16} />
              </button>
            </div>
            
            <button className="new-slide-button">
              <span className="plus-icon">
                <Plus size={16} />
              </span>
              New
              <span className="dropdown-arrow">▼</span>
            </button>

            <div className="slide-thumbnails">
              {displayData.slides.map((slide, index) => {
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
            {displayData.slides.map((slide, index) => (
              <div 
                key={slide.slideId} 
                className="real-slide"
                ref={(el) => { slideRefs.current[index] = el; }}
              >
                <div className="slide-header">
                  <h2 
                    className="slide-title editable-text"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                      const newTitle = e.target.textContent || '';
                      // Extract title without the "Slide X:" prefix
                      const titleWithoutPrefix = newTitle.replace(/^Slide \d+:\s*/, '');
                      updateSlideTitle(index, titleWithoutPrefix);
                      saveChanges();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        (e.currentTarget as HTMLElement).blur();
                      }
                    }}
                  >
                    Slide {slide.slideNumber}: {slide.slideTitle}
                  </h2>
                </div>
                <div className="slide-content-blocks">
                  {slide.contentBlocks.map((block, blockIndex) => (
                    <div key={blockIndex} className="content-block">
                      {renderContentBlock(block, index, blockIndex)}
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
            <button className="tool-button">
              <Circle size={16} />
            </button>
            <button className="tool-button">
              <Smartphone size={16} />
            </button>
            <button className="tool-button">
              <Paintbrush size={16} />
            </button>
            <button className="tool-button">
              <BarChart3 size={16} />
            </button>
            <button className="tool-button">
              <TrendingUp size={16} />
            </button>
            <button className="tool-button">
              <Edit size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage; 