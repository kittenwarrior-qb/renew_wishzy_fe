"use client"

import * as React from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import useRouterBack from "@/hooks/useRouterBack"

export type BackButtonProps = {
    fallbackHref: string
    label?: string
    className?: string
    disabled?: boolean
}

export function BackButton({ fallbackHref, className, disabled }: BackButtonProps) {
    const { back } = useRouterBack()

    return (
        <Button
            type="button"
            variant="outline"
            className={className}
            disabled={disabled}
            onClick={() => back(fallbackHref)}
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
        </Button>
    )
}
