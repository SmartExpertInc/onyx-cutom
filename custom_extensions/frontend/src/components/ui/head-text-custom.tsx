import React from "react";
import { cn } from "@/lib/utils";

interface HeadTextCustomProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  description?: string;
  textSize?: string;
  descriptionSize?: string;
}

const HeadTextCustom = React.forwardRef<HTMLDivElement, HeadTextCustomProps>(
  ({ className, text, description, textSize = "text-4xl sm:text-6xl", descriptionSize = "text-lg sm:text-xl", ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-4 text-center", className)} ref={ref} {...props}>
        <h1 className={cn("font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight", textSize)}>
          {text}
        </h1>
        {description && (
          <p className={cn("text-gray-600 max-w-2xl leading-relaxed", descriptionSize)}>
            {description}
          </p>
        )}
      </div>
    );
  }
);

HeadTextCustom.displayName = "HeadTextCustom";

export { HeadTextCustom };
