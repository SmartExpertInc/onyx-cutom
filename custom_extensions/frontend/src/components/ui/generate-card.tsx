import React from "react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface GenerateCardProps extends React.HTMLAttributes<HTMLDivElement> {
  Icon?: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  gradientFrom?: string;
  gradientTo?: string;
  iconColor?: string;
  labelColor?: string;
}

const GenerateCard = React.forwardRef<HTMLDivElement, GenerateCardProps>(
  ({ 
    className, 
    Icon, 
    label, 
    active = false, 
    onClick,
    gradientFrom = "from-blue-300",
    gradientTo = "to-purple-200",
    iconColor = "text-blue-600",
    labelColor = "text-blue-600",
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "group rounded-3xl relative overflow-hidden transition-all duration-300 cursor-pointer w-40 h-28",
          "bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:scale-105",
          active 
            ? "border-2 border-blue-500 shadow-lg ring-2 ring-blue-200" 
            : "border border-gray-200 hover:border-gray-300 hover:shadow-md",
          className
        )}
        onClick={onClick}
        {...props}
      >
        {/* Gradient at top right corner */}
        <div 
          className={cn(
            "absolute top-0 right-0 w-44 rotate-45 blur-2xl h-34 bg-gradient-to-br rounded-bl-3xl opacity-60",
            gradientFrom,
            gradientTo
          )}
        />
        
        <CardContent className="relative p-4 h-full flex flex-col items-center justify-center">
          {/* Icon section */}
          {Icon && (
            <div className="flex items-start justify-start h-12 relative mb-2">
              <Icon 
                size={40} 
                className={iconColor}
              />
            </div>
          )}
          
          {/* Text section */}
          <div className="flex flex-col items-center gap-1 flex-1 justify-center">
            <h3 className={cn(
              "text-sm font-semibold text-center leading-tight",
              labelColor
            )}>
              {label}
            </h3>
          </div>
        </CardContent>
      </Card>
    );
  }
);

GenerateCard.displayName = "GenerateCard";

export { GenerateCard };
