"use client"

import * as React from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

type Props = Readonly<{
    children: ReactNode
    tooltipLabel?: ReactNode
    lineClamp?: 1 | 2 | 3 | 4 | 5 | 6
    maxWidth?: number
    className?: string
}>

const lineClampClasses: Record<number, string> = {
    1: "line-clamp-1",
    2: "line-clamp-2",
    3: "line-clamp-3",
    4: "line-clamp-4",
    5: "line-clamp-5",
    6: "line-clamp-6",
}

export function TruncateTooltipWrapper({
    children,
    tooltipLabel,
    lineClamp = 1,
    maxWidth = 500,
    className,
}: Props) {
    const ref = React.useRef<HTMLDivElement>(null)
    const [isTruncated, setIsTruncated] = React.useState(false)

    React.useEffect(() => {
        const el = ref.current
        if (!el) return

        const isOverflowing =
            el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
        setIsTruncated(isOverflowing)
    }, [children])

    const content = (
        <div
            ref={ref}
            className={cn(
                lineClampClasses[lineClamp],
                "overflow-hidden break-words whitespace-normal [&>*]:inline",
                className,
            )}
            style={{ maxWidth }}
        >
            {children}
        </div>
    )

    if (!isTruncated) {
        return content
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent
                className="max-w-[500px] w-full whitespace-normal break-words text-left"
                side="bottom"
                align="start"
            >
                {tooltipLabel ?? children}
            </TooltipContent>
        </Tooltip>
    )
}
