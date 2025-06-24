'use client';
import React from 'react';
import './EditorPage.css';

interface EditorPageProps {}

// Sample slide data
const sampleSlides = [
  {
    id: 1,
    title: "Introduction to React Development",
    content: "React is a powerful JavaScript library for building user interfaces. It allows developers to create interactive and dynamic web applications with ease.",
    author: "Sarah Johnson",
    lastEdited: "2 hours ago",
    type: "title"
  },
  {
    id: 2,
    title: "Component Architecture",
    content: "• Functional Components\n• Class Components\n• Props and State\n• Component Lifecycle",
    author: "Sarah Johnson",
    lastEdited: "2 hours ago",
    type: "bullets"
  },
  {
    id: 3,
    title: "State Management",
    content: "• useState Hook\n• useEffect Hook\n• Context API\n• Redux Integration\n• State Best Practices",
    author: "Sarah Johnson",
    lastEdited: "2 hours ago",
    type: "bullets"
  },
  {
    id: 4,
    title: "Modern React Patterns",
    content: "1. Custom Hooks\n2. Higher-Order Components\n3. Render Props\n4. Compound Components\n5. Error Boundaries",
    author: "Sarah Johnson",
    lastEdited: "2 hours ago",
    type: "numbered"
  }
];

const EditorPage: React.FC<EditorPageProps> = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const slide = sampleSlides[currentSlide];

  return (
    <div className="editor-page">
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="nav-left">
          <div className="nav-icon">🏠</div>
          <div className="breadcrumb">
            <span>{slide.title}</span>
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
              {sampleSlides.map((slideItem, index) => (
                <div
                  key={slideItem.id}
                  className={`slide-thumbnail ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                >
                  <div className="slide-number">{slideItem.id}</div>
                  <div className="slide-preview">
                    <div className="slide-content">
                      <div className="slide-title-small">{slideItem.title}</div>
                      <div className="slide-text-small">
                        {slideItem.content.substring(0, 80)}...
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                  <h1 className="main-title">{slide.title}</h1>
                  <div className="main-description">
                    {slide.type === 'bullets' ? (
                      <ul className="slide-bullet-list">
                        {slide.content.split('\n').map((item, index) => (
                          <li key={index}>{item.replace('•', '').trim()}</li>
                        ))}
                      </ul>
                    ) : slide.type === 'numbered' ? (
                      <ol className="slide-numbered-list">
                        {slide.content.split('\n').map((item, index) => (
                          <li key={index}>{item.replace(/^\d+\.\s*/, '').trim()}</li>
                        ))}
                      </ol>
                    ) : (
                      <p>{slide.content}</p>
                    )}
                  </div>
                  <div className="author-info">
                    <div className="author-avatar">{slide.author.charAt(0)}</div>
                    <div className="author-details">
                      <div className="author-name">by {slide.author}</div>
                      <div className="last-edited">Last edited {slide.lastEdited}</div>
                    </div>
                  </div>
                </div>
                <div className="slide-image-area">
                  <div className="slide-visual-element"></div>
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