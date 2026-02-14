import React from "react"

import { cn } from "@/lib/utils"

type ContentContainerProps = {
  children: React.ReactNode
  className?: string
}

export function ContentContainer({ children, className }: ContentContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl px-4 sm:px-6", className)}>
      {children}
    </div>
  )
}
