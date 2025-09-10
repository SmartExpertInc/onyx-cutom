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
    children,
    ...props 
  }, ref) => {
    const cardContent = (
      <Card
        ref={ref}
        className={cn(
          "group rounded-3xl relative overflow-hidden bg-white border border-gray-200 shadow-lg transition-all duration-300 w-full h-full",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-xl hover:scale-105 cursor-pointer",
          className
        )}
        {...props}
      >
        {/* Gradient at top right corner */}
        <div 
          className={cn(
            "absolute top-0 right-0 w-44 rotate-45 blur-2xl h-34 bg-gradient-to-br opacity-60 rounded-bl-3xl",
            gradientFrom,
            gradientTo
          )}
        />
        
        <CardContent className="relative p-6 h-full flex flex-col">
          {/* Badge positioned at top right */}
          {pillLabel && (
            <div className="absolute top-4 right-4 z-10">
              <Badge variant="secondary" className={cn(labelColor, "bg-white border border-gray-200")}>
                {pillLabel}
              </Badge>
            </div>
          )}
          
          {/* Icon section */}
          {Icon && (
            <div className="flex items-start justify-start h-16 relative mb-3">
              <Icon size={40} className={iconColor} />
            </div>
          )}
          
          {/* Text section */}
          {(title || description) && (
            <div className="flex flex-col items-start gap-3 flex-1 justify-start">
              {title && (
                <h3 className={cn("text-xl text-left leading-tight", labelColor)}>
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-500 text-left leading-relaxed max-w-xs">
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