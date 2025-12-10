"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
interface Product {
  id: string | number;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

interface AddToCartButtonProps {
  product: Product;
  onAddToCart?: (count: number) => void;
  onStatusChange?: (status: "idle" | "loading" | "success") => void;
  color?: string;
}

// --- Components ---

export function AddToCartButton({ product, onAddToCart, onStatusChange, color }: AddToCartButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const hasCustomColor = !!color;

  const updateStatus = (newStatus: "idle" | "loading" | "success") => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  const handleClick = async () => {
    if (status !== "idle" || product.stock === 0) return;

    updateStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 600));
    updateStatus("success");
    if (onAddToCart) onAddToCart(1);

    setTimeout(() => {
      updateStatus("idle");
    }, 2500);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <AnimatePresence>
          {status === "success" && (
            <Particles />
          )}
        </AnimatePresence>

        <motion.button
          ref={buttonRef}
          onClick={handleClick}
          disabled={product.stock === 0 || status !== "idle"}
          className={cn(
            "relative w-full h-11 overflow-hidden rounded-full text-sm font-bold shadow-s1 transition-all focus:outline-none flex items-center justify-center",
            hasCustomColor
              ? cn(
                  "text-white",
                  color,
                  status === "loading" && "opacity-90 cursor-wait",
                  status === "success" && "bg-green-500! hover:bg-green-600!"
                )
              : status === "idle"
                ? "bg-white/80 text-primary hover:bg-gray-50"
                : status === "loading"
                  ? "bg-secondary cursor-wait text-white"
                  : "bg-green-500 text-white hover:bg-green-600"
          )}
          whileTap={status === "idle" ? { scale: 0.95 } : {}}
        >
          <div className="relative flex items-center justify-center gap-2 min-h-5">
            <AnimatePresence mode="popLayout" initial={false}>
              {status === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart size={18} />
                  <span>
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </span>
                </motion.div>
              )}

              {status === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute"
                >
                  <Loader2 className="animate-spin" size={20} />
                </motion.div>
              )}

              {status === "success" && (
                <motion.div
                  key="success"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="flex items-center gap-2"
                >
                  <div className="rounded-full bg-white/20 p-1">
                    <Check size={16} strokeWidth={4} />
                  </div>
                  <span>Added!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {status === "loading" && (
            <motion.div
              layoutId="loader-bg"
              className="absolute bottom-0 left-0 top-0 bg-white/20"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6, ease: "linear" }}
            />
          )}
        </motion.button>
      </div>
    </div>
  );
}

function Particles() {
  const particles = Array.from({ length: 12 });

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
      {particles.map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </div>
  );
}

function Particle({ index }: { index: number }) {
  const randomAngle = Math.random() * 360;
  const randomDistance = Math.random() * 100 + 50;

  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 0 }}
      animate={{
        x: Math.cos((randomAngle * Math.PI) / 180) * randomDistance,
        y: Math.sin((randomAngle * Math.PI) / 180) * randomDistance,
        scale: [0, 1, 0],
        opacity: [1, 1, 0],
        rotate: Math.random() * 360,
      }}
      transition={{
        duration: 0.6 + Math.random() * 0.4,
        ease: "easeOut",
      }}
      className={cn(
        "absolute h-2 w-2 rounded-full",
        index % 3 === 0 ? "bg-yellow-400" :
          index % 3 === 1 ? "bg-indigo-500" : "bg-pink-500"
      )}
    />
  );
}
