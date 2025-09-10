import React from "react";
import Link from "next/link";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

interface CustomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  Icon?: React.ElementType;
  title?: string;
  description?: string;
  pillLabel?: string;
  gradientFrom?: string;
  gradientTo?: string;
  iconColor?: string;
  labelColor?: string;
  disabled?: boolean;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  useCSSVariables?: boolean;
}

const CustomCard = React.forwardRef<HTMLDivElement, CustomCardProps>(
  ({ 
    className, 
    Icon, 
    title, 
    description, 
    pillLabel,
    gradientFrom = "from-blue-300",
    gradientTo = "to-purple-200",
    iconColor = "text-blue-600",
    labelColor = "text-blue-600",
    disabled = false,
    href,
    onClick,
    useCSSVariables = false,
    children,
    ...props 
  }, ref) => {
    const cardContent = (
      <Card
        ref={ref}
        className={cn(
          "group rounded-3xl relative overflow-hidden transition-all duration-300 w-full h-full",
          useCSSVariables 
            ? "bg-[hsl(var(--custom-card-bg))] border-[hsl(var(--custom-card-border))] shadow-[var(--custom-card-shadow)] hover:shadow-[var(--custom-card-shadow-hover)]"
            : "bg-white border border-gray-200 shadow-lg hover:shadow-xl",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-105 cursor-pointer",
          className
        )}
        {...props}
      >
        {/* Gradient at top right corner */}
        <div 
          className={cn(
            "absolute top-0 right-0 w-44 rotate-45 blur-2xl h-34 bg-gradient-to-br rounded-bl-3xl",
            useCSSVariables 
              ? "opacity-[var(--custom-card-gradient-opacity)]"
              : "opacity-60",
            useCSSVariables ? "" : gradientFrom,
            useCSSVariables ? "" : gradientTo
          )}
          style={useCSSVariables ? {
            background: `linear-gradient(to bottom right, hsl(var(--custom-card-gradient-from)), hsl(var(--custom-card-gradient-to)))`
          } : undefined}
        />
        
        <CardContent className="relative p-6 h-full flex flex-col">
          {/* Badge positioned at top right */}
          {pillLabel && (
            <div className="absolute top-4 right-4 z-10">
              <Badge 
                variant="secondary" 
                className={cn(
                  useCSSVariables 
                    ? "bg-[hsl(var(--custom-card-badge-bg))] border-[hsl(var(--custom-card-badge-border))] text-[hsl(var(--custom-card-badge-text))]"
                    : cn(labelColor, "bg-white border border-gray-200")
                )}
              >
                {pillLabel}
              </Badge>
            </div>
          )}
          
          {/* Icon section */}
          {Icon && (
            <div className="flex items-start justify-start h-16 relative mb-3">
              <Icon 
                size={40} 
                className={useCSSVariables ? "text-[hsl(var(--custom-card-icon))]" : iconColor} 
              />
            </div>
          )}
          
          {/* Text section */}
          {(title || description) && (
            <div className="flex flex-col items-start gap-3 flex-1 justify-start">
              {title && (
                <h3 className={cn(
                  "text-xl text-left leading-tight",
                  useCSSVariables ? "text-[hsl(var(--custom-card-title))]" : labelColor
                )}>
                  {title}
                </h3>
              )}
              {description && (
                <p className={cn(
                  "text-sm text-left leading-relaxed max-w-xs",
                  useCSSVariables ? "text-[hsl(var(--custom-card-description))]" : "text-gray-500"
                )}>
                  {description}
                </p>
              )}
            </div>
          )}
          
          {/* Custom content */}
          {children}
        </CardContent>
      </Card>
    );

    if (href && !disabled) {
      return (
        <Link href={href} onClick={onClick}>
          {cardContent}
        </Link>
      );
    }

    return cardContent;
  }
);

CustomCard.displayName = "CustomCard";

export { CustomCard };