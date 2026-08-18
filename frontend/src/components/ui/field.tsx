import * as React from "react";

type FieldProps = {
    label: string;
    htmlFor: string;
    hint?: string;
    children: React.ReactNode;
};

/** Label + control + hint, so every form field carries a real visible label. */
export function Field({ label, htmlFor, hint, children }: FieldProps) {
    return (
        <div>
            <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
                {label}
            </label>
            {children}
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}
