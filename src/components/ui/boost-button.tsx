import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const boostButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-boost-accent-hover boost-glow",
        secondary: "bg-boost-bg-secondary border border-boost-border text-boost-text-primary hover:bg-boost-bg-tertiary",
        outline: "border border-boost-border bg-transparent text-boost-text-primary hover:bg-boost-bg-secondary hover:text-boost-text-primary",
        ghost: "text-boost-text-primary hover:bg-boost-bg-secondary hover:text-boost-text-primary",
        success: "bg-status-success text-white hover:opacity-90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 rounded-md px-3",
        default: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface BoostButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof boostButtonVariants> {
  asChild?: boolean;
}

const BoostButton = React.forwardRef<HTMLButtonElement, BoostButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(boostButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
BoostButton.displayName = "BoostButton";

export { BoostButton, boostButtonVariants };