"use client";

import React, { createContext, useContext, useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useIsFetching } from "@tanstack/react-query";

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

interface GlobalLoaderProps {
  children: React.ReactNode;
}

// Separate component that uses search params/pathnames to isolate Suspense requirement
function RouteObserver() {
  const { isLoading, setIsLoading } = useLoading();
  const [isSignalingComplete, setIsSignalingComplete] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFetching = useIsFetching();

  // Track the previous path to detect actual navigation changes
  const previousPathRef = useRef(pathname);
  const previousParamsRef = useRef(searchParams?.toString());

  // Watch for successful navigation / route changes
  useEffect(() => {
    const paramsString = searchParams?.toString();
    const hasPathChanged = pathname !== previousPathRef.current;
    const hasParamsChanged = paramsString !== previousParamsRef.current;
    
    // Only update refs if changed
    if (hasPathChanged) previousPathRef.current = pathname;
    if (hasParamsChanged) previousParamsRef.current = paramsString || '';

    if (hasPathChanged || hasParamsChanged) {
      // When route changes, we don't immediately stop loading.
      // We signal that the route transition is done.
      if (isLoading) {
        setIsSignalingComplete(true);
      }
    }
  }, [pathname, searchParams, isLoading]);

  // Handle the logic for stopping the loader
  useEffect(() => {
    // Only run this logic if we are loading and waiting for completion signal
    if (!isLoading || !isSignalingComplete) return;

    // Additional Safety:
    // When a route changes, components might take a few milliseconds to mount 
    // and fire their useQuery calls.
    // We start a small timer to allow for that "render gap".
    
    // We use a small delay both for aesthetic smoothness and to catch new queries
    const GRACE_PERIOD_MS = 500; 

    const timer = setTimeout(() => {
      // After grace period, check if we are still fetching data
      // Only close if NO queries are running
      if (isFetching === 0) {
        setIsLoading(false);
        setIsSignalingComplete(false);
      }
      // If isFetching > 0, this effect will re-run when isFetching changes to 0
    }, GRACE_PERIOD_MS);

    return () => clearTimeout(timer);
  }, [isLoading, isSignalingComplete, isFetching, setIsLoading]);

  return null;
}

function LoaderVisuals({ isLoading }: { isLoading: boolean }) {
  // We can add more complex visual logic here if needed, 
  // but for now relying on isLoading is sufficient for enter/exit.
  return (
    <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/35 backdrop-blur-[0.5px]"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary">
               <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "90%" }} 
                transition={{ duration: 3, ease: "circOut" }}
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}

export function GlobalLoaderProvider({ children }: GlobalLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Safety timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      // Safety timeout increased to 15s to allow for slow APIs
      timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 15000); 
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoading]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor?.getAttribute("data-prevent-loader") === "true") return;

      
      if (
        anchor &&
        anchor.href &&
        anchor.target !== "_blank" &&
        anchor.target !== "_parent" &&
        anchor.target !== "_top" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        const url = new URL(anchor.href);
        // Compare full href to detect query param changes too
        if (
          url.origin === window.location.origin &&
          url.href !== window.location.href
        ) {
          setIsLoading(true);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    
    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      <Suspense fallback={null}>
        <RouteObserver />
      </Suspense>
      <LoaderVisuals isLoading={isLoading} />
    </LoadingContext.Provider>
  );
}
