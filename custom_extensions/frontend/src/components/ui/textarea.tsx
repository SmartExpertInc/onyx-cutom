import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border border-gray-300 placeholder:text-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-[58px] w-full rounded-lg border bg-white focus:bg-white px-3 py-1 text-lg shadow-xs transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-base lg:text-xl",
        "!focus:ring-2 !focus:ring-purple-400 !focus:border-purple-400",
        className
      )}
      style={{
        backgroundColor: 'white',
        ...props.style
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#c084fc';
        e.target.style.boxShadow = '0 0 0 2px rgba(192, 132, 252, 0.5)';
        if (props.onFocus) props.onFocus(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '';
        e.target.style.boxShadow = '';
        if (props.onBlur) props.onBlur(e);
      }}
      {...props}
    />
  )
}

export { Textarea }
