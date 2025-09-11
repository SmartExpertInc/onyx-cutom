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
          "w-20 h-16 xs:w-22 xs:h-18 sm:w-28 sm:h-20 md:w-30 md:h-20 lg:w-35 lg:h-22 xl:w-38 xl:h-30",
          "hover:scale-105",
          className
        )}
        style={{
          backgroundColor: 'white',
          borderColor: active ? '#C5CAD1' : '#e2e8f0',
          background: `linear-gradient(to top right, white, white, ${gradientTo})`,
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
              <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-13 xl:h-13 flex items-center justify-center">
                <Icon 
                  size={42}
                  className="xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16"
                  style={{
                    color: active ? '#3b82f6' : '#4b5563',
                    fontWeight: 'bold',
                    strokeWidth: active ? 2.5 : 2
                  }}
                />
              </div>
            )}
            <span 
              className="text-[10px] xs:text-xs sm:text-sm leading-tight text-center px-1"
              style={{
                color: '#7A7A7A'
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
