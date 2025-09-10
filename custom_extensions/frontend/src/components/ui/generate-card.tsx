import React from "react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface GenerateCardProps extends React.HTMLAttributes<HTMLDivElement> {
  Icon?: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const GenerateCard = React.forwardRef<HTMLDivElement, GenerateCardProps>(
  ({ className, Icon, label, active = false, onClick, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "group relative overflow-hidden transition-all duration-200 cursor-pointer w-40 h-28",
          "hover:scale-105",
          className
        )}
        style={{
          backgroundColor: 'white',
          borderColor: active ? '#C5CAD1' : '#e2e8f0',
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
            <Icon 
              size={64} 
              style={{
                color: active ? '#3b82f6' : '#4b5563',
                fontWeight: 'bold',
                strokeWidth: active ? 2.5 : 2
              }}
            />
          )}
          <span 
            className="text-sm font-semibold leading-tight text-center"
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
