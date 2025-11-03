"use client";

import React, { useRef, useEffect } from 'react';

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

  // First row: Filled basic shapes
  const row1Shapes: Shape[] = [
    {
      id: 'filled-square',
      name: 'Square',
      icon: (
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="46" height="46" fill="#4D4D4D"/>
        </svg>
      )
    },
    {
      id: 'filled-circle',
      name: 'Circle',
      icon: (
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="46" height="46" rx="23" fill="#4D4D4D"/>
        </svg>
      )
    },
    {
      id: 'filled-triangle',
      name: 'Triangle',
      icon: (
        <svg width="53" height="47" viewBox="0 0 53 47" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M26.9963 0.00102452L52.8249 46.0854L0.000349006 45.4115L26.9963 0.00102452Z" fill="#4D4D4D"/>
        </svg>
      )
    },
    {
      id: 'filled-star',
      name: 'Star',
      icon: (
        <svg width="48" height="46" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 0L29.6656 17.5704H48L33.1672 28.4296L38.8328 46L24 35.1409L9.16718 46L14.8328 28.4296L0 17.5704H18.3344L24 0Z" fill="#4D4D4D"/>
        </svg>
      )
    }
  ];

  // Second row: Outlined basic shapes
  const row2Shapes: Shape[] = [
    {
      id: 'outlined-square',
      name: 'Square Outline',
      icon: (
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="46" height="46" stroke="#4D4D4D" strokeWidth="4"/>
        </svg>
      )
    },
    {
      id: 'outlined-circle',
      name: 'Circle Outline',
      icon: (
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="46" height="46" rx="23" stroke="#4D4D4D" strokeWidth="4"/>
        </svg>
      )
    },
    {
      id: 'outlined-triangle',
      name: 'Triangle Outline',
      icon: (
        <svg width="60" height="53" viewBox="0 0 60 53" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30.4855 4.00102L56.3142 50.0854L3.48961 49.4115L30.4855 4.00102Z" stroke="#4D4D4D" strokeWidth="4"/>
        </svg>
      )
    },
    {
      id: 'outlined-star',
      name: 'Star Outline',
      icon: (
        <svg width="61" height="58" viewBox="0 0 61 58" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30.1172 6.51562L35.7828 24.0861H54.1172L39.2844 34.9452L44.95 52.5156L30.1172 41.6565L15.2844 52.5156L20.95 34.9452L6.11719 24.0861H24.4516L30.1172 6.51562Z" stroke="#4D4D4D" strokeWidth="4"/>
        </svg>
      )
    }
  ];

  // Third row: Additional filled shapes
  const row3Shapes: Shape[] = [
    {
      id: 'diamond',
      name: 'Diamond',
      icon: (
        <svg width="66" height="66" viewBox="0 0 66 66" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="32.5273" width="46" height="46" transform="rotate(45 32.5273 0)" fill="#4D4D4D"/>
        </svg>
      )
    },
    {
      id: 'quarter-circle',
      name: 'Quarter Circle',
      icon: (
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M23 23H46C46 35.7025 35.7025 46 23 46C10.2975 46 0 35.7025 0 23C0 10.2975 10.2975 0 23 0V23Z" fill="#4D4D4D"/>
        </svg>
      )
    },
    {
      id: 'wave',
      name: 'Wave',
      icon: (
        <svg width="46" height="45" viewBox="0 0 46 45" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 44.061V0.0610128C29.2 -1.53899 42.8333 28.7277 46 44.061H0Z" fill="#4D4D4D"/>
        </svg>
      )
    },
    {
      id: 'hexagon',
      name: 'Hexagon',
      icon: (
        <svg width="48" height="55" viewBox="0 0 48 55" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M23.8154 0L47.6311 13.75V41.25L23.8154 55L-0.000268936 41.25V13.75L23.8154 0Z" fill="#4D4D4D"/>
        </svg>
      )
    }
  ];

  // Fourth row: More complex shapes
  const row4Shapes: Shape[] = [
    {
      id: 'pac-man',
      name: 'Pac-man',
      icon: (
        <svg width="46" height="44" viewBox="0 0 46 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M23 19.6299H45.9951C45.9972 19.7585 46 19.8874 46 20.0166C46 32.7192 35.7025 43.0166 23 43.0166C10.2975 43.0166 0 32.7192 0 20.0166C0 11.4356 4.69964 3.95285 11.665 0L23 19.6299Z" fill="#4D4D4D"/>
        </svg>
      )
    },
    {
      id: 'pentagon',
      name: 'Pentagon',
      icon: (
        <svg width="53" height="50" viewBox="0 0 53 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M26.1543 0L52.3083 19.002L42.3184 49.748H9.9902L0.000242233 19.002L26.1543 0Z" fill="#4D4D4D"/>
        </svg>
      )
    },
    {
      id: 'half-circle',
      name: 'Half Circle',
      icon: (
        <svg width="46" height="23" viewBox="0 0 46 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M46 0C46 12.7025 35.7025 23 23 23C10.2975 23 0 12.7025 0 0H46Z" fill="#4D4D4D"/>
        </svg>
      )
    },
    {
      id: 'arch',
      name: 'Arch',
      icon: (
        <svg width="50" height="27" viewBox="0 0 50 27" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 25L0 25L-1.74846e-07 27L2 27L2 25ZM48 25L48 27L50 27L50 25L48 25ZM2 25L4 25C4 13.402 13.402 4 25 4L25 2L25 -2.01072e-06C11.1929 -3.21778e-06 1.20706e-06 11.1929 0 25L2 25ZM25 2L25 4C36.598 4 46 13.402 46 25L48 25L50 25C50 11.1929 38.8071 -8.03667e-07 25 -2.01072e-06L25 2ZM48 25L48 23L2 23L2 25L2 27L48 27L48 25Z" fill="#4D4D4D"/>
        </svg>
      )
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
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '380px',
        height: '380px',
      }}
    >
      {/* First Row - Filled Basic Shapes */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {row1Shapes.map((shape) => (
          <div
            key={shape.id}
            onClick={() => handleShapeClick(shape.id)}
            className="flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#E0E0E0] rounded-lg w-[70px] h-[70px]"
          >
            {shape.icon}
          </div>
        ))}
      </div>

      {/* Second Row - Outlined Basic Shapes */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {row2Shapes.map((shape) => (
          <div
            key={shape.id}
            onClick={() => handleShapeClick(shape.id)}
            className="flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#E0E0E0] rounded-lg w-[70px] h-[70px]"
          >
            {shape.icon}
          </div>
        ))}
      </div>

      {/* Third Row - Additional Filled Shapes */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {row3Shapes.map((shape) => (
          <div
            key={shape.id}
            onClick={() => handleShapeClick(shape.id)}
            className="flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#E0E0E0] rounded-lg w-[70px] h-[70px]"
          >
            {shape.icon}
          </div>
        ))}
      </div>

      {/* Fourth Row - Complex Shapes */}
      <div className="grid grid-cols-4 gap-2">
        {row4Shapes.map((shape) => (
          <div
            key={shape.id}
            onClick={() => handleShapeClick(shape.id)}
            className="flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#E0E0E0] rounded-lg w-[70px] h-[70px]"
          >
            {shape.icon}
          </div>
        ))}
      </div>
    </div>
  );
}
