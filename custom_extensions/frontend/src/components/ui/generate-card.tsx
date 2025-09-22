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
          "w-25 h-25 xs:w-23 xs:h-23 sm:w-28 sm:h-28 md:w-30 md:h-30 lg:w-32 lg:h-32 xl:w-35 xl:h-35",
          "hover:scale-105",
          className
        )}
        style={{
          backgroundColor: active ? 'white' : '#F2F9FC',
          background: active 
            ? `white`
            : `#F2F9FC`,
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
                className="w-15 h-15 xs:w-12 xs:h-12 sm:w-13 sm:h-13 md:w-15 md:h-15 lg:w-16 lg:h-16 xl:w-17 xl:h-17 flex items-center justify-center"
                style={{
                  backgroundColor: active ? '#0646D3' : '#ADE9FF',
                  borderRadius: '50%',
                  aspectRatio: '1/1',
                  '--icon-color': active ? 'white' : 'black',
                  color: active ? 'white' : 'black'
                } as React.CSSProperties}
              >
                <Icon 
                  size={20}
                  className={cn(
                    "w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7",
                    active ? "text-white" : "text-black"
                  )}
                  style={{
                    color: active ? 'white' : 'black',
                    fill: active ? 'white' : 'black',
                    stroke: active ? 'white' : 'black',
                    '--tw-text-opacity': '1',
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
