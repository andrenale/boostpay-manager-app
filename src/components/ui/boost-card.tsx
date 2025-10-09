import * as React from "react";
import { cn } from "@/lib/utils";

const BoostCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "boost-card animate-fade-in",
      className
    )}
    {...props}
  />
));
BoostCard.displayName = "BoostCard";

const BoostCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
BoostCardHeader.displayName = "BoostCardHeader";

const BoostCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight text-boost-text-primary", className)}
    {...props}
  />
));
BoostCardTitle.displayName = "BoostCardTitle";

const BoostCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-boost-text-secondary", className)} {...props} />
));
BoostCardDescription.displayName = "BoostCardDescription";

const BoostCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
BoostCardContent.displayName = "BoostCardContent";

const BoostCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
BoostCardFooter.displayName = "BoostCardFooter";

export { BoostCard, BoostCardHeader, BoostCardFooter, BoostCardTitle, BoostCardDescription, BoostCardContent };