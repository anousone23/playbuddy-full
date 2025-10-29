import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function LocationDetailsSkeleton() {
  return (
    <main>
      {/* Image Carousel Skeleton */}
      <Carousel className="w-full max-w-xs mx-auto">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <Skeleton className="w-60 h-36 md:w-76 md:h-44 mx-auto rounded-sm" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Form Skeleton */}
      <div className="mx-8 md:mx-16 space-y-8 mt-8">
        {/* Name */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>

        {/* Coordinates */}
        <div className="flex items-end justify-between space-x-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>
          <Skeleton className="h-10 w-10 rounded-sm" />
        </div>

        {/* Sport Types Popover */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
          <div className="flex flex-wrap gap-x-4 gap-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-20 rounded-sm" />
            ))}
          </div>
        </div>

        {/* Update Button */}
        <div className="flex items-center justify-center mb-8">
          <Skeleton className="h-10 w-24 rounded-sm" />
        </div>
      </div>

      {/* Edit/Cancel Button */}
      <div className="absolute top-26 right-8">
        <Skeleton className="h-8 w-20 rounded-sm" />
      </div>
    </main>
  );
}
