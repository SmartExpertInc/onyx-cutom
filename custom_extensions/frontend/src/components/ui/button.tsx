import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        back: 
          "absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-full px-4 py-2 border border-gray-200 bg-white/60 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md",
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-[#002864] via-[#003EA8] to-[#63A2FF] text-white shadow-lg hover:opacity-90 active:scale-95 transition-all",
        blueGradient:
          "bg-gradient-to-r from-[#E5EFFF] to-[#F2F2FF] text-gray-600 shadow-lg hover:opacity-90 active:scale-95 transition-all",
        import:
          "bg-white text-gray-800 border border-gray-300 shadow-sm hover:bg-gray-50 active:scale-95 transition-all",
        filter:
          "text-gray-600 hover:bg-gray-100 transition-colors",
        "filter-active":
          "bg-white shadow-sm border border-gray-200 text-black",
        sort:
          "text-black hover:text-gray-700 transition-colors",
        columns:
          "text-black hover:text-gray-700 transition-colors",
        download:
          "bg-blue-600 text-white hover:bg-blue-700 transition-colors",
        view:
          "p-1.5 rounded-md cursor-pointer",
        "view-active":
          "p-1.5 rounded-md cursor-pointer bg-white shadow-sm",
        menu:
          "w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer",
        "menu-item":
          "flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer",
        "menu-item-orange":
          "flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md cursor-pointer",
        "menu-item-red":
          "flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
