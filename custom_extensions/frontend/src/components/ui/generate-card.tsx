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
          "group relative overflow-hidden transition-all duration-200 cursor-pointer backdrop-blur-sm",
          active ? "w-44 h-32" : "w-40 h-28",
          "hover:scale-105",
          className
        )}
        style={{
          backgroundColor: `rgb(var(--generate-card-bg))`,
          borderColor: active ? `rgb(var(--generate-card-border-active))` : `rgb(var(--generate-card-border))`,
          borderWidth: '1px',
          boxShadow: active 
            ? `var(--generate-card-shadow-active)` 
            : `var(--generate-card-shadow)`
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.boxShadow = `var(--generate-card-shadow-hover)`;
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.boxShadow = `var(--generate-card-shadow)`;
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
                color: `rgb(var(--generate-card-icon${active ? '-active' : ''}))`
              }}
            />
          )}
          <span 
            className="text-sm font-semibold leading-tight text-center"
            style={{
              color: `rgb(var(--generate-card-text${active ? '-active' : ''}))`
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
