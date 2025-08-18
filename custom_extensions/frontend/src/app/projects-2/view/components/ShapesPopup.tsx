"use client";

import React from 'react';
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
  if (!isOpen) return null;

  // First row: Black filled shapes
  const blackShapes: Shape[] = [
    {
      id: 'black-square',
      name: 'Square',
      icon: <Square size={40} fill="black" stroke="black" />
    },
    {
      id: 'black-circle',
      name: 'Circle',
      icon: <Circle size={40} fill="black" stroke="black" />
    },
    {
      id: 'black-triangle',
      name: 'Triangle',
      icon: <Triangle size={40} fill="black" stroke="black" />
    },
    {
      id: 'black-star',
      name: 'Star',
      icon: <Star size={40} fill="black" stroke="black" />
    }
  ];

  // Second row: White shapes with black border
  const whiteShapes: Shape[] = [
    {
      id: 'white-square',
      name: 'Square',
      icon: <Square size={40} fill="white" stroke="black" strokeWidth={2} />
    },
    {
      id: 'white-circle',
      name: 'Circle',
      icon: <Circle size={40} fill="white" stroke="black" strokeWidth={2} />
    },
    {
      id: 'white-triangle',
      name: 'Triangle',
      icon: <Triangle size={40} fill="white" stroke="black" strokeWidth={2} />
    },
    {
      id: 'white-star',
      name: 'Star',
      icon: <Star size={40} fill="white" stroke="black" strokeWidth={2} />
    }
  ];

  const handleShapeClick = (shapeId: string) => {
    console.log(`Selected shape: ${shapeId}`);
    // Here you would typically add the shape to the canvas or perform some action
    onClose();
  };

  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl p-6 z-50 w-[360px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Shapes</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={18} className="text-gray-600" />
        </button>
      </div>

      {/* First Row - Black Shapes */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {blackShapes.map((shape) => (
          <div
            key={shape.id}
            onClick={() => handleShapeClick(shape.id)}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all duration-200 group"
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
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all duration-200 group"
          >
            <div className="group-hover:scale-110 transition-transform duration-200">
              {shape.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Click on a shape to add it to your project
        </p>
      </div>
    </div>
  );
}
