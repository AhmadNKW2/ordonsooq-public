import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function PageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar Skeleton (e.g. Order Summary) */}
      <div className="lg:col-span-1 order-1 lg:order-2 space-y-5">
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-6" />
          
          <div className="space-y-4 mb-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-16 h-16 rounded-md shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-100">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          <Skeleton className="w-full h-12 rounded-lg mt-6" />
        </Card>
      </div>

      {/* Main Content Skeleton */}
      <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
        {/* Top Bar / Steps Skeleton */}
        <div className="hidden sm:flex items-center justify-between mb-8 pb-2">
           <Skeleton className="w-32 h-8" />
           <Skeleton className="w-32 h-8" />
           <Skeleton className="w-32 h-8" />
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
             <Skeleton className="w-5 h-5 rounded-full" />
             <Skeleton className="w-40 h-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
             
             <div className="md:col-span-2 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
