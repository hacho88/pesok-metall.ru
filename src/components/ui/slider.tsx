import * as React from "react";
import { cn } from "@/lib/utils";

// Нативный range-input в стиле shadcn/ui (без radix-зависимости)
const Slider = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    type="range"
    className={cn(
      "h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary",
      className
    )}
    ref={ref}
    {...props}
  />
));
Slider.displayName = "Slider";

export { Slider };
