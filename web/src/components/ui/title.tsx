import { cn } from "@/lib/utils";

export default function Title({
  children,
  className,
  size = "sm",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "xl" | "lg" | "md" | "sm";
}) {
  return (
    <h1
      className={cn(
        "text-lg text-neutral-800 dark:text-neutral-200 font-medium",
        size === "xl" && "text-3xl",
        size === "lg" && "text-2xl",
        size === "md" && "text-xl",
        size === "sm" && "text-lg",
        className
      )}
    >
      {children}
    </h1>
  );
}
