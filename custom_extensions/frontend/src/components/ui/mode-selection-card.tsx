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
          "bg-white border-2 border-[#E0E0E0] shadow-md",
          "hover:bg-[#F2F8FF] hover:border-[#0F58F9] hover:shadow-xl",
          "active:bg-[#F2F8FF] active:border-[#0F58F9] active:shadow-xl",
          isSelected
            ? "bg-[#F2F8FF] border-[#0F58F9] shadow-xl"
            : "",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:[transform:scale(1.025)] active:[transform:scale(1.025)]",
          className
        )}
        {...props}
      >
        {/* Selection Indicator */}
        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 z-10 ${
          isSelected
            ? 'bg-blue-600 border-blue-600'
            : 'border-gray-300 group-hover:border-blue-400'
        }`}>
          {isSelected && (
            <Check size={14} className="text-white" />
          )}
        </div>
        
        <CardContent className="relative p-6 h-full flex flex-row gap-4">
          {/* Icon section */}
          {Icon && (
            <div className="flex items-start justify-center flex-shrink-0">
              <Icon 
                size={53} 
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
                    "text-2xl font-semibold text-left leading-tight tracking-[0.01em] transition-all duration-200",
                    "opacity-80 group-hover:opacity-100 group-active:opacity-100 group-hover:!text-[#0F58F9] group-active:!text-[#0F58F9]"
                  )}
                  style={{ color: '#0D001B' }}
                >
                  {title}
                </h3>
              )}
              {description && (
                <p 
                  className="text-base text-left leading-[130%]"
                  style={{ color: '#71717A' }}
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

