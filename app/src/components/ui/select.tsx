"use client";

import * as React from "react";
import { ChevronDown, Check, type LucideIcon } from "lucide-react";
import { cn, INPUT_STYLES } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  type?: 'item' | 'divider';
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "header";
  icon?: LucideIcon;
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
      variant = "default",
      icon: Icon = ChevronDown,
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
      md: INPUT_STYLES.padding, // Use standard padding for md
      lg: "px-4 py-2.5 text-base",
    };

    const variantClasses = {
      default: cn(
        INPUT_STYLES.base,
        // Override rounded if needed, but keeping consistent
        // Remove specific border/bg because they are in base
        "h-11", // Match Input height
        "flex items-center justify-between", // specific to Select layout
        INPUT_STYLES.default,
        isOpen && "border-primary ring-2 ring-primary/20"
      ),
      header: cn(
        "bg-transparent border border-transparent text-white",
        "hover:bg-white/10",
        isOpen && "text-gray-900 ring-2 ring-primary/20"
      ),
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
        className={cn("relative inline-block w-full", className)}
      >
        {/* Trigger Button */}
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            // Structure
            "relative w-full flex items-center justify-between gap-2",
            // Styles
            variantClasses[variant],
            sizeClasses[size],
             // Explicitly handle text color for header variant vs default if not covered by variantClasses
             variant === 'default' ? "text-primary" : "text-white"
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : <span className="text-gray-400">{placeholder}</span>}
          </span>
          <Icon
            className={cn(
              "w-5 h-5 shrink-0 transition-transform duration-300 ease-out",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        <div
          className={cn(
            "absolute z-50 mt-1.5",
            variant === 'header' ? "w-50 end-0" : "w-full min-w-[var(--radix-select-trigger-width)]",
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
              "bg-white rounded-lg shadow-lg",
              "max-h-80 overflow-auto",
              "py-2"
            )}
          >
            {options.map((option, index) => {
              if (option.type === 'divider') {
                return (
                  <li
                    key={`divider-${index}`}
                    className="h-px bg-gray-200 my-2 mx-2"
                    role="separator"
                  />
                );
              }

              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "relative flex items-center justify-between gap-3 cursor-pointer",
                    "px-5 py-2 my-1 text-sm",
                    "transition-colors",
                    option.value === value
                      ? "text-primary font-medium"
                      : "text-primary",
                    highlightedIndex === index && "bg-secondary text-white",
                    option.value === value && highlightedIndex === index && "bg-secondary/50"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 truncate">
                    {option.icon && (
                      <option.icon className={cn("w-5 h-5 shrink-0 transition-colors", option.value === value ? "text-primary" : "text-primary", highlightedIndex === index && "text-white")} />
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
