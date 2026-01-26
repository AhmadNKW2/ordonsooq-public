import { cn } from "@/lib/utils";
import Image from "next/image";
import * as React from "react";

interface EntityHeaderProps {
  title: string;
  image?: string | null;
  fallbackTitle?: string;
  description?: string | null;
  children?: React.ReactNode;
  className?: string;
}

export function EntityHeader({
  title,
  image,
  fallbackTitle,
  description,
  children,
  className,
}: EntityHeaderProps) {
  const fallbackChar = (fallbackTitle || title || "?")[0];

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-6 md:p-8 border border-gray-100 flex flex-col md:flex-row gap-8",
        className
      )}
    >
      <div className="relative w-32 h-32 md:w-48 md:h-48 shrink-0 border border-secondary/75 shadow-md rounded-xl overflow-hidden flex items-center justify-center bg-white mx-auto md:mx-0">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain "
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <span className="text-4xl uppercase font-bold">{fallbackChar}</span>
          </div>
        )}
      </div>
      
      <div className="flex-grow flex flex-col text-center md:text-start">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
          {title}
        </h1>

        {children}

        {description && (
          <div className={cn("text-gray-600", children && "mt-4 pt-4 border-t border-gray-100")}>
            <p>{description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
