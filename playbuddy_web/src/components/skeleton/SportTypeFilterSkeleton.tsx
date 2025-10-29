import { Skeleton } from "@/components/ui/skeleton";

export default function SportTypeFilterSkeleton() {
  return (
    <div className="w-[200px] flex flex-col space-y-2">
      <Skeleton className="h-9 rounded-sm" />
    </div>
  );
}
