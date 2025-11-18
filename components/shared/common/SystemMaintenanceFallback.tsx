"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SystemMaintenanceAnimation } from "@/components/animations/SystemMaintenanceAnimation";

export type SystemMaintenanceFallbackProps = {
    message?: string;
    actionHref?: string;
    actionLabel?: string;
};

export function SystemMaintenanceFallback({
    message,
    actionHref,
    actionLabel = "Fanpage hỗ trợ",
}: SystemMaintenanceFallbackProps) {
    const showAction = Boolean(actionHref);

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80 flex items-center justify-center px-4">
            <div className="mx-auto flex w-[1200px] max-w-4xl flex-col items-center gap-6 md:flex-row md:items-center md:justify-center">
                <div className="flex w-full items-center justify-center md:w-1/2">
                    <SystemMaintenanceAnimation width="100%" height={320} />
                </div>

                <div className="mt-4 flex w-full max-w-md flex-col items-center text-center md:mt-0 md:w-1/2">
                    <h1 className="text-xl md:text-2xl font-semibold tracking-wide uppercase">
                        Hệ thống đang được bảo trì
                    </h1>
                    <p className="mt-3 text-sm md:text-base text-muted-foreground">
                        {message || "Thành thật xin lỗi bạn về sự bất tiện này. Chúng tôi đang nỗ lực hoàn tất bảo trì trong thời gian sớm nhất."}
                    </p>

                    {showAction && (
                        <a
                            href={actionHref}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-6 inline-flex"
                        >
                            <Button className="px-6 py-2 text-sm font-medium">
                                {actionLabel}
                            </Button>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
