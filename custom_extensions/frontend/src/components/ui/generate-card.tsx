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
          "group relative rounded-md border-[var(--border)] overflow-hidden transition-all duration-200 cursor-pointer",
          "w-24 h-24 xs:w-22 xs:h-22 sm:w-27 sm:h-27 md:w-29 md:h-29 lg:w-31 lg:h-31 xl:w-34 xl:h-34",
          "hover:scale-105",
          active && "border-[var(--ring)]",
          className
        )}
        style={{
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
                className="flex items-center justify-center"
              >
                <Icon 
                  size={20}
                  className={cn(
                    "w-10 h-10 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-12 xl:h-12",
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
              className="text-xs xs:text-sm sm:text-sm leading-tight text-center px-1 font-medium text-[var(--secondary-foreground)]"
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
