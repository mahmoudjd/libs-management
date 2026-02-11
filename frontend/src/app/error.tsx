"use client"

import {Card} from "@/components/ui/card";
import {Text} from "@/components/ui/text";
import {useEffect} from "react";

export default function Error({error, reset}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])
    return (
        <div className="flex flex-col">
            <Card>
                <Text variant="title"> Oops!</Text>
                <Text variant="subtitle">Something went wrong!</Text>
            </Card>
        </div>
    )
}