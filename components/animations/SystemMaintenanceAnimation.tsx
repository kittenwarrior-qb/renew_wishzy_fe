"use client";

import { useEffect, useRef } from "react";
import { useRive } from "rive-react";

export type SystemMaintenanceAnimationProps = {
    width?: number | string;
    height?: number | string;
    className?: string;
};

export function SystemMaintenanceAnimation({
    width = 320,
    height = 260,
    className,
}: SystemMaintenanceAnimationProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const { RiveComponent, rive } = useRive({
        src: "/riv/system-maintenance.riv", // cập nhật đúng đường dẫn file .riv của bạn
        stateMachines: "State Machine 1",
        autoplay: true,
    });

    useEffect(() => {
        if (!rive) return;
        // Tuỳ chỉnh thêm nếu trong .riv có input, animation, v.v.
    }, [rive]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                width: typeof width === "number" ? `${width}px` : width,
                height: typeof height === "number" ? `${height}px` : height,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <RiveComponent style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
    );
}
