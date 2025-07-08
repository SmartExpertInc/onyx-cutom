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
  ChevronRight,
  Trash2,
  AlertTriangle
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
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
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

  // Create filtered slides array - moved here to be used in multiple effects
  const filteredSlides = React.useMemo(() => {
    const displayData = editingSlideDeckData || slideDeckData;
    if (!displayData || !displayData.slides) return [];
    return displayData.slides.filter(slide => {
      const template = slide.deckgoTemplate;
      return template !== 'deckgo-slide-poll' && template !== 'deckgo-slide-chart';
    });
  }, [slideDeckData, editingSlideDeckData]);

  // Handle scroll to update active slide - COMPLETELY REMADE NAVIGATION
  useEffect(() => {
    if (!filteredSlides.length || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    
    // Create intersection observer for more reliable detection
    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisibleSlide = { index: 0, ratio: 0 };
        
        entries.forEach((entry) => {
          const slideIndex = parseInt(entry.target.getAttribute('data-slide-index') || '0');
          
          // Track the slide with highest intersection ratio
          if (entry.intersectionRatio > mostVisibleSlide.ratio) {
            mostVisibleSlide = { index: slideIndex, ratio: entry.intersectionRatio };
          }
        });
        
        // Update active slide if we have significant visibility (>30%)
        if (mostVisibleSlide.ratio > 0.3) {
          setActiveSlideIndex(mostVisibleSlide.index);
        }
      },
      {
        root: container,
        rootMargin: '0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
      }
    );

    // Observe all slides
    slideRefs.current.forEach((slideRef, index) => {
      if (slideRef) {
        slideRef.setAttribute('data-slide-index', index.toString());
        observer.observe(slideRef);
      }
    });

    // Fallback scroll detection for immediate updates
    const handleScroll = () => {
      if (!container || !filteredSlides.length) return;
      
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;
      
      let closestSlide = { index: 0, distance: Infinity };
      
      slideRefs.current.forEach((slideRef, index) => {
        if (slideRef) {
          const slideRect = slideRef.getBoundingClientRect();
          const slideCenter = slideRect.top + slideRect.height / 2;
          const distance = Math.abs(slideCenter - containerCenter);
          
          if (distance < closestSlide.distance) {
            closestSlide = { index, distance };
          }
        }
      });
      
      setActiveSlideIndex(closestSlide.index);
    };

    // Add scroll listener as fallback
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial detection
    setTimeout(handleScroll, 100);
    
    return () => {
      observer.disconnect();
      container.removeEventListener('scroll', handleScroll);
    };
  }, [filteredSlides]);

  // Initialize slide refs array based on filtered slides
  useEffect(() => {
    if (filteredSlides.length > 0) {
      slideRefs.current = new Array(filteredSlides.length).fill(null);
    }
  }, [filteredSlides]);

  // Function to scroll to specific slide - FIXED
  const scrollToSlide = (index: number) => {
    const slideRef = slideRefs.current[index];
    const container = scrollContainerRef.current;
    
    if (slideRef && container) {
      // Immediately set active index
      setActiveSlideIndex(index);
      
      // Calculate the scroll position relative to the container
      const slideTop = slideRef.offsetTop;
      
      // Scroll to the slide position within the container
      container.scrollTo({
        top: slideTop,
        behavior: 'smooth'
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

  const handleDeleteLesson = async () => {
    try {
      // Call the API to delete the lesson using the projects delete-multiple endpoint
      const commonHeaders: HeadersInit = {};
      const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") || "dummy-onyx-user-id-for-testing" : "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === 'development') {
        commonHeaders['X-Dev-Onyx-User-ID'] = devUserId;
      }

      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/delete-multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...commonHeaders,
        },
        credentials: 'same-origin',
        body: JSON.stringify({ 
          project_ids: [parseInt(projectId || '0')], 
          scope: 'self' 
        })
      });

      if (response.ok) {
        // Navigate back to projects page after successful deletion
        window.location.href = '/projects';
      } else {
        console.error('Failed to delete lesson');
        // You might want to show an error message to the user
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      // You might want to show an error message to the user
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
      'CENTER': 'placeholder-center',
      'TOP_LEFT': 'placeholder-top-left',
      'TOP_RIGHT': 'placeholder-top-right',
      'BOTTOM_LEFT': 'placeholder-bottom-left',
      'BOTTOM_RIGHT': 'placeholder-bottom-right'
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
    const hasTopLeft = slide.imagePlaceholders.some(p => p.position === 'TOP_LEFT');
    const hasTopRight = slide.imagePlaceholders.some(p => p.position === 'TOP_RIGHT');
    const hasBottomLeft = slide.imagePlaceholders.some(p => p.position === 'BOTTOM_LEFT');
    const hasBottomRight = slide.imagePlaceholders.some(p => p.position === 'BOTTOM_RIGHT');

    if (hasBackground) return 'content-layout-with-background';
    if (hasLeftImage && hasRightImage) return 'content-layout-center-column';
    if (hasLeftImage) return 'content-layout-avoid-left';
    if (hasRightImage) return 'content-layout-avoid-right';
    if (hasTopBanner) return 'content-layout-avoid-top';
    if (hasBottomBanner) return 'content-layout-avoid-bottom';
    
    // Handle corner positions - only apply top margin when both text and image are on same side
    // For split template or when text is on left and corner image is on right (or vice versa),
    // don't apply top margin, just side restriction
    if (hasTopLeft || hasTopRight) {
      // Check if this is a split template - if so, apply top margin
      if (slide.deckgoTemplate === 'deckgo-slide-split') {
        return 'content-layout-with-top-corners';
      }
      // For non-split templates, just apply side restrictions without top margin
      return 'content-layout-with-corner-sides-only';
    }
    if (hasBottomLeft || hasBottomRight) {
      // Check if this is a split template - if so, apply bottom margin
      if (slide.deckgoTemplate === 'deckgo-slide-split') {
        return 'content-layout-with-bottom-corners';
      }
      // For non-split templates, just apply side restrictions without bottom margin
      return 'content-layout-with-corner-sides-only';
    }
    
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
          <button 
            className="nav-button delete-button"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            <span className="button-icon">
              <Trash2 size={16} />
            </span>
            Delete
          </button>
          <button className="nav-button more-button">
            <MoreHorizontal size={16} />
          </button>
          <div className="profile-avatar">
            <User size={16} />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeleteConfirmation && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-popup">
            <div className="delete-confirmation-header">
              <AlertTriangle size={24} className="warning-icon" />
              <h3>Delete Lesson</h3>
            </div>
            <div className="delete-confirmation-content">
              <p>Are you sure you want to delete this lesson?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="delete-confirmation-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </button>
              <button 
                className="delete-confirm-button"
                onClick={handleDeleteLesson}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
              {filteredSlides.map((slide, index) => {
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
            {filteredSlides.map((slide, index) => (
              <div 
                key={slide.slideId} 
                className={`real-slide ${slide.deckgoTemplate ? `template-${slide.deckgoTemplate.replace('deckgo-slide-', '')}` : 'template-content'} ${getContentLayoutClass(slide)}`}
                ref={(el) => { slideRefs.current[index] = el; }}
              >

                
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