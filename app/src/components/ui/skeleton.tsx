import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%]",
        className
      )}
      {...props}
    />
  );
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-r1 border border-gray-100 bg-white p-4">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="mt-4 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3 mt-2" />
      </div>
    </div>
  );
}

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="rounded-r1 border border-gray-100 bg-white overflow-hidden">
      <Skeleton className="aspect-4/3 w-full" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

function BannerSkeleton() {
  return (
    <Skeleton className="w-full h-[400px] md:h-[500px] rounded-r1" />
  );
}

export { 
  Skeleton, 
  ProductCardSkeleton, 
  ProductGridSkeleton, 
  CategoryCardSkeleton,
  BannerSkeleton 
};
