import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-white focus:bg-white px-3 py-2 text-base shadow-xs transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "!focus:ring-2 !focus:ring-blue-500 !focus:border-blue-500",
        className
      )}
      style={{
        backgroundColor: 'white',
        ...props.style
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#3b82f6';
        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
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
