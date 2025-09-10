import React from "react";
import { cn } from "@/lib/utils";

interface GenerateCardProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  description?: string;
}

const HeadTextCustom = React.forwardRef<HTMLDivElement, GenerateCardProps>(
  ({ className, text, description, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-4 text-center", className)} ref={ref} {...props}>
        <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
          {text}
        </h1>
        {description && (
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    );
  }
);

HeadTextCustom.displayName = "HeadTextCustom";

export { HeadTextCustom };
