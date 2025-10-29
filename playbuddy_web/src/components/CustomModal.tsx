import Modal from "react-modal";
import { Button } from "./ui/button";
import { Dispatch, SetStateAction } from "react";

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

type CustomModalProps = {
  modal: boolean;
  setModal: Dispatch<SetStateAction<boolean>>;
  handler: () => void;
  isPending: boolean;
  title: string;
  description: string;
  confirmText?: string;
  variant?: "default" | "destructive";
};

export default function CustomModal({
  modal,
  setModal,
  handler,
  isPending,
  title,
  description,
  confirmText = "Confirm",
  variant = "default",
}: CustomModalProps) {
  return (
    <Modal
      style={modalStyles}
      isOpen={modal}
      onRequestClose={() => {
        if (isPending) return;

        setModal(false);
      }}
      appElement={document.getElementById("root")!}
    >
      <div className="flex flex-col gap-y-6 py-4 px-8">
        <div className="flex flex-col items-center gap-y-2">
          <p className="text-xs md:text-lg font-poppins-medium">{title}</p>
          <p className="text-xs md:text-base font-poppins-regular">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-evenly">
          <Button
            className={`text-xs md:text-base font-poppins-regular text-white disabled:bg-slate-300 ${
              variant === "destructive"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-sky-500 hover:bg-sky-600"
            }`}
            disabled={isPending}
            onClick={handler}
          >
            {confirmText}
          </Button>

          <Button
            className="text-xs md:text-base font-poppins-regular bg-slate-100 hover:bg-slate-200 border border-slate-300 text-black"
            disabled={isPending}
            onClick={() => {
              if (isPending) return;

              setModal(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
