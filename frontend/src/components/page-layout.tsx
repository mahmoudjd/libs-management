import React from "react";

type PageLayoutProps = {
    title: string;
    description?: string;
    /** Primary page actions, rendered next to the title on wide screens. */
    actions?: React.ReactNode;
    children: React.ReactNode;
};

export const PageLayout = ({ title, description, actions, children }: PageLayoutProps) => {
    return (
        <section className="py-7 md:py-10">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
            <div>{children}</div>
        </section>
    );
};
