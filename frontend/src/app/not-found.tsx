import Link from "next/link"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center py-10">
            <Card className="w-full max-w-md">
                <CardContent className="text-center">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-surface-muted text-muted-foreground">
                        <MagnifyingGlassIcon aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <h1 className="mt-4 text-xl font-bold text-foreground">Page not found</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        This page does not exist, or you no longer have access to it.
                    </p>
                    <div className="mt-6 flex justify-center gap-2">
                        <Link href="/books" className={buttonVariants({ variant: "outline" })}>
                            Browse books
                        </Link>
                        <Link href="/dashboard" className={buttonVariants()}>
                            Go to dashboard
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
