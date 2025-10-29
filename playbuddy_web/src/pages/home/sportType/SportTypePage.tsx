import { useState } from "react";
import Modal from "react-modal";

import Header from "@/components/Header";
import PaginationControls from "@/components/PaginationControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination";
import { Plus } from "lucide-react";
import {
  useCreateSportType,
  useDeleteSportType,
  useGetAllSportTypes,
  useUpdateSportType,
} from "@/lib/React Query/sportType";
import { caseFirstLetterToUpperCase } from "@/utils/helper";
import SportTypeTableSkeleton from "@/components/skeleton/SportTypeTableSkeleton";
import CustomModal from "@/components/CustomModal";

const customStyles = {
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

export default function SportTypePage() {
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [edittedValue, setEdittedValue] = useState("");

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSportTypeId, setSelectedSportTypeId] = useState<string | null>(
    null
  );

  const [addSportTypeModal, setAddSportTypeModal] = useState(false);
  const [newSportTypeName, setNewSportTypeName] = useState("");

  const { data: sportTypes, isLoading: isGettingSportTypes } =
    useGetAllSportTypes();

  const { mutateAsync: createSportType, isPending: isCreatingSportType } =
    useCreateSportType();
  const { mutateAsync: updateSportType, isPending: isUpdatingSportType } =
    useUpdateSportType();
  const { mutateAsync: deleteSportType, isPending: isDeletingSportType } =
    useDeleteSportType();

  const filteredSportTypes =
    sportTypes
      ?.filter((sportType) => sportType.name !== "all")
      .filter((sportType) =>
        sportType.name.toLowerCase().includes(search.toLowerCase())
      ) || [];

  const {
    currentPage,
    totalPages,
    setCurrentPage,
    paginatedData: currentSportTypes,
  } = usePagination(filteredSportTypes, 10);

  async function handleCreateSportType() {
    if (!newSportTypeName) return;

    await createSportType(
      { name: newSportTypeName.toLowerCase() },
      {
        onSuccess: () => {
          setAddSportTypeModal(false);
          setNewSportTypeName("");
        },
      }
    );
  }

  async function handleUpdateSportType() {
    if (!edittedValue || !selectedSportTypeId) return;

    await updateSportType(
      { name: edittedValue, sportTypeId: selectedSportTypeId },
      {
        onSuccess: () => {
          setEditModal(false);
          setEdittedValue("");
          setSelectedSportTypeId(null);
        },
      }
    );
  }

  async function handleDeleteSportType() {
    if (!selectedSportTypeId) return;

    await deleteSportType(
      { sportTypeId: selectedSportTypeId },
      {
        onSuccess: () => {
          setDeleteModal(false);
          setSelectedSportTypeId(null);
        },
      }
    );
  }

  return (
    <div className="w-full h-screen flex flex-col space-y-6">
      {/* Header search input */}
      <Header>
        <Input
          placeholder="Search sport type..."
          className="text-xs md:text-base mx-8 md:mx-16 lg:mx-32 xl:mx-64"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </Header>

      {/* Reported users checkbox */}
      {/* filter by status */}
      <div className="px-8 md:px-16 flex items-center">
        <Button
          className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 text-xs md:text-base text-white"
          onClick={() => setAddSportTypeModal(true)}
        >
          <Plus className="text-white" />
          Add new sport type
        </Button>
      </div>

      {/* Table */}
      {isGettingSportTypes ? (
        <SportTypeTableSkeleton />
      ) : (
        <div className="mx-8 md:mx-16">
          <Table>
            <TableHeader className="bg-zinc-100">
              <TableRow className="text-xs md:text-base font-poppins-medium">
                <TableHead className="text-black">No</TableHead>
                <TableHead className="text-black">Name</TableHead>
                <TableHead className="text-black text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-black text-xs md:text-base">
              {currentSportTypes.map((sportType, index) => (
                <TableRow key={sportType._id}>
                  <TableCell>{(currentPage - 1) * 10 + index + 1}</TableCell>
                  <TableCell>
                    {caseFirstLetterToUpperCase(sportType.name)}
                  </TableCell>

                  <TableCell className=" flex items-center justify-evenly">
                    <button
                      className="bg-slate-100 border border-slate-300 text-black text-xs px-4 rounded-sm hover:bg-slate-200 transition-all duration-300 md:text-base"
                      onClick={() => {
                        setSelectedSportTypeId(sportType._id);
                        setEditModal(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="bg-red-500 text-white text-xs px-3 rounded-sm hover:bg-red-600 transition-all duration-300 md:text-base"
                      onClick={() => {
                        setSelectedSportTypeId(sportType._id);
                        setDeleteModal(true);
                      }}
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* edit modal */}
      <Modal
        style={customStyles}
        isOpen={editModal}
        onRequestClose={() => {
          if (isUpdatingSportType) return;

          setEditModal(false);
          setEdittedValue("");
          setSelectedSportTypeId(null);
        }}
        appElement={document.getElementById("root")!}
      >
        <div className="flex flex-col gap-y-8 px-8 py-4 w-96">
          <div className="flex flex-col gap-y-2">
            <Label className="text-xs md:text-base font-poppins-medium text-black">
              Name
            </Label>

            <Input
              placeholder="Enter a sport type"
              className="text-xs md:text-base font-poppins-regular text-black"
              value={edittedValue}
              onChange={(e) => setEdittedValue(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              className="text-xs md:text-base font-poppins-regular text-white bg-sky-500 hover:bg-sky-600 px-6 disabled:bg-slate-300"
              disabled={isUpdatingSportType}
              onClick={handleUpdateSportType}
            >
              Update
            </Button>

            <Button
              className="text-xs md:text-base font-poppins-regular text-black bg-slate-100 hover:bg-slate-200 border border-slate-300 px-6"
              onClick={() => {
                if (isUpdatingSportType) return;

                setEditModal(false);
                setEdittedValue("");
                setSelectedSportTypeId(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* delete modal */}
      <CustomModal
        modal={deleteModal}
        setModal={setDeleteModal}
        handler={handleDeleteSportType}
        isPending={isDeletingSportType}
        confirmText="Delete"
        title="Confirm delete sport type"
        description="This will permenantly delete this sport type"
        variant="destructive"
      />

      {/* add new sport type modal */}
      <Modal
        style={customStyles}
        isOpen={addSportTypeModal}
        onRequestClose={() => {
          if (isCreatingSportType) return;

          setAddSportTypeModal(false);
          setNewSportTypeName("");
        }}
        appElement={document.getElementById("root")!}
      >
        <div className="flex flex-col gap-y-8 px-8 py-4 w-80">
          <div className="flex flex-col gap-y-2">
            <Label className="text-xs md:text-base font-poppins-medium text-black">
              Name
            </Label>

            <Input
              placeholder="Enter a sport type"
              className="text-xs md:text-base font-poppins-medium text-black"
              value={newSportTypeName}
              onChange={(e) => setNewSportTypeName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              className="text-xs md:text-base font-poppins-medium text-white bg-sky-500 hover:bg-sky-600 px-6 disabled:bg-slate-300"
              disabled={isCreatingSportType}
              onClick={handleCreateSportType}
            >
              Create
            </Button>

            <Button
              className="text-xs md:text-base font-poppins-medium text-black bg-slate-100 hover:bg-slate-200 border border-slate-300 px-6"
              onClick={() => {
                if (isCreatingSportType) return;

                setAddSportTypeModal(false);
                setNewSportTypeName("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Pagination controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
