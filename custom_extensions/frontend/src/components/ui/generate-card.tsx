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
          "group relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer",
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
              <div className="flex items-center justify-center" style={{ color: '#FFFFFF' }}>
                <Icon 
                  size={48}
                  strokeWidth={4}
                  className={cn(
                    "text-white",
                    "w-12 h-12 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-16 lg:h-16 xl:w-16 xl:h-16"
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
