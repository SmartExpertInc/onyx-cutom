import React from 'react';
import './EditorPage.css';

interface EditorPageProps {}

const EditorPage: React.FC<EditorPageProps> = () => {
  return (
    <div className="editor-page">
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="nav-left">
          <div className="nav-icon">🏠</div>
          <div className="breadcrumb">
            <span>Understanding Global Warming: A Critical ...</span>
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
              {/* Slide 1 - Active */}
              <div className="slide-thumbnail active">
                <div className="slide-number">1</div>
                <div className="slide-preview">
                  <div className="slide-content">
                    <div className="slide-title-small">Understanding Global Warming: A Critical Overview</div>
                    <div className="slide-image-placeholder earth-image"></div>
                  </div>
                </div>
              </div>

              {/* Slide 2 */}
              <div className="slide-thumbnail">
                <div className="slide-number">2</div>
                <div className="slide-preview">
                  <div className="slide-content">
                    <div className="slide-title-small">Understanding the Root Causes</div>
                    <div className="slide-text-small">
                      • Greenhouse gas emissions
                      • Industrial activities
                      • Deforestation
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3 */}
              <div className="slide-thumbnail">
                <div className="slide-number">3</div>
                <div className="slide-preview">
                  <div className="slide-content">
                    <div className="slide-title-small">Greenhouse Impacts and Consequences</div>
                    <div className="slide-text-small">
                      • Rising sea levels
                      • Extreme weather
                      • Ecosystem disruption
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 4 */}
              <div className="slide-thumbnail">
                <div className="slide-number">4</div>
                <div className="slide-preview">
                  <div className="slide-content">
                    <div className="slide-title-small">The Urgency of Global Action</div>
                    <div className="slide-text-small">
                      • International cooperation
                      • Policy changes
                      • Individual responsibility
                    </div>
                  </div>
                </div>
              </div>
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
                  <h1 className="main-title">Understanding Global Warming: A Critical Overview</h1>
                  <p className="main-description">
                    Global warming is the gradual, long-term increase in Earth's average 
                    surface temperature. It is primarily driven by human activities that 
                    enhance the natural greenhouse effect. This phenomenon traps the 
                    sun's heat, warming our planet.
                  </p>
                  <div className="author-info">
                    <div className="author-avatar">M</div>
                    <div className="author-details">
                      <div className="author-name">by Mykola Volynets</div>
                      <div className="last-edited">Last edited 1 day ago</div>
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