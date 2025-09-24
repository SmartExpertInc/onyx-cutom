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
      <div 
        className="w-24 h-24 xs:w-22 xs:h-22 sm:w-27 sm:h-27 md:w-29 md:h-29 lg:w-31 lg:h-31 xl:w-34 xl:h-34 rounded-lg p-3 hover:scale-105 transition-all duration-200"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(255, 255, 255, 0.3), 0 4px 6px -2px rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Card
          ref={ref}
          className={cn(
            "group relative rounded-md overflow-hidden transition-all duration-200 cursor-pointer border-0",
            "w-full h-full",
            className
          )}
          style={{
            backgroundColor: active ? 'white' : '#F2F9FC',
            background: active 
              ? `white`
              : `#F2F9FC`,
            boxShadow: 'none',
            border: 'none'
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
      </div>
    );
  }
);

GenerateCard.displayName = "GenerateCard";

export { GenerateCard };
