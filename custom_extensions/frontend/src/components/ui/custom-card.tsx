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
          "group rounded-xl relative overflow-hidden transition-all duration-200 w-full h-full",
          useCSSVariables 
            ? "bg-[hsl(var(--custom-card-bg))] border-[hsl(var(--custom-card-border))] shadow-[var(--custom-card-shadow)] hover:shadow-[var(--custom-card-shadow-hover)]"
            : "bg-white/95 border border-gray-100 shadow-sm hover:shadow-md",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer",
          className
        )}
        {...props}
      >
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
            <div className="flex items-start justify-start h-16 relative mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-300/10 rounded-lg blur-sm"></div>
                <Icon 
                  size={40} 
                  className={cn(
                    "relative z-10",
                    useCSSVariables ? "text-[hsl(var(--custom-card-icon))]" : "text-blue-600"
                  )} 
                />
              </div>
            </div>
          )}
          
          {/* Text section */}
          {(title || description) && (
            <div className="flex flex-col items-start gap-2 flex-1 justify-start">
              {title && (
                <h3 className={cn(
                  "text-lg font-semibold text-left leading-tight",
                  useCSSVariables ? "text-[hsl(var(--custom-card-title))]" : "text-blue-600"
                )}>
                  {title}
                </h3>
              )}
              {description && (
                <p className={cn(
                  "text-sm text-left leading-relaxed text-gray-600",
                  useCSSVariables ? "text-[hsl(var(--custom-card-description))]" : "text-gray-600"
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

    return (
      <div onClick={disabled ? undefined : onClick}>
        {cardContent}
      </div>
    );
  }
);

CustomCard.displayName = "CustomCard";

export { CustomCard };