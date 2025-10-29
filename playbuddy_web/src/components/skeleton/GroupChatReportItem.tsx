import { useAcknowledgeGroupChatReport } from "@/lib/React Query/groupChat";
import { IReport } from "@/types";
import { formateTime } from "@/utils/helper";

export default function GroupChatReportItem({ report }: { report: IReport }) {
  const { mutateAsync: acknowledgeReport, isPending: isAcknowledging } =
    useAcknowledgeGroupChatReport();

  async function handleAcknowledgeGroupChatReport() {
    await acknowledgeReport({
      groupChatId: report.reportedId as string,
      reportId: report._id,
    });
  }

  return (
    <div className="border border-slate-300 rounded-sm px-8 py-4 shadow flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-black text-xs md:text-base font-poppins-medium">
          {report.reason} <span className="opacity-50">reported by</span>
          <span className="text-black">{report.reportBy.name}</span>
        </p>

        <p className="text-black text-xs md:text-base opacity-50">
          {formateTime(report.createdAt)}
        </p>
      </div>

      <div className={`flex justify-end ${report.image && "justify-between!"}`}>
        {/* evidence */}
        {report.image && (
          <div className="flex flex-col gap-y-2">
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
              disabled={isAcknowledging}
              onClick={handleAcknowledgeGroupChatReport}
            >
              Acknowledge
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
