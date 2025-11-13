import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import Image from 'next/image';
import contradImg from './contrad_img.png';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

export interface ContraindicationsIndicationsTemplateProps {
  title?: string;
  subtitle?: string;
  theme?: string;
  isEditable?: boolean;
  slideId?: string;
  onUpdate?: (data: Partial<ContraindicationsIndicationsTemplateProps>) => void;
}

const ContraindicationsIndicationsTemplate: React.FC<ContraindicationsIndicationsTemplateProps> = ({
  title = 'Contraindications and Indications',
  subtitle = 'Type The Subtitle Of Your Great Here',
  theme,
  isEditable = true,
  slideId = 'contraindications-indications',
  onUpdate
}: ContraindicationsIndicationsTemplateProps) => {
  const currentTheme = getSlideTheme(theme) || DEFAULT_SLIDE_THEME;
  
  // Состояние для текстовых элементов
  const [leftProjectTitle, setLeftProjectTitle] = useState('The first project');
  const [rightProjectTitle, setRightProjectTitle] = useState('The second project');
  const [leftHeadings, setLeftHeadings] = useState(['Heading text goes here', 'Heading text goes here', 'Heading text goes here']);
  const [rightHeadings, setRightHeadings] = useState(['Heading text goes here', 'Heading text goes here', 'Heading text goes here']);
  const [leftDescriptions, setLeftDescriptions] = useState(['Lorem ipsum dolor sit amet, consectetur elit, sed do', 'Lorem ipsum dolor sit amet, consectetur elit, sed do', 'Lorem ipsum dolor sit amet, consectetur elit, sed do']);
  const [rightDescriptions, setRightDescriptions] = useState(['Lorem ipsum dolor sit amet, consectetur elit, sed do', 'Lorem ipsum dolor sit amet, consectetur elit, sed do', 'Lorem ipsum dolor sit amet, consectetur elit, sed do']);
  
  // Состояния редактирования
  const [editingLeftProject, setIsEditingLeftProject] = useState(false);
  const [editingRightProject, setIsEditingRightProject] = useState(false);
  const [editingLeftHeadings, setEditingLeftHeadings] = useState([false, false, false]);
  const [editingRightHeadings, setEditingRightHeadings] = useState([false, false, false]);
  const [editingLeftDescriptions, setEditingLeftDescriptions] = useState([false, false, false]);
  const [editingRightDescriptions, setEditingRightDescriptions] = useState([false, false, false]);
  
  
  // Позиционирование элементов
  const [leftProjectPosition, setLeftProjectPosition] = useState({ left: '4.8%', top: '50%' });
  const [rightProjectPosition, setRightProjectPosition] = useState({ right: '-2%', top: '50%' });
  const [leftItemsPositions, setLeftItemsPositions] = useState([
    { left: '23%', top: '27%' },
    { left: '26%', top: '44%' },
    { left: '22%', top: '62%' }
  ]);
  const [rightItemsPositions, setRightItemsPositions] = useState([
    { right: '23%', top: '27%' },
    { right: '26%', top: '44%' },
    { right: '22%', top: '62%' }
  ]);
  
  const slideContainerRef = useRef<HTMLDivElement>(null);


  const handleLeftProjectSave = (value: string) => {
    setLeftProjectTitle(value);
    setIsEditingLeftProject(false);
  };

  const handleRightProjectSave = (value: string) => {
    setRightProjectTitle(value);
    setIsEditingRightProject(false);
  };

  const handleLeftHeadingSave = (index: number, value: string) => {
    const newHeadings = [...leftHeadings];
    newHeadings[index] = value;
    setLeftHeadings(newHeadings);
    const newEditingStates = [...editingLeftHeadings];
    newEditingStates[index] = false;
    setEditingLeftHeadings(newEditingStates);
  };

  const handleRightHeadingSave = (index: number, value: string) => {
    const newHeadings = [...rightHeadings];
    newHeadings[index] = value;
    setRightHeadings(newHeadings);
    const newEditingStates = [...editingRightHeadings];
    newEditingStates[index] = false;
    setEditingRightHeadings(newEditingStates);
  };

  const handleLeftDescriptionSave = (index: number, value: string) => {
    const newDescriptions = [...leftDescriptions];
    newDescriptions[index] = value;
    setLeftDescriptions(newDescriptions);
    const newEditingStates = [...editingLeftDescriptions];
    newEditingStates[index] = false;
    setEditingLeftDescriptions(newEditingStates);
  };

  const handleRightDescriptionSave = (index: number, value: string) => {
    const newDescriptions = [...rightDescriptions];
    newDescriptions[index] = value;
    setRightDescriptions(newDescriptions);
    const newEditingStates = [...editingRightDescriptions];
    newEditingStates[index] = false;
    setEditingRightDescriptions(newEditingStates);
  };


  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: '#ffffff',
    padding: '40px',
        display: 'flex',
        flexDirection: 'column',
    fontFamily: 'Georgia, serif',
    minHeight: '600px',
    position: 'relative',
    overflow: 'hidden'
  };


  const mainContentStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
        position: 'relative',
    height: '400px',
    width: '100%'
  };

  const imageContainerStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  };

  return (
    <div style={slideStyles} ref={slideContainerRef}>

      {/* Main Content with Image */}
      <div style={mainContentStyles}>
        <div style={imageContainerStyles}>
          <Image src={contradImg} alt="Contraindications and Indications" style={{width: '100%'}} />
        </div>

        {/* Vertical Line - Full Height */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '2px',
          height: '100%',
          background: 'linear-gradient(to bottom, transparent, #0F58F9, transparent)',
          zIndex: 10
        }}></div>

        {/* VS Button - Center */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70px',
          height: '50px',
          borderRadius: '40px',
          background: '#0F58F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          zIndex: 20,
        }}>
          VS
        </div>

        {/* Left Project Title */}
        <div style={{
          position: 'absolute',
          left: leftProjectPosition.left,
          top: leftProjectPosition.top,
          transform: 'translateY(-50%)',
          zIndex: 10
        }}>
          <div data-draggable="true" style={{ display: 'inline-block' }}>
            {editingLeftProject ? (
              <WysiwygEditor
                initialValue={leftProjectTitle}
                onSave={handleLeftProjectSave}
                onCancel={() => setIsEditingLeftProject(false)}
                placeholder="Enter project title"
                className="inline-editor-left-project"
                style={{
                  width: '200px',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  fontFamily: 'Arial, sans-serif',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  minWidth: '150px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block',
                  lineHeight: '1.2'
                }}
              />
            ) : (
              <div
                style={{
                  width: '200px',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  fontFamily: 'Arial, sans-serif',
                  cursor: isEditable ? 'pointer' : 'default',
                  padding: '10px',
                  borderRadius: '8px',
                  minWidth: '150px'
                }}
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    setIsEditingLeftProject(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                dangerouslySetInnerHTML={{ __html: leftProjectTitle }}
              />
            )}
          </div>
        </div>

        {/* Right Project Title */}
        <div style={{ 
          position: 'absolute',
          right: rightProjectPosition.right,
          top: rightProjectPosition.top,
          transform: 'translateY(-50%)',
          zIndex: 10
        }}>
          <div data-draggable="true" style={{ display: 'inline-block' }}>
            {editingRightProject ? (
              <WysiwygEditor
                initialValue={rightProjectTitle}
                onSave={handleRightProjectSave}
                onCancel={() => setIsEditingRightProject(false)}
                placeholder="Enter project title"
                className="inline-editor-right-project"
                style={{
                  fontSize: '1.5rem',
                  color: '#ffffff',
                  fontFamily: 'Arial, sans-serif',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  minWidth: '150px',
                  width: '200px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block',
                  lineHeight: '1.2'
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: '1.5rem',
                  color: '#ffffff',
                  fontFamily: 'Arial, sans-serif',
                  cursor: isEditable ? 'pointer' : 'default',
                  padding: '10px',
                  borderRadius: '8px',
                  minWidth: '150px',
                  width: '200px'
                }}
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    setIsEditingRightProject(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                dangerouslySetInnerHTML={{ __html: rightProjectTitle }}
              />
            )}
          </div>
        </div>
          
        {/* Left Side Text Blocks */}
        {leftHeadings.map((heading: string, index: number) => (
          <div 
            key={`left-${index}`} 
            style={{
              position: 'absolute',
              left: leftItemsPositions[index].left,
              top: leftItemsPositions[index].top,
              zIndex: 10,
              maxWidth: '200px'
            }}
          >
            {/* Heading */}
            <div data-draggable="true" style={{ display: 'inline-block' }}>
              {editingLeftHeadings[index] ? (
                <WysiwygEditor
                  initialValue={leftHeadings[index]}
                  onSave={(value) => handleLeftHeadingSave(index, value)}
                  onCancel={() => {
                    const newEditingStates = [...editingLeftHeadings];
                    newEditingStates[index] = false;
                    setEditingLeftHeadings(newEditingStates);
                  }}
                  placeholder="Enter heading"
                  className="inline-editor-left-heading"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    marginBottom: '4px',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block',
                    lineHeight: '1.2'
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    marginBottom: '4px',
                    cursor: isEditable ? 'pointer' : 'default'
                  }}
                  onClick={(e) => {
                    const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                    if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    if (isEditable) {
                      const newEditingStates = [...editingLeftHeadings];
                      newEditingStates[index] = true;
                      setEditingLeftHeadings(newEditingStates);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                  dangerouslySetInnerHTML={{ __html: heading }}
                />
              )}
            </div>

            {/* Description */}
            <div data-draggable="true" style={{ display: 'inline-block', marginTop: '4px' }}>
              {editingLeftDescriptions[index] ? (
                <WysiwygEditor
                  initialValue={leftDescriptions[index]}
                  onSave={(value) => handleLeftDescriptionSave(index, value)}
                  onCancel={() => {
                    const newEditingStates = [...editingLeftDescriptions];
                    newEditingStates[index] = false;
                    setEditingLeftDescriptions(newEditingStates);
                  }}
                  placeholder="Enter description"
                  className="inline-editor-left-description"
                  style={{
                    fontSize: '0.8rem',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    lineHeight: '1.3',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block'
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    lineHeight: '1.3',
                    cursor: isEditable ? 'pointer' : 'default'
                  }}
                  onClick={(e) => {
                    const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                    if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    if (isEditable) {
                      const newEditingStates = [...editingLeftDescriptions];
                      newEditingStates[index] = true;
                      setEditingLeftDescriptions(newEditingStates);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                  dangerouslySetInnerHTML={{ __html: leftDescriptions[index] }}
                />
              )}
            </div>
          </div>
        ))}


        {/* Right Side Text Blocks */}
        {rightHeadings.map((heading: string, index: number) => (
          <div 
            key={`right-${index}`} 
            style={{
              position: 'absolute',
              right: rightItemsPositions[index].right,
              top: rightItemsPositions[index].top,
              zIndex: 10,
              maxWidth: '200px',
              textAlign: 'right'
            }}
          >
            {/* Heading */}
            <div data-draggable="true" style={{ display: 'inline-block' }}>
              {editingRightHeadings[index] ? (
                <WysiwygEditor
                  initialValue={rightHeadings[index]}
                  onSave={(value) => handleRightHeadingSave(index, value)}
                  onCancel={() => {
                    const newEditingStates = [...editingRightHeadings];
                    newEditingStates[index] = false;
                    setEditingRightHeadings(newEditingStates);
                  }}
                  placeholder="Enter heading"
                  className="inline-editor-right-heading"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    marginBottom: '4px',
                    textAlign: 'right',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block',
                    lineHeight: '1.2'
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    marginBottom: '4px',
                    cursor: isEditable ? 'pointer' : 'default',
                    textAlign: 'right'
                  }}
                  onClick={(e) => {
                    const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                    if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    if (isEditable) {
                      const newEditingStates = [...editingRightHeadings];
                      newEditingStates[index] = true;
                      setEditingRightHeadings(newEditingStates);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                  dangerouslySetInnerHTML={{ __html: heading }}
                />
              )}
            </div>

            {/* Description */}
            <div data-draggable="true" style={{ display: 'inline-block', marginTop: '4px' }}>
              {editingRightDescriptions[index] ? (
                <WysiwygEditor
                  initialValue={rightDescriptions[index]}
                  onSave={(value) => handleRightDescriptionSave(index, value)}
                  onCancel={() => {
                    const newEditingStates = [...editingRightDescriptions];
                    newEditingStates[index] = false;
                    setEditingRightDescriptions(newEditingStates);
                  }}
                  placeholder="Enter description"
                  className="inline-editor-right-description"
                  style={{
                    fontSize: '0.8rem',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    lineHeight: '1.3',
                    textAlign: 'right',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block'
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    lineHeight: '1.3',
                    cursor: isEditable ? 'pointer' : 'default',
                    textAlign: 'right'
                  }}
                  onClick={(e) => {
                    const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                    if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    if (isEditable) {
                      const newEditingStates = [...editingRightDescriptions];
                      newEditingStates[index] = true;
                      setEditingRightDescriptions(newEditingStates);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                  dangerouslySetInnerHTML={{ __html: rightDescriptions[index] }}
                />
              )}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default ContraindicationsIndicationsTemplate; 