import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" | "success" | "destructive" | "outline" }>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
          {
            "bg-blue-100 text-blue-700": variant === "default",
            "bg-slate-100 text-slate-700": variant === "secondary",
            "bg-green-100 text-green-700": variant === "success",
            "bg-red-100 text-red-700": variant === "destructive",
            "border border-slate-200 text-slate-700": variant === "outline",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
