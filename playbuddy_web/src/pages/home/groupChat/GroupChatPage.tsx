import { useState } from "react";

import Header from "@/components/Header";
import PaginationControls from "@/components/PaginationControls";
import GroupChatTableSkeleton from "@/components/skeleton/GroupChatTableSkeleton";
import SportTypeFilterSkeleton from "@/components/skeleton/SportTypeFilterSkeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination";
import {
  useGetAllGroupChats,
  useGetReportedGroupChats,
} from "@/lib/React Query/groupChat";
import { useGetAllLocations } from "@/lib/React Query/location";
import { useGetAllSportTypes } from "@/lib/React Query/sportType";
import { caseFirstLetterToUpperCase } from "@/utils/helper";
import { Link } from "react-router";

export default function GroupChatPage() {
  const [showReportedGroupChats, setShowReportedGroupChats] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSportTypeName, setSelectedSportTypeName] = useState<
    string | null
  >(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );

  const { data: groupChats, isLoading: isGettingGroupChats } =
    useGetAllGroupChats();
  const { data: sportTypes, isLoading: isGettingSportTypes } =
    useGetAllSportTypes();
  const { data: locations, isLoading: isGettingLocations } =
    useGetAllLocations();
  const { data: reportedGroupChatIds } = useGetReportedGroupChats();

  // add all to location filter
  const filteredGroupChatLocations = locations
    ? [{ _id: "1", name: "All" }, ...locations]
    : [];

  // filter groupchat
  let filteredGroupChats =
    groupChats?.filter((groupChat) =>
      groupChat.name.toLowerCase().includes(search.toLowerCase())
    ) || []; // by search

  filteredGroupChats = selectedSportTypeName
    ? selectedSportTypeName === "all"
      ? filteredGroupChats
      : filteredGroupChats?.filter((groupChat) =>
          groupChat.sportType.name.includes(selectedSportTypeName)
        )
    : filteredGroupChats; // by sport type

  filteredGroupChats = selectedLocationId
    ? selectedLocationId === "1"
      ? filteredGroupChats
      : filteredGroupChats?.filter((groupChat) =>
          groupChat.locationId._id.includes(selectedLocationId)
        )
    : filteredGroupChats; // by location

  filteredGroupChats = showReportedGroupChats
    ? filteredGroupChats.filter((groupChat) =>
        reportedGroupChatIds?.includes(groupChat._id)
      )
    : filteredGroupChats;

  const {
    currentPage,
    totalPages,
    setCurrentPage,
    paginatedData: currentGroupChats,
  } = usePagination(filteredGroupChats, 10);

  function handleSportTypeChange(string: string) {
    setSelectedSportTypeName(string);
  }

  function handleLocationChange(id: string) {
    setSelectedLocationId(id);
  }

  return (
    <div className="w-full h-screen flex flex-col space-y-6">
      {/* Header search input */}
      <Header>
        <Input
          placeholder="Search group chats..."
          className="text-xs md:text-base mx-8 md:mx-16 lg:mx-32 xl:mx-64"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </Header>

      <div className="px-8 md:px-16 flex flex-col gap-y-4">
        {/* Reported users checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            className="border border-slate-300 bg-slate-100 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500 w-5 h-5 md:w-6 md:h-6"
            checked={showReportedGroupChats}
            onCheckedChange={() => {
              setCurrentPage(1);
              setShowReportedGroupChats(!showReportedGroupChats);
            }}
          />
          <label className="font-poppins-regular text-xs md:text-sm">
            Show reported group chats
          </label>
        </div>

        {/* location & sport type filter */}
        <div className="flex items-center gap-x-4">
          {/* sport type filter */}
          {isGettingSportTypes ? (
            <SportTypeFilterSkeleton />
          ) : (
            <Select onValueChange={handleSportTypeChange}>
              <SelectTrigger className="w-[200px] text-xs md:text-base">
                <SelectValue
                  placeholder="Filter by sport type"
                  className="text-xs"
                />
              </SelectTrigger>

              <SelectContent>
                {sportTypes?.map((sportType) => (
                  <SelectItem
                    value={sportType.name}
                    className="text-black text-xs md:text-base"
                    key={sportType._id}
                  >
                    {caseFirstLetterToUpperCase(sportType.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* location filter */}
          {isGettingLocations ? (
            <SportTypeFilterSkeleton />
          ) : (
            <Select onValueChange={handleLocationChange}>
              <SelectTrigger className="w-[200px] text-xs md:text-base">
                <SelectValue
                  placeholder="Filter by location"
                  className="text-xs"
                />
              </SelectTrigger>

              <SelectContent>
                {filteredGroupChatLocations?.map((location) => (
                  <SelectItem
                    value={location._id}
                    className="text-black text-xs md:text-base"
                    key={location._id}
                  >
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Table */}
      {isGettingGroupChats ? (
        <GroupChatTableSkeleton />
      ) : (
        <div className="mx-8 md:mx-16">
          <Table>
            <TableHeader className="bg-zinc-100">
              <TableRow className="text-xs md:text-base font-poppins-medium">
                <TableHead className="text-black">No</TableHead>
                <TableHead className="text-black">Name</TableHead>
                <TableHead className="text-black">Location</TableHead>
                <TableHead className="text-black">Sport type</TableHead>
                <TableHead className="text-black">Admin</TableHead>
                <TableHead className="text-black">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-black text-xs md:text-sm">
              {currentGroupChats.map((groupChat, index) => (
                <TableRow key={groupChat._id}>
                  <TableCell>{(currentPage - 1) * 10 + index + 1}</TableCell>
                  <TableCell>{groupChat.name}</TableCell>
                  <TableCell>{groupChat.locationId.name}</TableCell>
                  <TableCell>
                    {caseFirstLetterToUpperCase(groupChat.sportType.name)}
                  </TableCell>
                  <TableCell>{groupChat.admin.name}</TableCell>
                  <TableCell>
                    <Link
                      to={`/groupChats/${groupChat._id}`}
                      className="bg-sky-500 text-white text-xs px-3 py-1 rounded-sm hover:bg-sky-600 transition-all duration-300 md:text-sm"
                    >
                      Details
                    </Link>
                  </TableCell>
                </TableRow>
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
