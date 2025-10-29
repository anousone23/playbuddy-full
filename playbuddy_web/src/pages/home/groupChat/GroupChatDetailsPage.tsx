import imageCompression from "browser-image-compression";
import { useEffect, useRef, useState } from "react";

import CustomModal from "@/components/CustomModal";
import Header from "@/components/Header";
import GroupChatDetailsSkeleton from "@/components/skeleton/GroupChatDetailsSkeleton";
import GroupChatReportItem from "@/components/skeleton/GroupChatReportItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CLOUDINARY_GROUP_CHAT_IMAGE_FOLDER } from "@/constants";
import images from "@/constants/images";
import { useUploadImage } from "@/lib/React Query/cloudinary";
import {
  useDeleteGroupChat,
  useGetAllGroupChatReports,
  useGetGroupChatById,
  useUpdateGroupChat,
} from "@/lib/React Query/groupChat";
import { IReport } from "@/types";
import { caseFirstLetterToUpperCase } from "@/utils/helper";
import { Options } from "browser-image-compression";
import { Camera, Pencil, Users } from "lucide-react";
import { useParams } from "react-router";

export default function GroupChatDetailsPage() {
  const { groupChatId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [edit, setEdit] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [status, setStatus] = useState("all");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: groupChat, isLoading: isGettingGroupChat } =
    useGetGroupChatById({ groupChatId: groupChatId as string });
  const { data: reports } = useGetAllGroupChatReports({
    groupChatId: groupChatId as string,
  });
  const { mutateAsync: updateGroupChat, isPending: isUpdating } =
    useUpdateGroupChat();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();
  const { mutateAsync: deleteGroupChat, isPending: isDeleting } =
    useDeleteGroupChat();

  const [form, setForm] = useState({ name: "", image: "" });

  useEffect(() => {
    if (groupChat) {
      setForm({
        name: groupChat.name,
        image: groupChat.image,
      });
    }
  }, [groupChat]);

  let filteredReports: IReport[] = [];

  if (reports && status === "pending") {
    filteredReports = reports?.filter((report) => !report.isAcknowledged);
  } else if (reports && status === "acknowledged") {
    filteredReports = reports?.filter((report) => report.isAcknowledged);
  } else {
    filteredReports = reports || [];
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;

    if (!files) return;

    // compress file
    const options: Options = {
      maxSizeMB: 1,
      useWebWorker: true,
      fileType: "image/jpeg",
    };

    const compressedFile = await imageCompression(files[0], options);

    const previewImage = URL.createObjectURL(compressedFile);
    setForm((prev) => ({ ...prev, image: previewImage }));
    setImageFile(compressedFile);
  }

  async function handleUpdateGroupChat() {
    let imageUrl = groupChat?.image;

    // Only upload if the image was changed
    if (imageFile) {
      imageUrl = await uploadImage({
        file: imageFile,
        folder: CLOUDINARY_GROUP_CHAT_IMAGE_FOLDER,
      });
    }

    const payload = {
      name: form.name,
      image: imageUrl,
    };

    await updateGroupChat(
      {
        groupChatId: groupChatId as string,
        data: payload,
      },
      {
        onSuccess: () => {
          setEdit(false);
          setImageFile(null);
        },
      }
    );
  }

  async function handleDeleteGroupChat() {
    await deleteGroupChat({ groupChatId: groupChatId as string });
  }

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col space-y-6">
      <Header>
        <div className="flex items-center gap-x-2">
          <p className="text-xs md:text-base text-black font-poppins-medium">
            {groupChat?.name}
          </p>
          <p className="text-xs md:text-base text-black font-poppins-medium opacity-50">
            {groupChat?.locationId.name}
          </p>
        </div>
      </Header>

      <Tabs defaultValue="details" className="px-8 md:px-16 w-full">
        {/* tabs & actions button */}
        <div className="flex items-center justify-between">
          <TabsList className="">
            <TabsTrigger
              value="details"
              className="text-black px-6 data-[state=active]:bg-sky-500 data-[state=active]:text-white text-xs md:text-base"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="text-black px-6 data-[state=active]:bg-sky-500 data-[state=active]:text-white text-xs md:text-base"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          {/* action buttons */}
          <div className="flex items-center gap-x-4">
            {edit ? (
              <button
                className="text-xs md:text-base bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all duration-300 text-black px-3 py-1 rounded-sm flex items-center gap-x-1"
                onClick={() => {
                  if (isUpdating || isUploading || isGettingGroupChat) return;

                  setEdit(false);
                  setImageFile(null);
                  setForm({
                    name: groupChat?.name as string,
                    image: groupChat?.image as string,
                  });
                }}
              >
                <Pencil size={16} />
                <span>Cancel</span>
              </button>
            ) : (
              <button
                className="text-xs md:text-base bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all duration-300 text-black px-3 py-1 rounded-sm flex items-center gap-x-1"
                onClick={() => setEdit(true)}
              >
                <Pencil size={16} />
                <span>Edit</span>
              </button>
            )}

            {!edit && (
              <button
                className="text-xs md:text-base bg-red-500 hover:bg-red-600 transition-all duration-300 text-white px-3 py-1 rounded-sm"
                onClick={() => setDeleteModal(true)}
              >
                Delete group chat
              </button>
            )}
          </div>
        </div>

        {/* details */}
        {isGettingGroupChat ? (
          <GroupChatDetailsSkeleton />
        ) : (
          <TabsContent
            value="details"
            className="text-black text-xs md:text-base py-4"
          >
            <div className="flex flex-col space-y-8">
              <div className="flex flex-col gap-y-4">
                {/* group image */}
                <div className="mx-auto relative">
                  <img
                    src={form.image || images.groupChatPlaceholder}
                    alt="image"
                    className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover bg-slate-300"
                  />
                  {/* edit image button */}
                  {edit && (
                    <button
                      className="flex items-center justify-center bg-sky-500 absolute p-2 rounded-full shadow bottom-0 right-2 md:right-8 hover:bg-sky-600 transition-all duration-300"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="text-white size-4 md:size-8" />

                      <Input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </button>
                  )}
                </div>

                {/* admin */}
                <div className="flex items-center justify-center gap-x-2 relative right-0">
                  <p className="text-xs md:text-base text-black opacity-50">
                    Group admin
                  </p>
                  <p className="font-poppins-medium opacity-100">
                    {groupChat?.admin.name}
                  </p>

                  {/* group member */}
                  <div className="flex items-center gap-x-2 absolute right-0">
                    <Users size={16} />
                    <p className="text-xs md:text-base text-black">
                      {groupChat?.members.length}/{groupChat?.maxMembers}
                    </p>
                  </div>
                </div>
              </div>

              {/* details */}
              <div className="flex flex-col space-y-4">
                {/* name */}
                <div className="flex flex-col space-y-2">
                  <Label className="text-black text-xs md:text-base">
                    Name
                  </Label>
                  <Input
                    className="text-black text-xs md:text-base"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    disabled={!edit}
                  />
                </div>

                {/* description */}
                <div className="flex flex-col space-y-2">
                  <Label className="text-black text-xs md:text-base">
                    Description
                  </Label>
                  <Input
                    className="text-black text-xs md:text-base"
                    value={"Test"}
                    disabled
                  />
                </div>

                {/* sport type */}
                <div className="flex flex-col space-y-2">
                  <Label className="text-black text-xs md:text-base">
                    Sport type
                  </Label>
                  <Input
                    className="text-black text-xs md:text-base"
                    value={groupChat?.sportType.name}
                    disabled
                  />
                </div>

                {/* preferred skill */}
                <div className="flex flex-col space-y-2">
                  <Label className="text-black text-xs md:text-base">
                    Preferred skill
                  </Label>
                  <Input
                    className="text-black text-xs md:text-base"
                    value={caseFirstLetterToUpperCase(
                      groupChat?.preferredSkill || ""
                    )}
                    disabled
                  />
                </div>

                {edit && (
                  <div className="flex items-center justify-center">
                    <Button
                      className="bg-sky-500 hover:bg-sky-600 text-xs md:text-base disabled:bg-slate-300"
                      disabled={isUpdating || isUploading}
                      onClick={handleUpdateGroupChat}
                    >
                      Update
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        )}

        {/* reports */}
        <TabsContent
          value="reports"
          className="text-black text-xs md:text-base py-4"
        >
          <div className="flex flex-col space-y-4">
            {/* filter by status */}
            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger className="w-[180px] text-xs md:text-base">
                <SelectValue
                  placeholder="Filter by status"
                  defaultValue={"all"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="all"
                  className="text-black text-xs md:text-base"
                >
                  All
                </SelectItem>
                <SelectItem
                  value="pending"
                  className="text-black text-xs md:text-base"
                >
                  Pending
                </SelectItem>
                <SelectItem
                  value="acknowledged"
                  className="text-black text-xs md:text-base"
                >
                  Acknowledged
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex flex-col space-y-4">
              <p className="text-black font-poppins-medium text-xs md:text-base">
                Reports: {filteredReports?.length}
              </p>

              {/* report container */}
              <div className="max-h-[30rem] overflow-auto flex flex-col space-y-4">
                {/* report item */}
                {filteredReports?.map((report) => (
                  <GroupChatReportItem key={report._id} report={report} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* delete modal */}
      <CustomModal
        modal={deleteModal}
        setModal={setDeleteModal}
        handler={handleDeleteGroupChat}
        isPending={isDeleting}
        confirmText="Delete"
        title="Confirm delete group chat"
        description="This will permenantly delete this group chat"
        variant="destructive"
      />
    </div>
  );
}
