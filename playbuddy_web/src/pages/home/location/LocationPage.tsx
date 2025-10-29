import { useState } from "react";
import Modal from "react-modal";

import Header from "@/components/Header";
import PaginationControls from "@/components/PaginationControls";
import LocationTableSkeleton from "@/components/skeleton/LocationTableSkeleton";
import SportTypeFilterSkeleton from "@/components/skeleton/SportTypeFilterSkeleton";
import { Button } from "@/components/ui/button";
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
  useDeleteLocation,
  useGetAllLocations,
} from "@/lib/React Query/location";
import { useGetAllSportTypes } from "@/lib/React Query/sportType";
import { caseFirstLetterToUpperCase } from "@/utils/helper";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import CustomModal from "@/components/CustomModal";

const modalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    borderRadius: 6,
  },
};

export default function LocationPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSportType, setSelectedSportType] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  const [expandedIds, setExpandedIds] = useState(new Set());

  const { data: locations, isLoading } = useGetAllLocations();
  const { data: sportTypes, isLoading: isGettingSportTypes } =
    useGetAllSportTypes();

  const { mutateAsync: deleteLocation, isPending: isDeleteingLocation } =
    useDeleteLocation();

  let filteredLocations = locations?.filter((location) =>
    location.name.toLowerCase().includes(search.toLowerCase())
  );

  filteredLocations = selectedSportType
    ? selectedSportType === "all"
      ? filteredLocations
      : filteredLocations?.filter((location) =>
          location.sportTypes.some(
            (sportType) => sportType.name === selectedSportType
          )
        )
    : filteredLocations;

  const {
    currentPage,
    totalPages,
    setCurrentPage,
    paginatedData: currentLocations,
  } = usePagination(filteredLocations || [], 5);

  function handleSportTypeChange(value: string) {
    setSelectedSportType(value);
  }

  async function handleDeleteLocation() {
    if (!selectedLocationId) return;

    await deleteLocation(
      { locationId: selectedLocationId },
      {
        onSuccess: () => {
          setDeleteModal(false);
          setSelectedLocationId(null);
        },
      }
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full h-screen flex flex-col space-y-6">
      {/* Header search input */}
      <Header>
        <Input
          placeholder="Search location..."
          className="text-xs md:text-base mx-8 md:mx-16 lg:mx-32 xl:mx-64"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </Header>

      <main className="flex flex-col gap-y-4 overflow-auto">
        <div className="px-8 md:px-16 flex items-center justify-between">
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

          <Button
            className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 text-xs md:text-base text-white"
            onClick={() => navigate("/locations/create")}
          >
            <Plus className="text-white" />
            Add new location
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <LocationTableSkeleton />
        ) : (
          <div className="mx-8 md:mx-16">
            <Table>
              <TableHeader className="bg-zinc-100">
                <TableRow className="text-xs md:text-base font-poppins-medium">
                  <TableHead className="text-black">No</TableHead>
                  <TableHead className="text-black">Image</TableHead>
                  <TableHead className="text-black">Name</TableHead>
                  <TableHead className="text-black">Sport type</TableHead>
                  <TableHead className="text-black  text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="text-black text-xs md:text-base">
                {currentLocations.map((location, index) => (
                  <TableRow key={location._id}>
                    <TableCell>{(currentPage - 1) * 10 + index + 1}</TableCell>
                    <TableCell>
                      <img
                        src={location.images.at(0)}
                        alt="location images"
                        className="w-20 h-12 rounded-sm md:w-28 md:h-16 bg-slate-200"
                      />
                    </TableCell>
                    <TableCell>
                      <p>{location.name}</p>
                      <p
                        className={`text-sm opacity-80 text-ellipsis max-w-[480px] overflow-hidden cursor-pointer ${
                          expandedIds.has(location._id) && "whitespace-normal"
                        }`}
                        onClick={() => toggleExpand(location._id)}
                      >
                        {location.description}
                      </p>
                    </TableCell>
                    <TableCell className="space-y-2">
                      {location.sportTypes.map((sportType) => (
                        <div
                          key={sportType._id}
                          className="border rounded-sm flex items-center justify-start pl-2 bg-zinc-50 text-sm"
                        >
                          {caseFirstLetterToUpperCase(sportType.name)}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="">
                      <div className="flex items-center justify-evenly gap-x-2">
                        <button
                          className="bg-sky-500 text-white text-xs px-3  rounded-sm hover:bg-sky-600 transition-all duration-300 md:text-base"
                          onClick={() => {
                            navigate(`/locations/${location._id}`);
                          }}
                        >
                          Details
                        </button>

                        <button
                          className="bg-red-500 text-white text-xs px-3  rounded-sm hover:bg-red-600 transition-all duration-300 md:text-base"
                          onClick={() => {
                            setSelectedLocationId(location._id);
                            setDeleteModal(true);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination controls */}
        <div className="md:mb-8">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {/* delete modal */}
        <CustomModal
          modal={deleteModal}
          setModal={setDeleteModal}
          handler={handleDeleteLocation}
          isPending={isDeleteingLocation}
          variant="destructive"
          title="Confirm delete location"
          description="This will permenantly delete this location"
        />
      </main>
    </div>
  );
}
