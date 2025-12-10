"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = "Select an option",
      disabled = false,
      className,
      size = "md",
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const sizeClasses = {
      sm: "px-2.5 py-1.5 text-xs",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-2.5 text-base",
    };

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
        if (!isOpen) {
          const currentIndex = options.findIndex((opt) => opt.value === value);
          setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
        }
      }
    };

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue);
      setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            handleSelect(options[highlightedIndex].value);
          } else {
            setIsOpen(true);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) =>
              prev < options.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : options.length - 1
            );
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    };

    // Close on outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Scroll highlighted item into view
    React.useEffect(() => {
      if (isOpen && listRef.current && highlightedIndex >= 0) {
        const highlightedItem = listRef.current.children[highlightedIndex] as HTMLElement;
        if (highlightedItem) {
          highlightedItem.scrollIntoView({ block: "nearest" });
        }
      }
    }, [highlightedIndex, isOpen]);

    return (
      <div
        ref={containerRef}
        className={cn("relative inline-block", className)}
      >
        {/* Trigger Button */}
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "relative w-full flex items-center justify-between gap-2",
            "bg-white border-2 border-gray-200 rounded-lg",
            "transition-all duration-200 ease-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
            "hover:border-gray-300",
            isOpen && "border-primary ring-2 ring-primary/20",
            disabled && "opacity-50 cursor-not-allowed bg-gray-50",
            sizeClasses[size]
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span
            className={cn(
              "truncate",
              !selectedOption && "text-gray-400"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ease-out",
              isOpen && "rotate-180 text-primary"
            )}
          />
        </button>

        {/* Dropdown */}
        <div
          className={cn(
            "absolute z-50 w-full mt-1.5",
            "transition-all duration-200 ease-out origin-top",
            isOpen
              ? "opacity-100 scale-100 translate-y-0 visible"
              : "opacity-0 scale-95 -translate-y-2 invisible"
          )}
        >
          <ul
            ref={listRef}
            role="listbox"
            className={cn(
              "bg-white border border-gray-200 rounded-lg shadow-lg",
              "max-h-60 overflow-auto",
              "py-1"
            )}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "relative flex items-center justify-between gap-2 cursor-pointer",
                  "px-3 py-2 text-sm",
                  "transition-colors duration-150",
                  option.value === value
                    ? "text-primary font-medium"
                    : "text-gray-700",
                  highlightedIndex === index && "bg-gray-50",
                  option.value === value && highlightedIndex === index && "bg-primary/5"
                )}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
