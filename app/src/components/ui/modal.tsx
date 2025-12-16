"use client";

import * as React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence, type Transition, type TargetAndTransition } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimationType = "scale" | "slide-up" | "slide-down" | "fade" | "zoom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  animation?: AnimationType;
  backdropClassName?: string;
  closeButtonClassName?: string;
}

const animationVariants: Record<AnimationType, {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition: Transition;
}> = {
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  "slide-up": {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  "slide-down": {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};

export function Modal({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  closeOnBackdropClick = true,
  animation = "scale",
  backdropClassName,
  closeButtonClassName,
}: ModalProps) {
  const variants = animationVariants[animation];

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute inset-0 bg-black/80 backdrop-blur-sm",
              backdropClassName
            )}
            onClick={closeOnBackdropClick ? onClose : undefined}
          />

          {/* Content */}
          <motion.div
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={variants.transition}
            className={cn(
              "relative z-10 w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  "absolute top-4 right-4 p-2 text-third hover:text-primary hover:bg-gray-100 rounded-full transition-colors z-50",
                  closeButtonClassName
                )}
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
