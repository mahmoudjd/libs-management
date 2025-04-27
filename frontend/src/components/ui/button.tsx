import * as React from "react";
import {cva} from "class-variance-authority";
import {cn} from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none",
    {
        variants: {
            variant: {
                default: "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer",
                outline: "border border-gray-300 hover:bg-gray-100 cursor-pointer",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 px-3",
                lg: "h-12 px-6",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline";
    size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({className, variant, size, ...props}, ref) => {
        return (
            <button
                className={cn(buttonVariants({variant, size}), className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export {Button, buttonVariants};
