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
          "group relative rounded-md border-[var(--border)] bg-[var(--card)] overflow-hidden transition-all duration-200 cursor-pointer",
          "w-28 h-20 xs:w-24 xs:h-18 sm:w-32 sm:h-23 md:w-36 md:h-25 lg:w-40 lg:h-27 xl:w-44 xl:h-30",
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
                    size={35}
                    className={cn(
                      "w-14 h-14 xs:w-14 xs:h-14 sm:w-15 sm:h-15 md:w-16 md:h-16 lg:w-17 lg:h-17 xl:w-18 xl:h-18",
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
              className={cn(
                "text-xs xs:text-sm sm:text-sm leading-tight text-center px-1 font-medium",
                active ? "text-[var(--ring)]" : "text-[var(--secondary-foreground)]"
              )}
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
