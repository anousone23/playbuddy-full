import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <main className="flex-1 space-y-8 px-8 md:px-16 py-4">
      <div className="flex items-center justify-center gap-x-4">
        <Skeleton className="flex-1 h-32 rounded-sm" />
        <Skeleton className="flex-1 h-32 rounded-sm" />
      </div>

      <div className="flex items-center justify-center gap-x-4">
        <Skeleton className="flex-1 h-32 rounded-sm" />
        <Skeleton className="flex-1 h-32 rounded-sm" />
      </div>

      <Skeleton className="h-60 w-full rounded-sm" />
    </main>
  );
}
