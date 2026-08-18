"use client"

import { useEffect } from "react"
import { ArrowPathIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Error({error, reset}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-[60vh] items-center justify-center py-10">
            <Card className="w-full max-w-md">
                <CardContent className="text-center">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-danger-soft text-danger">
                        <ExclamationTriangleIcon aria-hidden="true" className="h-6 w-6"/>
                    </span>
                    <h1 className="mt-4 text-xl font-bold text-foreground">Something went wrong</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        The page could not be loaded. Try again — if it keeps failing, contact an administrator.
                    </p>
                    {error.digest && (
                        <p className="mt-2 font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>
                    )}
                    <Button className="mt-6" onClick={reset}>
                        <ArrowPathIcon aria-hidden="true" className="h-4 w-4"/>
                        Try again
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
