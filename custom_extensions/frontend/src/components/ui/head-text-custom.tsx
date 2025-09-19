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
      <div className={cn("flex flex-col gap-4 text-center items-center", className)} ref={ref} {...props}>
        <h1 className={cn("text-gray-900 leading-tight font-semibold tracking-tight", textSize)} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          {text}
        </h1>
        {description && (
          <p className={cn("text-[#657383] text-md leading-relaxed text-center font-medium tracking-normal", descriptionSize)} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            {description}
          </p>
        )}
      </div>
    );
  }
);

HeadTextCustom.displayName = "HeadTextCustom";

export { HeadTextCustom };
