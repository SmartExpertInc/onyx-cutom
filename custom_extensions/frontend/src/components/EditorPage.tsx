"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SlideDeckData, DeckSlide, AnyContentBlock, ImagePlaceholder } from '@/types/pdfLesson';
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
  const isManualScrolling = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

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
            
            // Find the parent training plan by looking for projects with the same project name
            // and checking if they are TrainingPlanTable components
            const potentialParents = allMicroproductsData.filter(mp => 
              mp.projectName === currentMicroproductInList.projectName && 
              mp.id !== projectData.project_id
            );
            
            // Try to find the TrainingPlanTable component by checking each potential parent
            for (const parent of potentialParents) {
              try {
                const parentRes = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${parent.id}`, {
                  cache: 'no-store',
                  headers: commonHeaders
                });
                
                if (parentRes.ok) {
                  const parentData = await parentRes.json();
                  if (parentData.component_name === 'TrainingPlanTable') {
                    setParentProjectId(parent.id);
                    break; // Found the training plan, stop searching
                  }
                }
              } catch (err) {
                console.warn(`Failed to check parent project ${parent.id}:`, err);
                continue;
              }
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

  // Initialize slide refs array
  useEffect(() => {
    if (slideDeckData?.slides) {
      slideRefs.current = new Array(slideDeckData.slides.length).fill(null);
    }
  }, [slideDeckData?.slides?.length]);

  // BULLETPROOF Navigation using Intersection Observer
  useEffect(() => {
    if (!slideDeckData?.slides?.length || !scrollContainerRef.current) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create intersection observer with optimal settings
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isManualScrolling.current) return;

        // Find the slide with the highest intersection ratio
        let maxRatio = 0;
        let activeIndex = 0;

        entries.forEach((entry) => {
          const slideIndex = slideRefs.current.findIndex(ref => ref === entry.target);
          if (slideIndex !== -1 && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            activeIndex = slideIndex;
          }
        });

        // Only update if we have a significant intersection (> 0.1)
        if (maxRatio > 0.1) {
          setActiveSlideIndex(activeIndex);
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '-10% 0px -10% 0px', // Only consider slides that are significantly visible
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0] // Multiple thresholds for precise detection
      }
    );

    // Observe all slides
    slideRefs.current.forEach((slideRef) => {
      if (slideRef && observerRef.current) {
        observerRef.current.observe(slideRef);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [slideDeckData?.slides?.length]);

  // Handle thumbnail click navigation - GUARANTEED TO WORK
  const handleThumbnailClick = (slideIndex: number) => {
    const slideRef = slideRefs.current[slideIndex];
    const scrollContainer = scrollContainerRef.current;
    
    if (!slideRef || !scrollContainer) return;

    // Prevent observer updates during manual scrolling
    isManualScrolling.current = true;
    
    // Immediately update active index for instant visual feedback
    setActiveSlideIndex(slideIndex);

    // Calculate exact scroll position
    const containerRect = scrollContainer.getBoundingClientRect();
    const slideRect = slideRef.getBoundingClientRect();
    const scrollTop = scrollContainer.scrollTop;
    
    // Calculate target scroll position to center the slide
    const targetScrollTop = scrollTop + slideRect.top - containerRect.top - (containerRect.height / 2) + (slideRect.height / 2);

    // Smooth scroll to exact position
    scrollContainer.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });

    // Re-enable observer after scroll completes
    setTimeout(() => {
      isManualScrolling.current = false;
    }, 1500); // Longer timeout to ensure scroll completes
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

  // Function to parse and render bold text from markdown
  const parseTextWithBold = (text: string) => {
    // Split text by **bold** markers
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove ** markers and make bold
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      return part;
    });
  };

  // Function to render content block with bold text support
  const renderContentBlock = (block: AnyContentBlock, slideIndex: number, blockIndex: number) => {
    switch (block.type) {
      case 'headline':
        const HeadlineComponent = ({ level, text }: { level: number, text: string }) => {
          const headingLevel = Math.min(level + 1, 6);
          const className = `content-headline level-${level} editable-text`;
          const handleBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
            updateTextContent(slideIndex, blockIndex, e.currentTarget.textContent || '');
          };
          
          const content = parseTextWithBold(text);
          
          switch (headingLevel) {
            case 1: return <h1 className={className} onClick={() => {}} onBlur={handleBlur} contentEditable suppressContentEditableWarning={true}>{content}</h1>;
            case 2: return <h2 className={className} onClick={() => {}} onBlur={handleBlur} contentEditable suppressContentEditableWarning={true}>{content}</h2>;
            case 3: return <h3 className={className} onClick={() => {}} onBlur={handleBlur} contentEditable suppressContentEditableWarning={true}>{content}</h3>;
            case 4: return <h4 className={className} onClick={() => {}} onBlur={handleBlur} contentEditable suppressContentEditableWarning={true}>{content}</h4>;
            case 5: return <h5 className={className} onClick={() => {}} onBlur={handleBlur} contentEditable suppressContentEditableWarning={true}>{content}</h5>;
            case 6: return <h6 className={className} onClick={() => {}} onBlur={handleBlur} contentEditable suppressContentEditableWarning={true}>{content}</h6>;
            default: return <h2 className={className} onClick={() => {}} onBlur={handleBlur} contentEditable suppressContentEditableWarning={true}>{content}</h2>;
          }
        };
        return <HeadlineComponent key={blockIndex} level={block.level} text={block.text} />;
      
      case 'paragraph':
        return (
          <p 
            key={blockIndex} 
            className="content-paragraph editable-text"
            onClick={() => {}}
            onBlur={(e: React.FocusEvent<HTMLParagraphElement>) => updateTextContent(slideIndex, blockIndex, e.currentTarget.textContent || '')}
            contentEditable
            suppressContentEditableWarning={true}
          >
            {parseTextWithBold(block.text)}
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

  // Render image placeholders
  const renderImagePlaceholder = (placeholder: ImagePlaceholder, index: number) => {
    const sizeClasses = {
      'LARGE': 'placeholder-large',
      'MEDIUM': 'placeholder-medium', 
      'SMALL': 'placeholder-small',
      'BANNER': 'placeholder-banner',
      'BACKGROUND': 'placeholder-background'
    };

    const positionClasses = {
      'LEFT': 'placeholder-left',
      'RIGHT': 'placeholder-right',
      'TOP_BANNER': 'placeholder-top-banner',
      'BOTTOM_BANNER': 'placeholder-bottom-banner', 
      'BACKGROUND': 'placeholder-background-pos',
      'CENTER': 'placeholder-center'
    };

    return (
      <div 
        key={index}
        className={`image-placeholder ${sizeClasses[placeholder.size as keyof typeof sizeClasses] || 'placeholder-medium'} ${positionClasses[placeholder.position as keyof typeof positionClasses] || 'placeholder-center'}`}
      >
        <div className="placeholder-content">
          <div className="placeholder-icon">🖼️</div>
          <div className="placeholder-size">{placeholder.size}</div>
          <div className="placeholder-position">{placeholder.position}</div>
          <div className="placeholder-description">{placeholder.description}</div>
        </div>
      </div>
    );
  };

  // Function to determine content layout based on image placeholders
  const getContentLayoutClass = (slide: DeckSlide) => {
    if (!slide.imagePlaceholders || slide.imagePlaceholders.length === 0) {
      return 'content-layout-default';
    }

    const hasLeftImage = slide.imagePlaceholders.some(p => p.position === 'LEFT');
    const hasRightImage = slide.imagePlaceholders.some(p => p.position === 'RIGHT');
    const hasTopBanner = slide.imagePlaceholders.some(p => p.position === 'TOP_BANNER');
    const hasBottomBanner = slide.imagePlaceholders.some(p => p.position === 'BOTTOM_BANNER');
    const hasBackground = slide.imagePlaceholders.some(p => p.position === 'BACKGROUND');

    if (hasBackground) return 'content-layout-with-background';
    if (hasLeftImage && hasRightImage) return 'content-layout-center-column';
    if (hasLeftImage) return 'content-layout-avoid-left';
    if (hasRightImage) return 'content-layout-avoid-right';
    if (hasTopBanner) return 'content-layout-avoid-top';
    if (hasBottomBanner) return 'content-layout-avoid-bottom';
    
    return 'content-layout-default';
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
                    onClick={() => handleThumbnailClick(index)}
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
                className={`real-slide ${slide.deckgoTemplate ? `template-${slide.deckgoTemplate.replace('deckgo-slide-', '')}` : 'template-content'} ${getContentLayoutClass(slide)}`}
                ref={(el) => { slideRefs.current[index] = el; }}
              >
                {slide.deckgoTemplate && (
                  <div className="template-badge">
                    {slide.deckgoTemplate.replace('deckgo-slide-', '').toUpperCase()}
                  </div>
                )}
                
                {/* Image Placeholders */}
                {slide.imagePlaceholders && slide.imagePlaceholders.length > 0 && (
                  <div className="slide-image-placeholders">
                    {slide.imagePlaceholders.map((placeholder, placeholderIndex) => 
                      renderImagePlaceholder(placeholder, placeholderIndex)
                    )}
                  </div>
                )}
                
                <div className="slide-content-blocks">
                  {slide.deckgoTemplate === 'deckgo-slide-split' ? (
                    // Split template: divide content blocks into two columns
                    <>
                      <div className="split-column-left">
                        {slide.contentBlocks.slice(0, Math.ceil(slide.contentBlocks.length / 2)).map((block, blockIndex) => (
                          <div key={blockIndex} className="content-block">
                            {renderContentBlock(block, index, blockIndex)}
                          </div>
                        ))}
                      </div>
                      <div className="split-column-right">
                        {slide.contentBlocks.slice(Math.ceil(slide.contentBlocks.length / 2)).map((block, blockIndex) => {
                          const adjustedIndex = blockIndex + Math.ceil(slide.contentBlocks.length / 2);
                          return (
                            <div key={adjustedIndex} className="content-block">
                              {renderContentBlock(block, index, adjustedIndex)}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    // Regular template: single column layout
                    slide.contentBlocks.map((block, blockIndex) => (
                      <div key={blockIndex} className="content-block">
                        {renderContentBlock(block, index, blockIndex)}
                      </div>
                    ))
                  )}
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