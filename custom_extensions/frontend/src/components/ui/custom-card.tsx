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

const SparklesIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9.86433 5.31444C7.33132 4.61499 6.80457 4.08769 6.10505 1.55516C6.08283 1.47461 6.00969 1.41907 5.92637 1.41907C5.84305 1.41907 5.76991 1.47462 5.74769 1.55516C5.04825 4.08816 4.52094 4.61491 1.98841 5.31444C1.90786 5.33666 1.85278 5.4098 1.85278 5.49312C1.85278 5.57644 1.90833 5.64958 1.98841 5.6718C4.52142 6.37124 5.04817 6.89854 5.74769 9.43108C5.76991 9.51162 5.84305 9.56716 5.92637 9.56716C6.00969 9.56716 6.08283 9.51162 6.10505 9.43108C6.80449 6.89807 7.3318 6.37132 9.86433 5.6718C9.94487 5.64958 9.99996 5.57644 9.99996 5.49312C9.99996 5.4098 9.94441 5.33666 9.86433 5.31444Z" fill="#0F58F9"/>
  <path d="M1.85807 4.43053C1.88029 4.51107 1.95343 4.56661 2.03675 4.56661C2.12007 4.56661 2.19321 4.51107 2.21543 4.43053C2.53947 3.25753 2.7649 3.03207 3.93788 2.70808C4.01842 2.68586 4.0735 2.61272 4.0735 2.5294C4.0735 2.44608 4.01795 2.37294 3.93788 2.35072C2.76488 2.02669 2.53942 1.80172 2.21543 0.628277C2.19321 0.547731 2.12007 0.492188 2.03675 0.492188C1.95343 0.492188 1.88029 0.547736 1.85807 0.628277C1.53404 1.80127 1.30861 2.02673 0.135627 2.35072C0.0550815 2.37294 0 2.44608 0 2.5294C0 2.61272 0.0555484 2.68586 0.135627 2.70808C1.30862 3.03212 1.53408 3.25708 1.85807 4.43053Z" fill="#0F58F9"/>
  <path d="M4.21388 8.55415C3.22974 8.28242 3.04088 8.09356 2.7692 7.10948C2.74698 7.02893 2.67384 6.97339 2.59052 6.97339C2.5072 6.97339 2.43406 7.02894 2.41184 7.10948C2.14012 8.09361 1.95126 8.28247 0.96717 8.55415C0.886624 8.57637 0.831543 8.64951 0.831543 8.73283C0.831543 8.81615 0.887091 8.88929 0.96717 8.91151C1.9513 9.18324 2.14016 9.3721 2.41184 10.3562C2.43406 10.4367 2.5072 10.4923 2.59052 10.4923C2.67384 10.4923 2.74698 10.4367 2.7692 10.3562C3.04093 9.37205 3.22979 9.18319 4.21388 8.91151C4.29442 8.88929 4.3495 8.81615 4.3495 8.73283C4.3495 8.64951 4.29395 8.57637 4.21388 8.55415Z" fill="#0F58F9"/>
  </svg>
);

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
          "group rounded-lg relative overflow-hidden transition-all duration-200 w-full h-full min-w-[380px]",
          useCSSVariables 
            ? "bg-[hsl(var(--custom-card-bg))] border-[hsl(var(--custom-card-border))] shadow-lg hover:shadow-xl"
            : "bg-white/95 border border-gray-100 shadow-sm hover:shadow-md shadow-lg hover:shadow-xl",
          disabled
            ? "opacity-50 cursor-not-allowed shadow-lg hover:shadow-xl"
            : "cursor-pointer shadow-lg hover:shadow-xl",
          className
        )}
        {...props}
      >
        {/* Subtle background circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-50/20 rounded-full border border-indigo-100/50" />
        <div className="absolute -top-8 -left-8 w-72 h-72 bg-blue-100/15 rounded-full border border-indigo-100/50" />
        <CardContent className="relative p-6 h-full flex flex-col">
          {/* Badge positioned at top right */}
          {pillLabel && (
            <div className="absolute top-4 right-4 z-10">
              <div 
                className={cn(
                  "inline-flex items-center px-2 py-1 text-xs font-semibold",
                  useCSSVariables 
                    ? "bg-white rounded-md border-none text-blue-600 gap-1"
                    : cn(labelColor, "bg-white rounded-md border-none text-blue-600 gap-1")
                )}
              >
                <SparklesIcon size={10} />
                {pillLabel}
              </div>
            </div>
          )}
          
          {/* Icon section */}
          {Icon && (
            <div className="flex items-start justify-start h-16 relative mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-300/10 rounded-lg blur-sm"></div>
                <Icon 
                  size={53} 
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
                  "text-2xl font-semibold text-left leading-tight",
                  useCSSVariables ? "text-[hsl(var(--custom-card-title))]" : "text-blue-600"
                )}>
                  {title}
                </h3>
              )}
              {description && (
                <p className={cn(
                  "text-base text-left leading-relaxed text-gray-600",
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