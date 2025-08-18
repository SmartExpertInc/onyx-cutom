"use client";

import { useState, useRef } from 'react';
import { 
  FileText, 
  User, 
  Image, 
  Shapes, 
  Type, 
  Music, 
  ArrowRightLeft, 
  MousePointer, 
  MessageCircle, 
  Settings,
  ChevronDown
} from 'lucide-react';

interface ToolbarProps {
  onActiveToolChange?: (toolId: string) => void;
  onTextButtonClick?: (position: { x: number; y: number }) => void;
}

export default function Toolbar({ onActiveToolChange, onTextButtonClick }: ToolbarProps) {
  const [activeToolId, setActiveToolId] = useState<string>('script');
  const textButtonRef = useRef<HTMLDivElement>(null);

  const tools = [
    {
      id: 'script',
      label: 'Script',
      icon: FileText
    },
    {
      id: 'avatar',
      label: 'Avatar',
      icon: User
    },
    {
      id: 'background',
      label: 'Background',
      icon: Image
    },
    {
      id: 'shapes',
      label: 'Shapes',
      icon: Shapes
    },
    {
      id: 'media',
      label: 'Media',
      icon: Image
    },
    {
      id: 'text',
      label: 'Text',
      icon: Type
    },
    {
      id: 'music',
      label: 'Music',
      icon: Music
    },
    {
      id: 'transition',
      label: 'Transition',
      icon: ArrowRightLeft
    },
    {
      id: 'interaction',
      label: 'Interaction',
      icon: MousePointer
    },
    {
      id: 'comments',
      label: 'Comments',
      icon: MessageCircle
    },
    {
      id: 'default',
      label: 'Default',
      icon: Settings,
      chevron: ChevronDown
    }
  ];

  const handleToolClick = (toolId: string, event?: React.MouseEvent<HTMLDivElement>) => {
    if (toolId === 'text' && onTextButtonClick && textButtonRef.current) {
      const rect = textButtonRef.current.getBoundingClientRect();
      const position = {
        x: rect.left,
        y: rect.bottom + 5 // Position popup 5px below the button
      };
      onTextButtonClick(position);
      return;
    }
    
    setActiveToolId(toolId);
    onActiveToolChange?.(toolId);
  };

  return (
    <div className="w-full bg-white px-6 py-3" style={{ height: '72px' }}>
      {/* Toolbar container */}
      <div className="flex items-start justify-between max-w-full h-full">
            {/* Left side - all tools except Default */}
            <div className="flex items-start gap-2">
              {tools.filter(tool => tool.id !== 'default').map((tool) => {

                return (
                  <div
                    key={tool.id}
                    ref={tool.id === 'text' ? textButtonRef : undefined}
                    onClick={(event) => handleToolClick(tool.id, event)}
                    className={`flex flex-col items-center cursor-pointer transition-all duration-200 hover:bg-gray-50 p-2 ${
                      activeToolId === tool.id ? 'bg-gray-200 rounded-lg' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center mb-3 w-4 h-4">
                      <tool.icon
                        size={16}
                        className="text-gray-700"
                      />
                    </div>

                    {/* Label with exact font styling */}
                    <span
                        className="font-normal whitespace-nowrap"
                        style={{
                          color: '#000000',
                          fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                          fontSize: '10px',

                          lineHeight: 'normal'
                        }}
                    >
                      {tool.label}
                    </span>

                  </div>
                );
              })}
            </div>
            
            {/* Right side - Default button */}
            <div className="flex items-start">
              {tools.filter(tool => tool.id === 'default').map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 hover:bg-gray-50 p-2 ${
                    activeToolId === tool.id ? 'bg-gray-200 rounded-lg' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className="flex items-center justify-center mb-3 w-4 h-4">
                    <tool.icon
                      size={16}
                      className="text-gray-700"
                    />
                  </div>

                  {/* Label */}
                  <span
                    className="font-normal whitespace-nowrap text-center"
                    style={{
                      color: '#000000',
                      fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '10px',
                      lineHeight: 'normal'
                    }}
                  >
                    {tool.label}
                  </span>

                  {/* Chevron */}
                  {tool.chevron && (
                    <div className="flex items-center justify-center mt-0.5">
                      <tool.chevron
                        size={12}
                        className="text-gray-600"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
      </div>
    </div>
  );
}
