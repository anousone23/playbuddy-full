import Modal from "react-modal";
import { X } from "lucide-react";

import { useAcknowledgeReport } from "@/lib/React Query/user";
import { IReport } from "@/types";
import { formateTime } from "@/utils/helper";
import { useState } from "react";
import { useSidebar } from "./ui/sidebar";

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

export default function UserReportItem({ report }: { report: IReport }) {
  const { setOpen } = useSidebar();

  const { mutateAsync: acknowledgeReport, isPending } = useAcknowledgeReport();
  const [evidenceImagePreview, setEvidenceImagePreview] = useState(false);

  async function handleAcknowledgeReport() {
    await acknowledgeReport({
      userId: report.reportedId,
      reportId: report._id,
    });
  }

  function handleOpenImagePreview() {
    setEvidenceImagePreview(true);
    setOpen(false);
  }
  function handleCloseImagePreview() {
    setEvidenceImagePreview(false);
    setOpen(true);
  }

  return (
    <div
      className="border border-slate-300 rounded-sm px-4 py-4 shadow flex flex-col space-y-4"
      key={report._id}
    >
      <div className="flex items-center justify-between">
        <p className="text-black text-xs md:text-base font-poppins-medium">
          {report.reason} <span className="opacity-50">reported by </span>
          <span className="text-black">{report?.reportBy.name}</span>
        </p>

        <p className="text-black text-xs md:text-base opacity-50">
          {formateTime(report.createdAt)}
        </p>
      </div>

      <div className={`flex justify-end ${report.image && "justify-between!"}`}>
        {/* evidence */}
        {report.image && (
          <div
            className="flex flex-col gap-y-2 cursor-pointer"
            onClick={handleOpenImagePreview}
          >
            <p className="text-black text-xs md:text-base">
              {report.description}
            </p>
            <img
              src={report.image}
              alt="report image"
              className="w-40 h-28 rounded-sm object-fill bg-slate-200"
            />
          </div>
        )}

        <div className="flex items-end">
          {report.isAcknowledged ? (
            <button
              className="bg-slate-100 border border-slate-300 px-4 py-1 rounded-sm text-black text-xs md:text-base transition-all duration-300"
              disabled
            >
              Acknowledged
            </button>
          ) : (
            <button
              className="bg-sky-500 px-4 py-1 rounded-sm text-white text-xs md:text-base hover:bg-sky-600 transition-all duration-300 disabled:bg-slate-300"
              disabled={isPending}
              onClick={handleAcknowledgeReport}
            >
              Acknowledge
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={evidenceImagePreview}
        onRequestClose={handleCloseImagePreview}
        style={modalStyles}
      >
        <div className="w-96 h-96 md:w-[500px] md:h-[600px] lg:w-[700px] lg:h-[700px]">
          <X
            className="cursor-pointer text-black"
            size={28}
            onClick={handleCloseImagePreview}
          />
          <img src={report.image} className="w-full h-full object-contain" />
        </div>
      </Modal>
    </div>
  );
}
