import { cn } from "@/lib/utils";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);

        return (
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    className={cn("pr-10", className)}
                    ref={ref}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:text-primary"
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeIcon aria-hidden="true" className="h-4 w-4" />
                    ) : (
                        <EyeSlashIcon aria-hidden="true" className="h-4 w-4" />
                    )}
                </button>
            </div>
        );
    }
);
PasswordInput.displayName = "PasswordInput";
