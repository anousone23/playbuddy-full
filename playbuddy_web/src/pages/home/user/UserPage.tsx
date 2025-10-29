import { useState } from "react";
import { Link } from "react-router";

import Header from "@/components/Header";
import PaginationControls from "@/components/PaginationControls";
import UserTableSkeleton from "@/components/skeleton/UserTableSkeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination";
import { useGetAllUsers, useGetReportedUsers } from "@/lib/React Query/user";
import UserTableRow from "@/components/UserTableRow";

export default function UserPage() {
  const [showReportedUsers, setShowReportedUsers] = useState(false);
  const [showSuspendedUsers, setShowSuspendedUsers] = useState(false);
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useGetAllUsers();
  const { data: reportedUsers } = useGetReportedUsers();

  let filteredUsers = users
    ? users?.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  filteredUsers = showReportedUsers
    ? filteredUsers.filter((user) => reportedUsers?.includes(user._id))
    : filteredUsers;

  filteredUsers = showSuspendedUsers
    ? filteredUsers.filter((user) => user.isSuspended)
    : filteredUsers;

  const {
    currentPage,
    totalPages,
    setCurrentPage,
    paginatedData: currentUsers,
  } = usePagination(filteredUsers, 10);

  return (
    <div className="w-full h-screen flex flex-col space-y-6">
      {/* Header search input */}
      <Header>
        <Input
          placeholder="Search user..."
          className="text-xs md:text-base mx-8 md:mx-16 lg:mx-32 xl:mx-64"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </Header>

      {/* Reported users checkbox */}
      <div className="flex items-center">
        <div className="flex items-center space-x-2 px-8 md:px-16">
          <Checkbox
            className="border border-slate-300 bg-slate-100 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500 w-5 h-5 md:w-6 md:h-6"
            checked={showReportedUsers}
            onCheckedChange={() => {
              setCurrentPage(1);
              setShowReportedUsers(!showReportedUsers);
            }}
          />
          <label className="font-poppins-regular text-xs md:text-base">
            Show reported users
          </label>
        </div>

        <div className="flex items-center space-x-2 px-8 md:px-16">
          <Checkbox
            className="border border-slate-300 bg-slate-100 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500 w-5 h-5 md:w-6 md:h-6"
            checked={showSuspendedUsers}
            onCheckedChange={() => {
              setCurrentPage(1);
              setShowSuspendedUsers(!showSuspendedUsers);
            }}
          />
          <label className="font-poppins-regular text-xs md:text-base">
            Show suspended users
          </label>
        </div>
      </div>

      <Skeleton className="mx-8 md:mx-16"></Skeleton>

      {/* Table */}
      {isLoading ? (
        <UserTableSkeleton />
      ) : (
        <div className="mx-8 md:mx-16">
          <Table>
            <TableHeader className="bg-zinc-100">
              <TableRow className="text-xs md:text-base font-poppins-medium">
                <TableHead className="text-black">No</TableHead>
                <TableHead className="text-black">Name</TableHead>
                <TableHead className="text-black">Email</TableHead>
                <TableHead className="text-black">Joined group chats</TableHead>
                <TableHead className="text-black">Number of friends</TableHead>
                <TableHead className="text-black">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-black text-xs md:text-base">
              {currentUsers.map((user, index) => (
                <UserTableRow
                  key={user._id}
                  user={user}
                  index={index}
                  currentPage={currentPage}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
