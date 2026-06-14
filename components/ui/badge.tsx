import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "teal" | "amber" | "blue" | "green" | "slate";

const variants: Record<BadgeVariant, string> = {
  default: "bg-indigo-950 text-white",
  teal: "bg-teal-100 text-teal-800",
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  green: "bg-emerald-100 text-emerald-800",
  slate: "bg-slate-100 text-slate-700",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", variants[variant], className)}
      {...props}
    />
  );
}
