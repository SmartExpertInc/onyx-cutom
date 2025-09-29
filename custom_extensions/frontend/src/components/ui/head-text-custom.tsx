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
        <p className={cn("text-white leading-tight font-semibold tracking-tight font-sans", textSize)} style={{
          textShadow: '2px 2px 0 #3b82f6, -2px -2px 0 #3b82f6, 2px -2px 0 #3b82f6, -2px 2px 0 #3b82f6, 0 2px 0 #3b82f6, 0 -2px 0 #3b82f6, 2px 0 0 #3b82f6, -2px 0 0 #3b82f6'
        }}>
          {text}
        </p>
        {description && (
          <p className={cn("text-[var(--secondary-foreground)] text-md leading-relaxed text-center font-sans font-medium tracking-normal", descriptionSize)}>
            {description}
          </p>
        )}
      </div>
    );
  }
);

HeadTextCustom.displayName = "HeadTextCustom";

export { HeadTextCustom };
