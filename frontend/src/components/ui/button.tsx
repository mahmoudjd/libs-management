import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground shadow-sm hover:brightness-110",
                outline: "border border-border bg-surface text-foreground hover:border-primary hover:bg-primary-soft hover:text-primary",
                ghost: "bg-transparent text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                subtle: "bg-surface-muted text-foreground hover:bg-primary-soft hover:text-primary",
                success: "bg-success-soft text-success hover:brightness-95 dark:hover:brightness-125",
                destructive: "bg-danger-soft text-danger hover:brightness-95 dark:hover:brightness-125",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 px-3 text-xs",
                lg: "h-12 px-6",
                icon: "h-9 w-9 p-0",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, type = "button", ...props }, ref) => {
        return (
            <button
                type={type}
                className={cn(buttonVariants({ variant, size }), className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
