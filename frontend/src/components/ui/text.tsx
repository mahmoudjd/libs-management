import React from 'react';
import {cva, VariantProps} from 'class-variance-authority';
import {cn} from "@/lib/utils";

const textVariants = cva("text-gray-800", {
    variants: {
        variant: {
            default: "text-base",
            muted: "text-gray-500 text-sm",
            title: "text-xl font-bold",
            subtitle: "text-lg font-semibold",
            small: "text-xs",
            error: "text-red-500 font-semibold",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof textVariants> {
}

const Text: React.FC<TextProps> = ({className, variant, ...props}) => {
    return (
        <p className={cn(textVariants({variant}), className)} {...props} />
    );
};

export {Text};
