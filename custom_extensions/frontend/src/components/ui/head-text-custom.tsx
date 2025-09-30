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
        <p style={{
          textShadow: "3px 3px 0px #5F83FF"
        }} 
        className={cn("text-[var(--primary-foreground)] text-shadow-2xs text-shadow-[var(--primary)] leading-tight font-semibold tracking-tight font-sans", textSize)}
        >
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
