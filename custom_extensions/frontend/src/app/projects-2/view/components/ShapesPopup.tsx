"use client";

import React, { useRef, useEffect } from 'react';
import { X, Circle, Square, Triangle, Star, Heart, Diamond, Hexagon } from 'lucide-react';

interface ShapesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

interface Shape {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export default function ShapesPopup({ isOpen, onClose, position }: ShapesPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // First row: Black filled shapes
  const blackShapes: Shape[] = [
    {
      id: 'black-square',
      name: 'Square',
      icon: <Square size={96} fill="black" stroke="black" />
    },
    {
      id: 'black-circle',
      name: 'Circle',
      icon: <Circle size={96} fill="black" stroke="black" />
    },
    {
      id: 'black-triangle',
      name: 'Triangle',
      icon: <Triangle size={96} fill="black" stroke="black" />
    },
    {
      id: 'black-star',
      name: 'Star',
      icon: <Star size={96} fill="black" stroke="black" />
    }
  ];

  // Second row: White shapes with black border
  const whiteShapes: Shape[] = [
    {
      id: 'white-square',
      name: 'Square',
      icon: <Square size={96} fill="white" stroke="black" strokeWidth={2} />
    },
    {
      id: 'white-circle',
      name: 'Circle',
      icon: <Circle size={96} fill="white" stroke="black" strokeWidth={2} />
    },
    {
      id: 'white-triangle',
      name: 'Triangle',
      icon: <Triangle size={96} fill="white" stroke="black" strokeWidth={2} />
    },
    {
      id: 'white-star',
      name: 'Star',
      icon: <Star size={96} fill="white" stroke="black" strokeWidth={2} />
    }
  ];

  const handleShapeClick = (shapeId: string) => {
    console.log(`Selected shape: ${shapeId}`);
    // Here you would typically add the shape to the canvas or perform some action
    onClose();
  };

  return (
    <div
      ref={popupRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50 w-[640px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* First Row - Black Shapes */}
      <div className="grid grid-cols-4 gap-1 mb-1">
        {blackShapes.map((shape) => (
          <div
            key={shape.id}
            onClick={() => handleShapeClick(shape.id)}
            className="flex items-center justify-center px-12 py-3 cursor-pointer transition-all duration-200 hover:bg-gray-200 rounded-lg"
          >
            {shape.icon}
          </div>
        ))}
      </div>

      {/* Second Row - White Shapes with Black Border */}
      <div className="grid grid-cols-4 gap-1">
        {whiteShapes.map((shape) => (
          <div
            key={shape.id}
            onClick={() => handleShapeClick(shape.id)}
            className="flex items-center justify-center px-12 py-3 cursor-pointer transition-all duration-200 hover:bg-gray-200 rounded-lg"
          >
            {shape.icon}
          </div>
        ))}
      </div>
    </div>
  );
}
