import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import groupImg from '/group_img.png';

export interface ChallengesSolutionsItem {
  title: string;
}

export interface ChallengesSolutionsTemplateProps {
  title?: string;
  subtitle?: string;
  challengesItems?: ChallengesSolutionsItem[];
  solutionsItems?: ChallengesSolutionsItem[];
  theme?: SlideTheme;
  isEditable?: boolean;
  onUpdate?: (data: any) => void;
}

const ChallengesSolutionsTemplate: React.FC<ChallengesSolutionsTemplateProps> = ({
  title = 'Challenges & Solution',
  subtitle = 'Type The Subtitle Of Your Great Here',
  challengesItems = [
    { title: 'Title goes here' },
    { title: 'Title goes here' },
    { title: 'Title goes here' }
  ],
  solutionsItems = [
    { title: 'Title goes here' },
    { title: 'Title goes here' },
    { title: 'Title goes here' }
  ],
  theme,
  isEditable = false,
  onUpdate
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingChallengesItems, setEditingChallengesItems] = useState<number[]>([]);
  const [editingSolutionsItems, setEditingSolutionsItems] = useState<number[]>([]);
  const autoSaveTimeoutRef = useRef<number | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const slideStyles: React.CSSProperties = {
    background: '#ffffff',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Georgia, serif',
    minHeight: '600px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  };

  const titleStyles: React.CSSProperties = {
    color: '#000000',
    fontSize: '2.5rem',
    fontFamily: 'Georgia, serif',
    marginBottom: '10px',
    textAlign: 'left',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };

  const subtitleStyles: React.CSSProperties = {
    color: '#000000',
    fontSize: '1.1rem',
    fontFamily: 'Arial, sans-serif',
    marginBottom: '40px',
    textAlign: 'left',
    wordWrap: 'break-word',
    fontWeight: 'normal'
  };

  const mainContentStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    position: 'relative',
    height: '400px'
  };

  // Venn diagram circles
  const leftCircleStyles: React.CSSProperties = {
    position: 'absolute',
    left: '25%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: '#B3E5FC', // Light blue
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  };

  const rightCircleStyles: React.CSSProperties = {
    position: 'absolute',
    right: '25%',
    top: '50%',
    transform: 'translate(50%, -50%)',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: '#4FC3F7', // Turquoise blue
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  };

  const overlapStyles: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: '#29B6F6', // Darker blue for overlap
    zIndex: 1
  };

  const circleLabelStyles: React.CSSProperties = {
    color: '#000000',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
    marginTop: '10px'
  };

  const iconStyles: React.CSSProperties = {
    width: '40px',
    height: '40px',
    objectFit: 'contain'
  };

  // Dotted lines and items
  const leftItemsContainerStyles: React.CSSProperties = {
    position: 'absolute',
    left: '5%',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    zIndex: 3
  };

  const rightItemsContainerStyles: React.CSSProperties = {
    position: 'absolute',
    right: '5%',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    zIndex: 3
  };

  const itemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const itemIconStyles: React.CSSProperties = {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#1976D2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  const itemTextStyles: React.CSSProperties = {
    color: '#000000',
    fontSize: '0.9rem',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal'
  };

  // Dotted line styles
  const dottedLineStyles: React.CSSProperties = {
    position: 'absolute',
    height: '2px',
    background: 'repeating-linear-gradient(to right, #1976D2 0px, #1976D2 4px, transparent 4px, transparent 8px)',
    zIndex: 1
  };

  // Handlers
  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const handleChallengesItemSave = (index: number, newTitle: string) => {
    if (onUpdate && challengesItems) {
      const updatedItems = [...challengesItems];
      updatedItems[index] = { ...updatedItems[index], title: newTitle };
      onUpdate({ challengesItems: updatedItems });
    }
    setEditingChallengesItems(editingChallengesItems.filter((i: number) => i !== index));
  };

  const handleSolutionsItemSave = (index: number, newTitle: string) => {
    if (onUpdate && solutionsItems) {
      const updatedItems = [...solutionsItems];
      updatedItems[index] = { ...updatedItems[index], title: newTitle };
      onUpdate({ solutionsItems: updatedItems });
    }
    setEditingSolutionsItems(editingSolutionsItems.filter((i: number) => i !== index));
  };

  const startEditingTitle = () => {
    if (isEditable) {
      setEditingTitle(true);
    }
  };

  const startEditingSubtitle = () => {
    if (isEditable) {
      setEditingSubtitle(true);
    }
  };

  const startEditingChallengesItem = (index: number) => {
    if (isEditable) {
      setEditingChallengesItems([...editingChallengesItems, index]);
    }
  };

  const startEditingSolutionsItem = (index: number) => {
    if (isEditable) {
      setEditingSolutionsItems([...editingSolutionsItems, index]);
    }
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
  };

  const handleChallengesItemCancel = (index: number) => {
    setEditingChallengesItems(editingChallengesItems.filter((i: number) => i !== index));
  };

  const handleSolutionsItemCancel = (index: number) => {
    setEditingSolutionsItems(editingSolutionsItems.filter((i: number) => i !== index));
  };

  // Inline Editor Component
  const InlineEditor: React.FC<{
    initialValue: string;
    onSave: (value: string) => void;
    onCancel: () => void;
    style?: React.CSSProperties;
    placeholder?: string;
  }> = ({ initialValue, onSave, onCancel, style, placeholder }) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSave(value);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    const handleBlur = () => {
      onSave(value);
    };

    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        style={style}
        placeholder={placeholder}
      />
    );
  };

  return (
    <div style={slideStyles}>
      {/* Title */}
      {editingTitle ? (
        <InlineEditor
          initialValue={title}
          onSave={handleTitleSave}
          onCancel={handleTitleCancel}
          style={titleStyles}
          placeholder="Enter title..."
        />
      ) : (
        <h1 
          style={titleStyles}
          onClick={startEditingTitle}
          className={isEditable ? 'cursor-pointer' : ''}
        >
          {title}
        </h1>
      )}

      {/* Subtitle */}
      {editingSubtitle ? (
        <InlineEditor
          initialValue={subtitle}
          onSave={handleSubtitleSave}
          onCancel={handleSubtitleCancel}
          style={subtitleStyles}
          placeholder="Enter subtitle..."
        />
      ) : (
        <h2 
          style={subtitleStyles}
          onClick={startEditingSubtitle}
          className={isEditable ? 'cursor-pointer' : ''}
        >
          {subtitle}
        </h2>
      )}

      <div style={mainContentStyles}>
        {/* Overlap area */}
        <div style={overlapStyles}></div>

        {/* Left Circle - Challenges */}
        <div style={leftCircleStyles}>
          <img src={groupImg} alt="Challenges" style={iconStyles} />
          <div style={circleLabelStyles}>Challenges</div>
        </div>

        {/* Right Circle - Solutions */}
        <div style={rightCircleStyles}>
          <img src={groupImg} alt="Solutions" style={iconStyles} />
          <div style={circleLabelStyles}>Solution</div>
        </div>

        {/* Left Items - Challenges */}
        <div style={leftItemsContainerStyles}>
          {challengesItems.map((item, index) => (
            <div key={index} style={itemStyles}>
              <div style={itemIconStyles}>
                <div style={{ color: '#ffffff', fontSize: '10px' }}>💬</div>
              </div>
              {editingChallengesItems.includes(index) ? (
                <InlineEditor
                  initialValue={item.title}
                  onSave={(newTitle) => handleChallengesItemSave(index, newTitle)}
                  onCancel={() => handleChallengesItemCancel(index)}
                  style={itemTextStyles}
                  placeholder="Enter title..."
                />
              ) : (
                <div 
                  style={itemTextStyles}
                  onClick={() => startEditingChallengesItem(index)}
                  className={isEditable ? 'cursor-pointer' : ''}
                >
                  {item.title}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Items - Solutions */}
        <div style={rightItemsContainerStyles}>
          {solutionsItems.map((item, index) => (
            <div key={index} style={itemStyles}>
              <div style={itemIconStyles}>
                <div style={{ color: '#ffffff', fontSize: '10px' }}>💬</div>
              </div>
              {editingSolutionsItems.includes(index) ? (
                <InlineEditor
                  initialValue={item.title}
                  onSave={(newTitle) => handleSolutionsItemSave(index, newTitle)}
                  onCancel={() => handleSolutionsItemCancel(index)}
                  style={itemTextStyles}
                  placeholder="Enter title..."
                />
              ) : (
                <div 
                  style={itemTextStyles}
                  onClick={() => startEditingSolutionsItem(index)}
                  className={isEditable ? 'cursor-pointer' : ''}
                >
                  {item.title}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChallengesSolutionsTemplate;