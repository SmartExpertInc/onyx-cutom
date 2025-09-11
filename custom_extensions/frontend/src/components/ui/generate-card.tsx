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
  ({ className, Icon, label, active = false, gradientTo, onClick, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "group relative overflow-hidden transition-all duration-200 cursor-pointer",
          "w-32 h-24 sm:w-36 sm:h-26 md:w-40 md:h-28 lg:w-44 lg:h-32",
          "hover:scale-105",
          className
        )}
        style={{
          backgroundColor: 'white',
          borderColor: active ? '#C5CAD1' : '#e2e8f0',
          background: `linear-gradient(to top right, white, ${gradientTo})`,
          borderWidth: '1px',
          boxShadow: active 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }
        }}
        onClick={onClick}
        {...props}
      >
        <CardContent className="flex flex-col items-center justify-center gap-2 h-full p-4">
            {Icon && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-13 lg:h-13 flex items-center justify-center">
                <Icon 
                  size={48} 
                  style={{
                    color: active ? '#3b82f6' : '#4b5563',
                    fontWeight: 'bold',
                    strokeWidth: active ? 2.5 : 2
                  }}
                />
              </div>
            )}
            <span 
              className="text-xs sm:text-sm font-semibold leading-tight text-center px-1"
              style={{
                color: 'black'
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
