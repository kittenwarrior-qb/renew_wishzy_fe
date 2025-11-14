"use client";

import { useCallback } from "react";
import useCanRouteBack from "./useCanRouteBack";
import { useRouter } from "next/navigation";

type RouterBackOptions = {
  replace?: boolean;
};

const useRouterBack = () => {
  const router = useRouter();
  const canGoBack = useCanRouteBack();

  const back = useCallback(
    (fallback: string, opts?: RouterBackOptions) => {
      if (canGoBack) {
        router.back();
        return;
      }
      if (opts?.replace) {
        router.replace(fallback);
        return;
      }
      router.push(fallback);
    },
    [canGoBack, router],
  );

  return { back, router, canGoBack };
};

export default useRouterBack;
