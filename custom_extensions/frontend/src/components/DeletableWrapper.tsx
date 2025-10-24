import React, { useState } from 'react';
import { useDragContext } from './ServiceList';

interface DeletableWrapperProps {
  children: React.ReactNode;
  onDelete?: () => void;
  className?: string;
  deleteButtonClassName?: string;
  confirmDelete?: boolean;
  deleteConfirmText?: string;
  disabled?: boolean;
  showOnHover?: boolean;
  deleteButtonPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  deleteButtonSize?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties; // Added style support
}

const DeletableWrapper: React.FC<DeletableWrapperProps> = ({
  children,
  onDelete,
  className = '',
  deleteButtonClassName = '',
  confirmDelete = true,
  deleteConfirmText = 'Are you sure you want to delete this item?',
  disabled = false,
  showOnHover = true,
  deleteButtonPosition = 'top-right',
  deleteButtonSize = 'md',
  style = {} // Added style prop support
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isDragging } = useDragContext();

  const handleDelete = async () => {
    if (disabled || isDeleting) return;
    
    if (confirmDelete) {
      if (window.confirm(deleteConfirmText)) {
        setIsDeleting(true);
        try {
          await onDelete?.();
        } finally {
          setIsDeleting(false);
        }
      }
    } else {
      setIsDeleting(true);
      try {
        await onDelete?.();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleMouseEnter = () => {
    if (!disabled && showOnHover) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const getPositionClasses = () => {
    switch (deleteButtonPosition) {
      case 'top-left':
        return '-top-2 -left-2';
      case 'bottom-right':
        return '-bottom-2 -right-2';
      case 'bottom-left':
        return '-bottom-2 -left-2';
      case 'top-right':
      default:
        return '-top-2 -right-2';
    }
  };

  const getSizeClasses = () => {
    switch (deleteButtonSize) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'md':
      default:
        return 'w-6 h-6';
    }
  };

  const getIconSize = () => {
    switch (deleteButtonSize) {
      case 'sm':
        return '8';
      case 'lg':
        return '16';
      case 'md':
      default:
        return '12';
    }
  };

  return (
    <div
      className={`relative group ${className} ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Delete Button */}
      {isHovered && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={isDeleting}
          className={`absolute ${getPositionClasses()} z-20 ${getSizeClasses()} bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 disabled:scale-100 ${deleteButtonClassName}`}
          title={isDeleting ? "Deleting..." : "Delete this item"}
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-2/3 w-2/3 border-2 border-white border-t-transparent"></div>
          ) : (
            <svg
              width={getIconSize()}
              height={getIconSize()}
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
          )}
        </button>
      )}
    </div>
  );
};

export default DeletableWrapper;
