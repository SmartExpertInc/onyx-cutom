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
          "group rounded-3xl relative overflow-hidden transition-all duration-300 cursor-pointer w-40 h-28",
          "bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:scale-105",
          active 
            ? "border-2 border-blue-500 shadow-lg ring-2 ring-blue-200" 
            : "border border-gray-200 hover:border-gray-300 hover:shadow-md",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <CardContent className="relative p-4 h-full flex flex-col items-center justify-center">
          {Icon && (
            <Icon 
              size={54} 
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
