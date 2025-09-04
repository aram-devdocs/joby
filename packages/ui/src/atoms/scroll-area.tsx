import * as React from "react";
import { cn } from "../lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both";
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "vertical", ...props }, ref) => {
    const scrollClass = cn(
      "relative overflow-auto",
      orientation === "vertical" && "overflow-x-hidden",
      orientation === "horizontal" && "overflow-y-hidden",
      className,
    );

    return (
      <div ref={ref} className={scrollClass} {...props}>
        {children}
      </div>
    );
  },
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
