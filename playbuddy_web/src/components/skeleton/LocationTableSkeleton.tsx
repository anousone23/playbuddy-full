import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function LocationTableSkeleton() {
  return (
    <div className="mx-8 md:mx-16">
      <Table>
        <TableHeader className="bg-sky-500">
          <TableRow className="text-xs md:text-base font-poppins-medium">
            <TableHead className="text-white">No</TableHead>
            <TableHead className="text-white">Name</TableHead>
            <TableHead className="text-white">Sport type</TableHead>
            <TableHead className="text-white text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="text-black text-xs md:text-base">
          {[...Array(10)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-6" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="flex items-center justify-evenly">
                <Skeleton className="h-6 w-16 rounded-sm" />
                <Skeleton className="h-6 w-16 rounded-sm" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
