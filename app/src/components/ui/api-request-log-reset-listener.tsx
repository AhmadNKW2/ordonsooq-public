"use client";

import { useEffect, useRef } from "react";

import { sendApiLogReset } from "@/lib/api-request-log";

function isApiRequestLogResetEnabled(): boolean {
  return process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_ENABLE_API_REQUEST_LOGGING === "1";
}

export function ApiRequestLogResetListener() {
  const resetPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!isApiRequestLogResetEnabled()) {
      return;
    }

    const requestReset = () => {
      if (resetPromiseRef.current) {
        return;
      }

      const resetPromise = sendApiLogReset()
        .catch(() => undefined)
        .finally(() => {
          if (resetPromiseRef.current === resetPromise) {
            resetPromiseRef.current = null;
          }
        });

      resetPromiseRef.current = resetPromise;
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) {
        return;
      }

      const actionableElement = target.closest(
        "button, [role='button'], a, input[type='submit'], input[type='button']",
      );

      if (!actionableElement) {
        return;
      }

      requestReset();
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}