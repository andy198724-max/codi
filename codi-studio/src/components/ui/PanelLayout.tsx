import React, { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PanelGroupProps {
  direction: "horizontal" | "vertical";
  children: React.ReactNode;
  className?: string;
}

export function PanelGroup({ direction, children, className }: PanelGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-1 overflow-hidden",
        direction === "horizontal" ? "flex-row" : "flex-col",
        className
      )}
    >
      {children}
    </div>
  );
}

interface PanelProps {
  defaultSize: number;
  minSize?: number;
  maxSize?: number;
  children: React.ReactNode;
  className?: string;
}

export function Panel({
  defaultSize,
  minSize = 10,
  maxSize = 90,
  children,
  className,
}: PanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden", className)}
      style={{ flex: `${defaultSize} 1 0%`, minWidth: 0 }}
    >
      {children}
    </div>
  );
}

interface PanelResizeHandleProps {
  className?: string;
}

export function PanelResizeHandle({ className }: PanelResizeHandleProps) {
  return (
    <div
      className={cn(
        "flex-shrink-0 transition-colors cursor-col-resize",
        className
      )}
    />
  );
}
