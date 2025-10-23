import React, { useState } from 'react';

interface DeletableDivProps {
  children: React.ReactNode;
  onDelete?: () => void;
  className?: string;
  deleteButtonClassName?: string;
  confirmDelete?: boolean;
  deleteConfirmText?: string;
  disabled?: boolean;
}

const DeletableDiv: React.FC<DeletableDivProps> = ({
  children,
  onDelete,
  className = '',
  deleteButtonClassName = '',
  confirmDelete = true,
  deleteConfirmText = 'Are you sure you want to delete this item?',
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    if (disabled) return;
    
    if (confirmDelete) {
      if (window.confirm(deleteConfirmText)) {
        onDelete?.();
      }
    } else {
      onDelete?.();
    }
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowConfirm(false);
  };

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Delete Button */}
      {isHovered && !disabled && (
        <button
          onClick={handleDelete}
          className={`absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 ${deleteButtonClassName}`}
          title="Delete this item"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default DeletableDiv;
