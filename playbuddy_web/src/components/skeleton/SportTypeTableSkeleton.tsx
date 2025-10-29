import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export default function SportTypeTableSkeleton() {
  const skeletonRows = Array.from({ length: 10 });

  return (
    <div className="mx-8 md:mx-16">
      <Table>
        <TableHeader className="bg-sky-500">
          <TableRow className="text-xs md:text-base font-poppins-medium">
            <TableHead className="text-white">No</TableHead>
            <TableHead className="text-white">Name</TableHead>
            <TableHead className="text-white text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="text-black text-xs md:text-base">
          {skeletonRows.map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell className="flex items-center justify-evenly">
                <Skeleton className="h-6 w-12 rounded-sm" />
                <Skeleton className="h-6 w-12 rounded-sm" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
