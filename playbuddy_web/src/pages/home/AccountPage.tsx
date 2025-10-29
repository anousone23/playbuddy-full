import { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import imageCompression, { Options } from "browser-image-compression";
import { Camera, Eye, EyeOff, Pencil, SquarePen } from "lucide-react";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetAuthUser, useUpdateProfile } from "@/lib/React Query/auth";
import { CLOUDINARY_PROFILE_IMAGE_FOLDER } from "@/constants";
import { useUploadImage } from "@/lib/React Query/cloudinary";
import { toast } from "sonner";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    borderRadius: 6,
    width: 400,
  },
};

type FormType = {
  name: string;
  image: string;
};

export default function AccountPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [edit, setEdit] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassoword] = useState("");
  const [showNewPassoword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [form, setForm] = useState<FormType>({
    name: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: user } = useGetAuthUser();
  const { mutateAsync: updateProfile, isPending: isUpdating } =
    useUpdateProfile();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, image: user.image });
    }
  }, [user]);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;

    if (!files) return;

    const url = URL.createObjectURL(files[0]);
    setForm((prev) => ({ ...prev, image: url }));

    const options: Options = {
      maxSizeMB: 1,
      useWebWorker: true,
      fileType: "image/jpeg",
    };
    const compressedImage = await imageCompression(files[0], options);
    setImageFile(compressedImage);
  }

  async function handleUpdateProfile() {
    if (form.name === user?.name && form.image === user?.image) return;

    let imageUrl = user?.image;

    // Only upload if the image was changed
    if (imageFile) {
      imageUrl = await uploadImage({
        file: imageFile,
        folder: CLOUDINARY_PROFILE_IMAGE_FOLDER,
      });
    }

    const payload = {
      name: form.name,
      image: imageUrl,
    };

    await updateProfile(
      {
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

  async function handleUpdatePassword() {
    if (!newPassword && !confirmNewPassword) {
      return toast.warning("All field are required");
    }

    const payload = {
      newPassword,
      confirmNewPassword,
    };

    await updateProfile(
      { data: payload },
      {
        onSuccess: () => {
          setPasswordModal(false);
          setNewPassword("");
          setConfirmNewPassoword("");
        },
      }
    );
  }

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col gap-y-4 relative">
      <Header>
        <p className="text-black text-xs md:text-base font-poppins-medium">
          Account
        </p>
      </Header>

      <div className="flex flex-col mx-8 md:mx-16 gap-y-8">
        {/* profile image */}
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-slate-300 mx-auto relative">
          <img
            src={form.image}
            alt="avatar"
            className="w-full h-full rounded-full object-cover"
          />
          <Input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          {edit && (
            <button
              className="flex items-center justify-center bg-sky-500 absolute p-2 rounded-full shadow bottom-0 right-2 md:right-8 hover:bg-sky-600 transition-all duration-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="text-white size-4 md:size-8" />
            </button>
          )}
        </div>

        {/* edit button */}
        {edit ? (
          <button
            className=" bg-slate-100 flex items-center gap-x-2 rounded-sm px-4 py-1 hover:bg-slate-200 border border-slate-300 absolute right-8 transition-all duration-300"
            disabled={isUpdating || isUploading}
            onClick={() => {
              setEdit(false);
              setImageFile(null);
              if (user) {
                setForm({
                  name: user?.name,
                  image: user?.image,
                });
              }
            }}
          >
            <Pencil size={14} className="text-black" />
            <span className="text-xs md:text-base text-black">Cancel</span>
          </button>
        ) : (
          <button
            className=" bg-sky-500 flex items-center gap-x-2 rounded-sm px-4 py-1 hover:bg-sky-600 absolute right-8 transition-all duration-300"
            onClick={() => setEdit(true)}
          >
            <Pencil size={14} className="text-white" />
            <span className="text-xs md:text-base text-white">Edit</span>
          </button>
        )}

        {/* details */}
        <div className="flex flex-col gap-y-8">
          <div className="flex flex-col space-y-2">
            <Label className="text-black text-xs md:text-base">Name</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="text-black text-xs md:text-base"
              disabled={!edit}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label className="text-black text-xs md:text-base">Email</Label>
            <Input
              value={user?.email}
              className="text-black text-xs md:text-base"
              disabled
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label className="text-black text-xs md:text-base">Password</Label>
            <div className="relative">
              <Input
                type="password"
                placeholder="********"
                className="text-black text-xs md:text-base"
                disabled
              />
              <Button
                className="absolute right-0 top-0 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-black text-xs md:text-sm"
                onClick={() => {
                  if (edit) {
                    setEdit(false);
                  }

                  setPasswordModal(true);
                }}
              >
                Change
              </Button>
            </div>
          </div>

          {edit && (
            <div className="flex items-center justify-center">
              <Button
                className="bg-sky-500 hover:bg-sky-600 text-xs md:text-base disabled:bg-slate-300"
                disabled={isUpdating || isUploading}
                onClick={handleUpdateProfile}
              >
                Update
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* edit modal */}
      <Modal
        style={customStyles}
        isOpen={passwordModal}
        onRequestClose={() => {
          setPasswordModal(false);
          setConfirmNewPassoword("");
          setNewPassword("");
        }}
        appElement={document.getElementById("root")!}
      >
        <div className="flex flex-col gap-y-8 px-8 py-4 md:gap-y-10">
          <div className="flex flex-col gap-y-4 md:gap-y-8">
            <div className="flex flex-col gap-y-2 relative">
              <Label className="text-xs md:text-base font-poppins-medium text-black">
                New password
              </Label>

              <Input
                type={showNewPassoword ? "text" : "password"}
                placeholder="Enter a password"
                className="text-xs md:text-base font-poppins-regular text-black"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              {!showNewPassoword ? (
                <Eye
                  className="size-4 md:size-5 text-black absolute right-2 bottom-[10px] md:bottom-[8px]"
                  onClick={() => setShowNewPassword(true)}
                />
              ) : (
                <EyeOff
                  className="size-4 md:size-5 text-black absolute right-2 bottom-[10px] md:bottom-[8px]"
                  onClick={() => setShowNewPassword(false)}
                />
              )}
            </div>

            <div className="flex flex-col gap-y-2 relative">
              <Label className="text-xs md:text-base font-poppins-medium text-black">
                Confirm new password
              </Label>

              <Input
                type={showConfirmNewPassword ? "text" : "password"}
                placeholder="Enter a password"
                className="text-xs md:text-base font-poppins-regular text-black"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassoword(e.target.value)}
              />

              {!showConfirmNewPassword ? (
                <Eye
                  className="size-4 md:size-5 text-black absolute right-2 bottom-[10px] md:bottom-[8px]"
                  onClick={() => setShowConfirmNewPassword(true)}
                />
              ) : (
                <EyeOff
                  className="size-4 md:size-5 text-black absolute right-2 bottom-[10px] md:bottom-[8px]"
                  onClick={() => setShowConfirmNewPassword(false)}
                />
              )}
            </div>
          </div>

          <Button
            className="text-xs md:text-base font-poppins-regular text-white bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300"
            disabled={isUpdating || isUploading}
            onClick={handleUpdatePassword}
          >
            Update
          </Button>
        </div>
      </Modal>
    </div>
  );
}
