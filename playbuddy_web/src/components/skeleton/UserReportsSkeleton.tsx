import { TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportTabSkeleton() {
  return (
    <TabsContent
      value="reports"
      className="text-black text-xs md:text-base py-4"
    >
      <div className="flex flex-col space-y-4">
        {/* Select Filter Skeleton */}
        <Skeleton className="w-[180px] h-10" />

        <div className="flex flex-col space-y-4">
          <Skeleton className="w-32 h-4" />

          <div className="max-h-[30rem] overflow-auto flex flex-col space-y-4">
            {/* Skeleton Report Items */}
            {[...Array(2)].map((_, index) => (
              <div
                key={index}
                className="border border-slate-300 rounded-sm px-4 py-4 shadow flex flex-col space-y-4"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="w-2/3 h-4" />
                  <Skeleton className="w-20 h-4" />
                </div>

                {index === 1 ? (
                  <div className="flex justify-between">
                    <Skeleton className="w-40 h-28 rounded-sm" />
                    <Skeleton className="w-28 h-8" />
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Skeleton className="w-28 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
