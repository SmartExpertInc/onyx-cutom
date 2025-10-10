import React from "react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface GenerateCardProps extends React.HTMLAttributes<HTMLDivElement> {
  Icon?: React.ElementType;
  svg?: React.ReactNode;
  label: string;
  gradientTo?: string;
  active?: boolean;
  onClick?: () => void;
  pillLabel?: string;
}

const GenerateCard = React.forwardRef<HTMLDivElement, GenerateCardProps>(
  ({ className, Icon, svg, label, active = false, gradientTo, onClick, pillLabel, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "group relative rounded-sm overflow-hidden transition-all duration-200 cursor-pointer",
          "w-[106px] h-[90px] xs:w-[122px] xs:h-[106px] sm:w-[122px] sm:h-[106px] md:w-[122px] md:h-[106px] lg:w-[122px] lg:h-[106px] xl:w-[140px] xl:h-[114px]",
          "hover:scale-105",
          className
        )}
        style={{
          backgroundColor: active ? '#F2F8FF' : '#FFFFFF',
          border: active ? '2px solid #0F58F9' : '1px solid #D3D3D3',
          boxShadow: 'none'
        }}
        onClick={onClick}
        {...props}
      >
        {/* Badge positioned at top right */}
        {pillLabel && (
          <div className="absolute top-1 right-1 z-10">
            <div className="inline-flex items-center px-[6px] py-[4px] text-[10px] font-normal leading-none rounded-sm gap-0.5 bg-blue-600 text-white">
              <Sparkles size={6} />
              {pillLabel}
            </div>
          </div>
        )}
        <CardContent className="flex flex-col items-center justify-center gap-3 h-full p-4">
            {svg ? (
              <div className="flex items-center justify-center">
                {svg}
              </div>
            ) : Icon && (
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
              className="text-sm xs:text-base sm:text-base md:text-base lg:text-sm xl:text-sm leading-tight text-center px-1 font-semibold"
              style={{
                color: active ? '#0D001B' : '#797979'
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
