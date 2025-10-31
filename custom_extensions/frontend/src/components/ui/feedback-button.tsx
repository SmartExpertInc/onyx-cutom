import React from "react";

interface FeedbackButtonProps {
  onClick?: () => void;
  backgroundColor?: string;
  textColor?: string;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({ 
  onClick, 
  backgroundColor = '#ffffff',
  textColor = '#0F58F9'
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior
      console.log('Feedback clicked');
    }
  };

  return (
    <button
      className="fixed right-0 top-1/2 -translate-y-1/2 flex items-center justify-center border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-l-lg cursor-pointer group z-40"
      style={{
        width: '38px',
        height: '98px',
        backgroundColor: backgroundColor,
      }}
      onClick={handleClick}
    >
      <span
        className="font-medium opacity-50 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
        style={{
          fontSize: '14px',
          color: textColor,
          transform: 'rotate(-90deg)',
          whiteSpace: 'nowrap',
        }}
      >
        Feedback
      </span>
    </button>
  );
};