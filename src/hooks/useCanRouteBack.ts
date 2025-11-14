"use client";

import { useEffect, useState } from "react";

const useCanRouteBack = () => {
    const [canGoBack, setCanGoBack] = useState<boolean>(false);

    useEffect(() => {
        const compute = () => {
            if (typeof window === "undefined") return false;
            const hasHistory = window.history.length > 1;
            const hasReferrer = typeof document !== "undefined" && !!document.referrer;
            return hasHistory || hasReferrer;
        };

        setCanGoBack(compute());

        const onPopState = () => setCanGoBack(compute());
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    return canGoBack;
};

export default useCanRouteBack;
