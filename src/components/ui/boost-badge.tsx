import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const boostBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-boost-bg-tertiary text-boost-text-primary",
        success: "boost-badge-success",
        error: "boost-badge-error", 
        warning: "boost-badge-warning",
        info: "boost-badge-info",
        outline: "border-boost-border text-boost-text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BoostBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boostBadgeVariants> {}

function BoostBadge({ className, variant, ...props }: BoostBadgeProps) {
  return (
    <div className={cn(boostBadgeVariants({ variant }), className)} {...props} />
  );
}

export { BoostBadge, boostBadgeVariants };