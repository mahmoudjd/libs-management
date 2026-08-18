"use client";

import React, { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";

export const THEME_STORAGE_KEY = "mylibrary-theme";

/**
 * Reads the theme the inline boot script already applied to <html>, so the
 * button never fights the server-rendered markup.
 */
export function ThemeToggle({ className }: { className?: string }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const toggleTheme = () => {
        const nextIsDark = !isDark;
        document.documentElement.classList.toggle("dark", nextIsDark);
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? "dark" : "light");
        } catch {
            // Private mode / storage disabled: the theme still applies for this page view.
        }
        setIsDark(nextIsDark);
    };

    const label = isDark ? "Switch to light mode" : "Switch to dark mode";

    return (
        <Button
            variant="ghost"
            size="icon"
            className={className}
            onClick={toggleTheme}
            aria-label={label}
            title={label}
        >
            {isDark ? (
                <SunIcon aria-hidden="true" className="h-5 w-5" />
            ) : (
                <MoonIcon aria-hidden="true" className="h-5 w-5" />
            )}
        </Button>
    );
}
