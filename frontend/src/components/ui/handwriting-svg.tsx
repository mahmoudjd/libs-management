"use client";

// Pinned to 1.3.x: opentype.js 2.0.0 emits NaN coordinates from toPathData(),
// which silently truncates the rendered glyphs.
import * as opentype from "opentype.js";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const DEFAULT_FONT_URL =
    "https://raw.githubusercontent.com/google/fonts/main/ofl/indieflower/IndieFlower-Regular.ttf";

const easings = {
    linear: "linear",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
} as const;

interface HandwritingSvgProps {
    path?: string;
    text?: string;
    fontUrl?: string;
    className?: string;
    strokeClassName?: string;
    duration?: number;
    delay?: number;
    strokeWidth?: number;
    width?: number;
    height?: number;
    fontSize?: number;
    ease?: keyof typeof easings;
}

export function HandwritingSvg({
    path: pathProp,
    text,
    fontUrl = DEFAULT_FONT_URL,
    className,
    strokeClassName,
    duration = 2,
    delay = 0.5,
    strokeWidth = 2,
    width = 100,
    height = 100,
    fontSize = 48,
    ease = "easeInOut",
}: HandwritingSvgProps) {
    const [path, setPath] = useState<string | null>(pathProp ?? null);
    const [viewBox, setViewBox] = useState(`0 0 ${width} ${height}`);
    const [loading, setLoading] = useState(Boolean(text) && !pathProp);

    useEffect(() => {
        if (!text || pathProp) {
            setPath(pathProp ?? null);
            setViewBox(`0 0 ${width} ${height}`);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        setLoading(true);

        fetch(fontUrl, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error(`Font request failed: ${res.status}`);
                return res.arrayBuffer();
            })
            .then((buffer) => {
                const glyphPath = opentype.parse(buffer).getPath(text, 0, fontSize, fontSize);
                const box = glyphPath.getBoundingBox();
                const pad = 5;
                setViewBox(
                    [
                        Math.floor(box.x1) - pad,
                        Math.floor(box.y1) - pad,
                        Math.ceil(box.x2 - box.x1) + pad * 2,
                        Math.ceil(box.y2 - box.y1) + pad * 2,
                    ].join(" ")
                );
                setPath(glyphPath.toPathData(2));
                setLoading(false);
            })
            .catch((error) => {
                if (controller.signal.aborted) return;
                console.error("HandwritingSvg: could not render text", error);
                setPath(null);
                setLoading(false);
            });

        return () => controller.abort();
    }, [text, fontUrl, pathProp, fontSize, width, height]);

    // While the font is in flight — or if it never arrives — the words still have
    // to be readable, so fall back to ordinary text in the same box. Reserving
    // width/height keeps the swap from shifting the layout.
    if (loading || !path) {
        if (!text) return null;

        return (
            <span
                style={{ width, height, fontSize }}
                className={cn(
                    "inline-flex items-center justify-center leading-none",
                    className
                )}
            >
                {text}
            </span>
        );
    }

    return (
        <svg
            width={width}
            height={height}
            viewBox={pathProp ? `0 0 ${width} ${height}` : viewBox}
            className={cn("text-primary", className)}
            // Glyphs drawn as paths are invisible to assistive tech, so the text is
            // re-announced here instead of being hidden outright.
            {...(text ? { role: "img", "aria-label": text } : { "aria-hidden": "true" as const })}
        >
            <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={strokeClassName}
                // pathLength normalises the stroke to 1 unit, so the dash animation
                // needs no getTotalLength() measurement pass.
                pathLength={1}
                style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                    animation: `handwriting-draw ${duration}s ${easings[ease]} ${delay}s forwards`,
                }}
            />
        </svg>
    );
}

export default HandwritingSvg;
