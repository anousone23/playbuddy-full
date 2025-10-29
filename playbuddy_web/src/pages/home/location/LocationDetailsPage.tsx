import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { Map, Pencil, Plus, Trash, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";
import { z } from "zod";

import GoogleMap from "@/components/GoogleMap";
import Header from "@/components/Header";
import LocationDetailsSkeleton from "@/components/skeleton/LocationDetailsSkelton";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { CLOUDINARY_LOCATION_IMAGE_FOLDER } from "@/constants";
import { useUploadImages } from "@/lib/React Query/cloudinary";
import {
  useDeleteLocation,
  useGetLocationById,
  useUpdateLocation,
} from "@/lib/React Query/location";
import { useGetAllSportTypes } from "@/lib/React Query/sportType";
import { locationFormSchema } from "@/lib/zod";
import {
  ImageType,
  ISportType,
  LocationFormValues,
  UpdateLocationType,
} from "@/types";
import { caseFirstLetterToUpperCase, urlToFile } from "@/utils/helper";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Options } from "browser-image-compression";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import CustomModal from "@/components/CustomModal";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    height: "80%",
  },
};

export default function LocationDetailsPage() {
  const { setOpen } = useSidebar();
  const { locationId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [edit, setEdit] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const { data: location, isLoading: isGettingLocation } = useGetLocationById({
    locationId: locationId as string,
  });
  const { data: sportTypes } = useGetAllSportTypes();
  const { mutateAsync: updateLocation, isPending: isUpdatingLocation } =
    useUpdateLocation();
  const { mutateAsync: uploadImages, isPending: isUploadingImages } =
    useUploadImages();
  const { mutateAsync: deleteLocation, isPending: isDeleteingLocation } =
    useDeleteLocation();

  const [locationImages, setLocationImages] = useState<ImageType[]>([]);
  const [errorImage, setErrorImage] = useState("");

  useEffect(() => {
    async function loadLocationImages() {
      if (location?.images) {
        try {
          const imagesWithFiles = await Promise.all(
            location.images.map(async (img) => ({
              uri: img,
              file: await urlToFile(img, img, "image/jpeg"),
            }))
          );

          setLocationImages(imagesWithFiles);
        } catch (error) {
          console.log("Error from loadLocationImages", error);
        }
      }
    }

    loadLocationImages();
  }, [location?.images, location?._id]);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    values: {
      name: location?.name || "",
      description: location?.description || "",
      coordinates: {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
      },
      sportTypes: location?.sportTypes || [],
    },
  });

  async function onSubmit(values: z.infer<typeof locationFormSchema>) {
    if (locationImages.length === 0) {
      return setErrorImage("Select at least one image");
    }

    const originalUris = location?.images || [];

    const addedImages = locationImages.filter(
      (image) => !originalUris.includes(image.uri)
    );

    const removedImages = originalUris.filter(
      (uri) => !locationImages.some((img) => img.uri === uri)
    );

    const haveNewImages = addedImages.length > 0 || removedImages.length > 0;
    const sportTypeIds = values.sportTypes.map((st) => st._id);

    let payload: UpdateLocationType = {
      name: values.name,
      description: values.description,
      latitude: values.coordinates.latitude,
      longitude: values.coordinates.longitude,
      sportTypes: sportTypeIds,
    };

    if (haveNewImages) {
      const files = locationImages.map((imageFile) => imageFile.file);
      const secureUrls = await uploadImages({
        images: files,
        folder: CLOUDINARY_LOCATION_IMAGE_FOLDER,
      });

      payload = { ...payload, images: secureUrls };
    }

    await updateLocation(
      {
        locationId: locationId as string,
        data: payload,
      },
      {
        onSuccess: () => {
          setEdit(false);
        },
      }
    );
  }

  function onCheckedChange({
    checked,
    sportType,
  }: {
    checked: CheckedState;
    sportType: ISportType;
  }) {
    const current = form.getValues("sportTypes");
    if (checked) {
      if (!current.some((st: ISportType) => st._id === sportType._id)) {
        form.setValue("sportTypes", [...current, sportType]);
      }
    } else {
      form.setValue(
        "sportTypes",
        current.filter((st) => st._id !== sportType._id)
      );
    }
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files) return;

    if (files.length + locationImages.length > 3) {
      return toast.error("Can not select more than 3 images");
    }

    const options: Options = {
      maxSizeMB: 1,
      useWebWorker: true,
      fileType: "image/jpeg",
    };

    try {
      const newImages = await Promise.all(
        Array.from(files).map(async (file) => {
          const compressedFile = await imageCompression(file, options);

          return {
            uri: URL.createObjectURL(file),
            file: compressedFile,
          };
        })
      );

      setLocationImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      toast.error("Failed to process image(s)");
      console.error("Image compression error:", error);
    }
  }

  function handleRemoveImage(imageName: string) {
    setLocationImages((prev) =>
      prev.filter((image) => image.file.name !== imageName)
    );
  }

  async function handleDeleteLocation() {
    if (!location) return;

    await deleteLocation(
      { locationId: location._id },
      {
        onSuccess: () => {
          setDeleteModal(false);
          navigate("/locations", { replace: true });
        },
      }
    );
  }

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col space-y-6">
      <Header>
        <p className="font-poppins-medium text-black text-sm md:text-base">
          {location?.name}
        </p>
      </Header>

      {/* location image */}
      {isGettingLocation ? (
        <LocationDetailsSkeleton />
      ) : (
        <main className="overflow-auto">
          {/* image selector */}
          {locationImages.length === 0 && edit && (
            <div className="flex flex-col items-center gap-y-2">
              <div className="w-60 h-36 md:w-76 md:h-44 mx-auto rounded-sm bg-slate-100 border border-slate-300 flex items-center justify-center">
                <button
                  type="button"
                  className="border rounded-full bg-slate-100 border-slate-300 p-2 shadow hover:bg-slate-200 transition-all duration-300"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="text-black" />
                  <Input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleImageChange}
                    hidden
                    multiple
                    accept="image/*"
                  />
                </button>
              </div>

              {errorImage && (
                <p className="text-xs font-regular text-destructive">
                  {errorImage}
                </p>
              )}
            </div>
          )}

          {/* no images */}
          {locationImages.length === 0 && !edit && (
            <div className="flex flex-col items-center gap-y-2">
              <div className="w-60 h-36 md:w-76 md:h-44 mx-auto rounded-sm bg-slate-100 border border-slate-300 flex items-center justify-center">
                <p>No images</p>
              </div>

              {errorImage && (
                <p className="text-xs font-regular text-destructive">
                  {errorImage}
                </p>
              )}
            </div>
          )}

          {/* location image */}
          {locationImages.length > 0 && (
            <Carousel className="w-full max-w-xs mx-auto">
              <CarouselContent>
                {locationImages.map((img, i) => (
                  <CarouselItem key={i}>
                    <div className="w-60 h-36 md:w-76 md:h-44 mx-auto rounded-sm bg-slate-300 relative">
                      <img
                        src={img.uri}
                        alt="image"
                        className="w-full h-full object-center rounded-sm"
                      />
                      {edit && (
                        <div
                          className="absolute top-1 right-1 bg-slate-100 border border-slate-300 rounded-full p-1 shadow hover:bg-slate-200 transition-all duration-300"
                          onClick={() => {
                            if (isUpdatingLocation || isUploadingImages) return;
                            handleRemoveImage(img.file.name);
                          }}
                        >
                          <X className="size-4" />
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}

                {/* add more image button */}
                {locationImages.length < 3 && edit && (
                  <CarouselItem key={"addImage"}>
                    <div className="w-60 h-36 md:w-76 md:h-44 mx-auto rounded-sm bg-slate-300 flex items-center justify-center">
                      <button
                        type="button"
                        className="border rounded-full bg-slate-100 border-slate-300 p-2 shadow hover:bg-slate-200 transition-all duration-300"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Plus className="text-black" />

                        <Input
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          type="file"
                          hidden
                          multiple
                          accept="image/*"
                        />
                      </button>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <CarouselPrevious className="" type="button" />
              <CarouselNext type="button" />
            </Carousel>
          )}

          <div className="mx-8 md:mx-16">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs md:text-base text-black">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="text-xs md:text-base text-black"
                          disabled={!edit}
                        />
                      </FormControl>
                      <FormMessage className="text-xs md:text-base" />
                    </FormItem>
                  )}
                />

                {/* description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="text-xs md:text-base text-black">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="description"
                          {...field}
                          className="text-xs md:text-base text-black pb-6"
                          disabled={!edit}
                        />
                      </FormControl>
                      <FormMessage className="text-xs md:text-base" />

                      <div
                        className={`absolute right-3 bottom-1 opacity-70 ${
                          form.formState.errors.description && "bottom-8"
                        }`}
                      >
                        <p className="text-black text-xs md:text-sm">
                          {form.getValues("description").length} / 300
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {/* coordinates */}
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1">
                    {/* latitude */}
                    <FormField
                      control={form.control}
                      name="coordinates.latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs md:text-base text-black">
                            Latitude
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="latitude"
                              {...field}
                              value={form.watch("coordinates.latitude")}
                              className="text-xs md:text-base text-black"
                              disabled={!edit}
                            />
                          </FormControl>
                          <FormMessage className="text-xs md:text-base" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* longitude */}
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="coordinates.longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs md:text-base text-black">
                            Longitude
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="longitude"
                              {...field}
                              value={form.watch("coordinates.longitude")}
                              className="text-xs md:text-base text-black"
                              disabled={!edit}
                            />
                          </FormControl>
                          <FormMessage className="text-xs md:text-base" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* map */}
                  <button
                    type="button"
                    className={`self-end border border-slate-300  transition-all duration-300 px-2 py-1 rounded-sm ${
                      !edit ? "bg-slate-100" : "bg-sky-500"
                    } ${
                      (form.formState.errors.coordinates?.latitude ||
                        form.formState.errors.coordinates?.longitude) &&
                      "self-center!"
                    }`}
                    disabled={!edit || isUpdatingLocation || isUploadingImages}
                  >
                    <Map
                      className={`${!edit ? "text-black" : "text-white"}`}
                      onClick={() => {
                        setOpen(false);
                        setModalOpen(!modalOpen);
                      }}
                    />
                    <Modal
                      style={customStyles}
                      isOpen={modalOpen}
                      onRequestClose={() => {
                        setOpen(true);
                        setModalOpen(!modalOpen);
                      }}
                      appElement={document.getElementById("root")!}
                    >
                      <GoogleMap form={form} />
                    </Modal>
                  </button>
                </div>

                {/* sport types selector */}
                <div className="flex flex-col space-y-4">
                  <Popover>
                    <div className="flex flex-col space-y-2">
                      <Label className="text-xs md:text-base text-black">
                        Sport types
                      </Label>

                      {edit && (
                        <PopoverTrigger className="text-xs md:text-base text-black opacity-50 border border-slate-300 shadow px-2 py-2 w-full rounded-sm text-start">
                          Select a sport types
                        </PopoverTrigger>
                      )}

                      {/* Manually render the error */}
                      {form.formState.errors.sportTypes && (
                        <p className="text-xs font-regular text-destructive">
                          {form.formState.errors.sportTypes.message?.toString()}
                        </p>
                      )}
                    </div>

                    <PopoverContent>
                      <div className="flex flex-col space-y-6">
                        {sportTypes?.slice(1)?.map((sportType) => (
                          <div
                            className="flex items-center space-x-4 "
                            key={sportType._id}
                          >
                            <Checkbox
                              className="border border-slate-300 bg-slate-100"
                              checked={
                                form.getValues("sportTypes") &&
                                form
                                  .watch("sportTypes")
                                  .some((st) => st._id === sportType._id)
                              }
                              onCheckedChange={(checked) =>
                                onCheckedChange({ checked, sportType })
                              }
                            />
                            <span className="text-black text-xs md:text-base">
                              {caseFirstLetterToUpperCase(sportType.name)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <div className="flex flex-wrap gap-x-4 gap-y-3">
                    {/* sport types */}
                    {form
                      .getValues("sportTypes")
                      .map((sportType: ISportType) => (
                        <div
                          key={sportType._id}
                          className="border border-slate-300 px-2 py-1 rounded-sm relative"
                        >
                          <p className="text-black text-xs md:text-base">
                            {caseFirstLetterToUpperCase(sportType.name)}
                          </p>

                          <button
                            hidden={!edit}
                            type="button"
                            className="absolute border border-slate-300 bg-slate-100 hover:bg-slate-200 transition-all duration-300 rounded-full -top-2 -right-2"
                            onClick={() =>
                              form.setValue(
                                "sportTypes",
                                form
                                  .getValues("sportTypes")
                                  .filter(
                                    (st: ISportType) => st._id !== sportType._id
                                  )
                              )
                            }
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {edit && (
                  <div className="flex items-center justify-center mb-8">
                    <Button
                      className="text-xs md:text-base bg-sky-500 hover:bg-sky-600 transition-all duration-300 px-6 disabled:bg-slate-300"
                      disabled={isUpdatingLocation || isUploadingImages}
                    >
                      Update
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </div>

          {/* action buttons */}
          <div className="absolute top-26 right-8 flex items-center gap-x-4">
            {/* edit button */}
            <div>
              {!edit ? (
                <button
                  className="text-xs md:text-base bg-sky-500 hover:bg-sky-600 transition-all duration-300 flex items-center gap-x-2 px-3 py-1 rounded-sm"
                  onClick={() => setEdit(!edit)}
                >
                  <Pencil size={14} className="text-white" />
                  <span className="text-xs md:text-base text-white">Edit</span>
                </button>
              ) : (
                <button
                  className="text-xs md:text-base bg-slate-100 hover:bg-slate-200 transition-all duration-300 flex items-center gap-x-2 px-3 py-1 rounded-sm border border-slate-300 disabled:bg-slate-300"
                  disabled={isUpdatingLocation || isUploadingImages}
                  onClick={async () => {
                    setEdit(!edit);
                    form.reset();

                    const originalImages = await Promise.all(
                      location!.images.map(async (img) => ({
                        uri: img,
                        file: await urlToFile(img, img, "image/jpeg"),
                      }))
                    );

                    setLocationImages(originalImages);
                  }}
                >
                  <Pencil size={14} className="text-black" />
                  <span className="text-xs md:text-base text-black">
                    Cancel
                  </span>
                </button>
              )}
            </div>

            {/* delete button */}
            {!edit && (
              <div>
                <button
                  className="text-xs md:text-base bg-red-500 hover:bg-red-600 transition-all duration-300 flex items-center gap-x-2 px-3 py-1 rounded-sm"
                  onClick={() => setDeleteModal(true)}
                >
                  <Trash size={14} className="text-white" />
                  <span className="text-xs md:text-base text-white">
                    Delete
                  </span>
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* delete modal */}
      <CustomModal
        variant="destructive"
        modal={deleteModal}
        setModal={setDeleteModal}
        handler={handleDeleteLocation}
        isPending={isDeleteingLocation}
        confirmText="Delete"
        title="Confirm delete location"
        description="This will permenantly delete this location"
      />
    </div>
  );
}
