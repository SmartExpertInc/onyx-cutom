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
          "group relative rounded-md overflow-hidden transition-all duration-200 cursor-pointer",
          "w-18 h-25 xs:w-18 xs:h-23 sm:w-20 sm:h-28 md:w-20 md:h-30 lg:w-22 lg:h-35 xl:w-30 xl:h-38",
          "hover:scale-105",
          className
        )}
        style={{
          backgroundColor: active ? 'white' : '#f3f4f6',
          background: active 
            ? `white`
            : `#f3f4f6`,
          boxShadow: active 
            ? '0 10px 15px -5px rgba(0, 0, 0, 0.1), 0 6px 6px -5px rgba(0, 0, 0, 0.04)' 
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
        <CardContent className="flex flex-col items-center justify-center gap-3 h-full p-4">
            {Icon && (
              <div 
                className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 xl:w-22 xl:h-22 flex items-center justify-center"
                style={{
                  backgroundColor: active ? '#0646D3' : '#ADE9FF',
                  borderRadius: '50%',
                  aspectRatio: '1/1'
                }}
              >
                <Icon 
                  size={24}
                  className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11"
                  style={{
                    color: active ? 'white' : '#374151',
                    fill: active ? 'white' : '#374151',
                    stroke: active ? 'white' : '#374151',
                  }}
                />
              </div>
            )}
            <span 
              className="text-xs xs:text-sm sm:text-sm leading-tight text-center px-1 font-medium"
              style={{
                color: active ? '#6B6B6D' : '#7C8082'
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
