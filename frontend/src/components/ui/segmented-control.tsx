"use client";

import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
    value: T;
    label: string;
    count?: number;
};

type SegmentedControlProps<T extends string> = {
    label: string;
    options: SegmentedOption<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
};

export function SegmentedControl<T extends string>({
    label,
    options,
    value,
    onChange,
    className,
}: SegmentedControlProps<T>) {
    return (
        <div
            role="group"
            aria-label={label}
            className={cn(
                "inline-flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1",
                className
            )}
        >
            {options.map((option) => {
                const isSelected = option.value === value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors",
                            isSelected
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                        )}
                    >
                        {option.label}
                        {option.count !== undefined && (
                            <span
                                className={cn(
                                    "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                                    isSelected ? "bg-white/20" : "bg-surface-muted"
                                )}
                            >
                                {option.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
