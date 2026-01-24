"use client";

import * as React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "default" | "lg";
  className?: string;
  variant?: "default" | "primary";
  isLoading?: boolean;
}

const sizeClasses = {
  sm: "h-8 px-1",
  default: "h-11 px-2",
  lg: "h-14 px-3",
};

const buttonSizeClasses = {
  sm: "p-1",
  default: "p-2",
  lg: "p-3",
};

const iconSizeClasses = {
  sm: "w-3 h-3",
  default: "w-4 h-4",
  lg: "w-5 h-5",
};

const inputSizeClasses = {
  sm: "w-6 text-xs",
  default: "w-10 text-sm",
  lg: "w-12 text-base",
};

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "default",
  className,
  variant = "default",
  isLoading = false,
}: QuantitySelectorProps) {
  const [direction, setDirection] = React.useState(0);
  const [key, setKey] = React.useState(0);

  const handleDecrease = () => {
    if (value > min) {
      setDirection(-1);
      setKey(prev => prev + 1);
      onChange(value - 1);
    } else if (value === 1) {
        onChange(0);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      setDirection(1);
      setKey(prev => prev + 1);
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      setDirection(newValue > value ? 1 : -1);
      setKey(prev => prev + 1);
      onChange(newValue);
    }
  };

  const isPrimary = variant === "primary";

  return (
    <div className={cn(
      "flex items-center rounded-full w-fit transition-colors",
      sizeClasses[size],
      isPrimary ? "bg-primary text-white border-transparent" : "border border-gray-200 bg-white",
      className
    )}>
      <motion.button
        type="button"
        onClick={handleDecrease}
        disabled={(value < min && value !== 1) || isLoading}
        className={cn(
          "transition-colors rounded-full relative z-10",
          buttonSizeClasses[size],
          isPrimary 
            ? "text-white hover:bg-white/20" 
            : "text-third hover:text-primary hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        whileTap={{ scale: 0.9 }}
        aria-label="Decrease quantity"
      >
        {value === 1 ? (
           <Trash2 className={iconSizeClasses[size]} />
        ) : (
           <Minus className={iconSizeClasses[size]} />
        )}
      </motion.button>
      
      <div className={cn(
        "relative h-full overflow-hidden text-center font-medium flex items-center justify-center",
        inputSizeClasses[size],
        isPrimary ? "text-white" : "text-primary"
      )}>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-0.5 h-full absolute inset-0"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className={cn("rounded-full bg-current", size === "sm" ? "w-0.5 h-0.5" : "w-1 h-1")}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.span
              key={key}
              custom={direction}
              initial={{ y: direction > 0 ? 20 : -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: direction > 0 ? -20 : 20, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30,
                mass: 0.8
              }}
              className={cn("block", isPrimary ? "text-white" : "text-primary")}
            >
              {value}
            </motion.span>
          )}
        </AnimatePresence>
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
          min={min}
          max={max}
          disabled={isLoading}
        />
      </div>
      
      <motion.button
        type="button"
        onClick={handleIncrease}
        disabled={value >= max || isLoading}
        className={cn(
          "transition-colors rounded-full relative z-10",
          buttonSizeClasses[size],
          isPrimary 
            ? "text-white hover:bg-white/20" 
            : "text-third hover:text-primary hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        whileTap={{ scale: 0.9 }}
        aria-label="Increase quantity"
      >
        <Plus className={iconSizeClasses[size]} />
      </motion.button>
    </div>
  );
}
