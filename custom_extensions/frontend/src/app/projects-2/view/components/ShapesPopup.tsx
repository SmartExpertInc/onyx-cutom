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
      icon: <Square size={60} fill="black" stroke="black" />
    },
    {
      id: 'black-circle',
      name: 'Circle',
      icon: <Circle size={60} fill="black" stroke="black" />
    },
    {
      id: 'black-triangle',
      name: 'Triangle',
      icon: <Triangle size={60} fill="black" stroke="black" />
    },
    {
      id: 'black-star',
      name: 'Star',
      icon: <Star size={60} fill="black" stroke="black" />
    }
  ];

  // Second row: White shapes with black border
  const whiteShapes: Shape[] = [
    {
      id: 'white-square',
      name: 'Square',
      icon: <Square size={60} fill="white" stroke="black" strokeWidth={2} />
    },
    {
      id: 'white-circle',
      name: 'Circle',
      icon: <Circle size={60} fill="white" stroke="black" strokeWidth={2} />
    },
    {
      id: 'white-triangle',
      name: 'Triangle',
      icon: <Triangle size={60} fill="white" stroke="black" strokeWidth={2} />
    },
    {
      id: 'white-star',
      name: 'Star',
      icon: <Star size={60} fill="white" stroke="black" strokeWidth={2} />
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
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50 w-[420px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* First Row - Black Shapes */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {blackShapes.map((shape) => (
          <div
            key={shape.id}
            onClick={() => handleShapeClick(shape.id)}
            className="flex items-center justify-center p-6 cursor-pointer transition-all duration-200 group hover:bg-gray-50 rounded-lg"
          >
            <div className="group-hover:scale-110 transition-transform duration-200">
              {shape.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Second Row - White Shapes with Black Border */}
      <div className="grid grid-cols-4 gap-4">
        {whiteShapes.map((shape) => (
          <div
            key={shape.id}
            onClick={() => handleShapeClick(shape.id)}
            className="flex items-center justify-center p-6 cursor-pointer transition-all duration-200 group hover:bg-gray-50 rounded-lg"
          >
            <div className="group-hover:scale-110 transition-transform duration-200">
              {shape.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
