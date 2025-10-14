import React from "react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ModeSelectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  Icon?: React.ElementType;
  title?: string;
  description?: string;
  iconColor?: string;
  labelColor?: string;
  disabled?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

const ModeSelectionCard = React.forwardRef<HTMLDivElement, ModeSelectionCardProps>(
  ({ 
    className, 
    Icon, 
    title, 
    description, 
    iconColor = "text-blue-600",
    labelColor = "text-blue-600",
    disabled = false,
    isSelected = false,
    onSelect,
    children,
    ...props 
  }, ref) => {
    const cardContent = (
      <Card
        ref={ref}
        className={cn(
          "group rounded-lg relative overflow-hidden transition-all duration-200 w-full h-full min-w-[380px]",
          isSelected
            ? "bg-[#F2F8FF]/70 border-[#0F58F9]"
            : "bg-[#FDFDFD]/70 border-[#E0E0E0]",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:[transform:scale(1.025)] active:[transform:scale(1.025)] hover:bg-[#F2F8FF]/80 hover:border-[#0F58F9] active:bg-[#F2F8FF]/80 active:border-[#0F58F9]",
          className
        )}
        style={isSelected ? { borderWidth: '2px' } : { borderWidth: '1px' }}
        onMouseEnter={(e) => (e.currentTarget.style.borderWidth = '2px')}
        onMouseLeave={(e) => !isSelected && (e.currentTarget.style.borderWidth = '1px')}
        {...props}
      >
        {/* Selection Indicator */}
        <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 z-10 ${
          isSelected
            ? 'bg-blue-600 border-blue-600'
            : 'border-gray-300 group-hover:border-blue-400'
        }`}>
          {isSelected && (
            <Check size={10} className="text-white" />
          )}
        </div>
        
        <CardContent className="relative p-4 h-full flex flex-row gap-4">
          {/* Icon section */}
          {Icon && (
            <div className="flex items-start justify-center flex-shrink-0">
              <Icon 
                size={28} 
                className={cn(iconColor)} 
              />
            </div>
          )}
          
          {/* Text section */}
          {(title || description) && (
            <div className="flex flex-col items-start gap-3 justify-start flex-1">
              {title && (
                <h3 
                  className={cn(
                    "text-lg font-semibold text-left leading-tight tracking-[0.01em] transition-all duration-200",
                    "opacity-80 group-hover:opacity-100 group-active:opacity-100"
                  )}
                  style={{ color: '#0D001B' }}
                >
                  {title}
                </h3>
              )}
              {description && (
                <p 
                  className="text-left leading-[150%]"
                  style={{ color: '#71717A', fontSize: '12px' }}
                >
                  {description}
                </p>
              )}
            </div>
          )}
          
          {/* Custom content */}
          {children}
        </CardContent>
      </Card>
    );

    return (
      <div onClick={disabled ? undefined : onSelect}>
        {cardContent}
      </div>
    );
  }
);

ModeSelectionCard.displayName = "ModeSelectionCard";

export { ModeSelectionCard };

