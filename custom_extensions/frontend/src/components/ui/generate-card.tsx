import React from "react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface GenerateCardProps extends React.HTMLAttributes<HTMLDivElement> {
  Icon?: React.ElementType;
  label: string;
  gradientTo?: string;
  active?: boolean;
  onClick?: () => void;
  glowColor?: string; // base color to derive the glow from
}

const GenerateCard = React.forwardRef<HTMLDivElement, GenerateCardProps>(
  ({ className, Icon, label, active = false, gradientTo: _gradientTo, onClick, glowColor, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        tabIndex={0}
        className={cn(
          "group relative rounded-md bg-[var(--card)] overflow-hidden transition-all duration-200 cursor-pointer",
          "w-24 h-20 xs:w-20 xs:h-18 sm:w-28 sm:h-23 md:w-32 md:h-25 lg:w-36 lg:h-24 xl:w-40 xl:h-26",
          "hover:scale-105 focus:outline-none focus:border-[var(--ring)]",
          active ? "border-4 border-[var(--primary)]" : "border-2 border-transparent",
          className
        )}
        style={{
          boxShadow: active 
            ? '0 10px 15px -5px rgba(0, 0, 0, 0.1), 0 6px 6px -5px rgba(0, 0, 0, 0.04)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          ...(active ? { borderColor: 'color-mix(in srgb, var(--primary) 50%, transparent)' } : {})
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
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        {...props}
      >
        <CardContent className="flex flex-col items-center justify-center gap-2 h-full p-4">
            {Icon && (
              <div 
                className="flex items-center justify-center"
              >
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-lg blur-sm"
                    style={{
                      background: active
                        ? `linear-gradient(to bottom right, ${glowColor ? `color-mix(in srgb, ${glowColor} 18%, transparent)` : `color-mix(in srgb, var(--primary) 18%, transparent)`}, ${glowColor ? `color-mix(in srgb, ${glowColor} 10%, transparent)` : `color-mix(in srgb, var(--primary) 10%, transparent)`})`
                        : `linear-gradient(to bottom right, ${glowColor ? `color-mix(in srgb, ${glowColor} 12%, transparent)` : 'color-mix(in srgb, #6b7280 12%, transparent)'}, ${glowColor ? `color-mix(in srgb, ${glowColor} 6%, transparent)` : 'color-mix(in srgb, #6b7280 6%, transparent)'})`
                    }}
                  />
                  <Icon 
                    size={35}
                    className={cn(
                      "relative z-10 w-14 h-14 xs:w-14 xs:h-14 sm:w-15 sm:h-15 md:w-16 md:h-16 lg:w-17 lg:h-17 xl:w-18 xl:h-18",
                      active ? "text-white" : "text-gray-500"
                    )}
                    style={{
                      color: active ? 'white' : '#6b7280',
                      fill: active ? 'white' : '#6b7280',
                      stroke: active ? 'white' : '#6b7280',
                      '--tw-text-opacity': '1',
                    }}
                  />
                </div>
              </div>
            )}
            <span 
              className={cn(
                "text-xs xs:text-sm sm:text-sm lg:text-base xl:text-base leading-tight text-center px-1 font-semibold text-gray-900",
                active ? "text-[var(--generate-card-icon-active)]" : "text-gray-900"
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
