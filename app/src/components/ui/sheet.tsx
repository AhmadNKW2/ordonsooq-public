"use client";

import * as React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right" | "bottom";
  className?: string;
  title?: string;
}

export function Sheet({ isOpen, onClose, children, side = "left", className, title }: SheetProps) {
  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const variants = {
    initial: { 
      x: side === "left" ? "-100%" : side === "right" ? "100%" : 0, 
      y: side === "bottom" ? "100%" : 0,
    },
    animate: { x: 0, y: 0 },
    exit: { 
      x: side === "left" ? "-100%" : side === "right" ? "100%" : 0, 
      y: side === "bottom" ? "100%" : 0,
    },
  };

  const sideClasses = {
    left: "top-0 bottom-0 left-0 w-full max-w-sm rounded-r-lg",
    right: "top-0 bottom-0 right-0 w-full max-w-sm rounded-l-lg",
    bottom: "bottom-0 left-0 right-0 w-full h-auto max-h-[90vh] rounded-t-2xl"
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          />
          
          {/* Sheet */}
          <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed z-[70] bg-white shadow-2xl flex flex-col",
              sideClasses[side],
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
