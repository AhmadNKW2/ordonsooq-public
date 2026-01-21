"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  variant?: "desktop" | "mobile";
  isOpen?: boolean;
}

export function SearchBar({ className, variant = "desktop", isOpen = true }: SearchBarProps) {
  const t = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  if (variant === "mobile") {
    return (
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          isOpen ? "max-h-20 py-3" : "max-h-0"
        )}
      >
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 rounded-full"
            icon={Search}
          />
        </form>
      </div>
    );
  }

  return (
    <form 
      onSubmit={handleSearch}
      className={cn("flex items-center flex-1 max-w-md mx-2 md:mx-6", className)}
    >
      <div className="relative w-full">
        <Input
          type="search"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-12 rounded-full bg-gray-50 border-gray-200 focus:bg-white"
          icon={Search}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
        >
          <Search size={16} />
        </button>
      </div>
    </form>
  );
}
