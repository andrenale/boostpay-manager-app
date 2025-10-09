import * as React from "react";
import { cn } from "@/lib/utils";

export interface BoostInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const BoostInput = React.forwardRef<HTMLInputElement, BoostInputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-boost-text-secondary">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "boost-input w-full",
            icon ? "pl-10" : "",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
BoostInput.displayName = "BoostInput";

export { BoostInput };