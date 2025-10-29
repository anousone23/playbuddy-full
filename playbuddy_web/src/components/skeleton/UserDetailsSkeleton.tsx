import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";

export default function UserDetailsSkeleton() {
  return (
    <TabsContent
      value="details"
      className="text-black text-xs md:text-base py-4"
    >
      <div className="flex flex-col space-y-8">
        {/* Profile image skeleton */}
        <Skeleton className="w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto" />

        {/* Name & Email skeletons */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <Skeleton className="w-20 h-4 md:h-5 " />
            <Skeleton className="h-8 md:h-10 rounded-md" />
          </div>

          <div className="flex flex-col space-y-2">
            <Skeleton className="w-20 h-4 md:h-5" />
            <Skeleton className="h-8 md:h-10 rounded-md" />
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
