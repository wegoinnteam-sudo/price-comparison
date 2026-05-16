import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "green" | "blue" | "amber" | "red" | "muted";

const tones: Record<BadgeTone, string> = {
  default: "border-primary/30 bg-primary/15 text-primary",
  green: "border-emerald-400/30 bg-emerald-400/12 text-emerald-300",
  blue: "border-sky-400/30 bg-sky-400/12 text-sky-300",
  amber: "border-amber-400/30 bg-amber-400/12 text-amber-300",
  red: "border-red-400/30 bg-red-400/12 text-red-300",
  muted: "border-border bg-secondary text-muted-foreground",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
