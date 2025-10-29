import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";

export default function GroupChatDetailsSkeleton() {
  return (
    <TabsContent
      value="details"
      className="text-black text-xs md:text-base py-4"
    >
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col gap-y-4">
          {/* Group Image Skeleton */}
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-slate-300 mx-auto relative">
            <Skeleton className="w-full h-full rounded-full" />
          </div>

          {/* Admin and Members Skeleton */}
          <div className="flex items-center justify-center gap-x-2 relative right-0">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-x-2 absolute right-0">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        {/* Group Details Skeleton */}
        <div className="flex flex-col space-y-4">
          {[..."Name,Description,Sport type,Preferred skill".split(",")].map(
            (_, idx) => (
              <div key={idx} className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            )
          )}

          {/* Update button */}
          <div className="flex items-center justify-center">
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
