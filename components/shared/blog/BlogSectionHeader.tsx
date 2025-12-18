"use client"

import React from "react"

interface BlogSectionHeaderProps {
    title?: string
    description?: string
}

export const BlogSectionHeader = ({
    title = "Bài Viết Mới Nhất",
    description
}: BlogSectionHeaderProps) => {
    return (
        <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-background rounded-full text-sm font-medium shadow-sm mb-4">
                <span className="text-primary">✦</span>
                <span>Blog</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {title}
            </h1>
            {description && (
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    {description}
                </p>
            )}
        </div>
    )
}
