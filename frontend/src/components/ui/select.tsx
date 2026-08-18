import * as React from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import { cn } from "@/lib/utils";
import { inputClassName } from "@/components/ui/input";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

/** Native select styled like Input — keyboard/screen-reader behaviour comes for free. */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    className={cn(inputClassName, "cursor-pointer appearance-none pr-9", className)}
                    ref={ref}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
            </div>
        );
    }
);
Select.displayName = "Select";

export { Select };
