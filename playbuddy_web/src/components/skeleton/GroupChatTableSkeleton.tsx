import { Skeleton } from "@/components/ui/skeleton";

export default function GroupChatTableSkeleton() {
  return (
    <div className="mx-8 md:mx-16">
      <div className="border rounded-md overflow-hidden">
        <div className="bg-sky-500 px-4 py-3">
          <div className="grid grid-cols-6 gap-4 text-xs md:text-base font-poppins-medium text-white">
            <div>No</div>
            <div>Name</div>
            <div>Location</div>
            <div>Sport type</div>
            <div>Admin</div>
            <div>Actions</div>
          </div>
        </div>
        <div className="space-y-2 px-4 py-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-6 gap-4 items-center text-xs md:text-sm"
            >
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-20 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
