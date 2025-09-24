import React from "react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface GenerateCardProps extends React.HTMLAttributes<HTMLDivElement> {
  Icon?: React.ElementType;
  label: string;
  gradientTo?: string;
  active?: boolean;
  onClick?: () => void;
}

const GenerateCard = React.forwardRef<HTMLDivElement, GenerateCardProps>(
  ({ className, Icon, label, active: _active = false, gradientTo: _gradientTo, onClick, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "group relative rounded-md overflow-hidden transition-all duration-200 cursor-pointer",
          "w-24 h-24 xs:w-22 xs:h-22 sm:w-27 sm:h-27 md:w-29 md:h-29 lg:w-31 lg:h-31 xl:w-34 xl:h-34",
          // Dark gradient card with prominent border and hover shadow
          "bg-gradient-to-br from-blue-700 to-purple-800 hover:from-blue-600 hover:to-purple-700",
          "border-0",
          "shadow-none hover:shadow-2xl hover:scale-105",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <CardContent className="flex flex-col items-center justify-center gap-3 h-full p-4">
            {Icon && (
              <div 
                className="w-16 h-16 xs:w-14 xs:h-14 sm:w-15 sm:h-15 md:w-17 md:h-17 lg:w-18 lg:h-18 xl:w-19 xl:h-19 flex items-center justify-center rounded-full border-2 border-white"
                style={{
                  backgroundColor: 'transparent',
                  aspectRatio: '1/1',
                  color: '#FFFFFF'
                } as React.CSSProperties}
              >
                <Icon 
                  size={28}
                  strokeWidth={2}
                  className={cn(
                    "text-white",
                    "w-7 h-7 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-10 xl:h-10"
                  )}
                  style={{
                    color: '#FFFFFF',
                    fill: '#FFFFFF',
                    stroke: '#FFFFFF'
                  }}
                />
              </div>
            )}
            <span 
              className="text-xs xs:text-sm sm:text-sm leading-tight text-center px-1 font-medium text-white"
              style={{
                color: '#FFFFFF'
              }}
            >
              {label}
            </span>
          </CardContent>
      </Card>
    );
  }
);

GenerateCard.displayName = "GenerateCard";

export { GenerateCard };
