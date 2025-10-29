import { useState } from "react";
import { useParams } from "react-router";
import Modal from "react-modal";

import Header from "@/components/Header";
import UserReportItem from "@/components/UserReportItem";
import UserDetailsSkeleton from "@/components/skeleton/UserDetailsSkeleton";
import UserReportsSkeleton from "@/components/skeleton/UserReportsSkeleton";
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
import {
  useCancelAccountSuspension,
  useGetAllUserReports,
  useGetUserById,
  useSuspendAccount,
} from "@/lib/React Query/user";
import { IReport } from "@/types";
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

export default function UserDetailsPage() {
  const { userId } = useParams();

  const [status, setStatus] = useState("all");
  const [suspendModal, setSuspendModal] = useState(false);

  const { data: user, isLoading } = useGetUserById({
    userId: userId as string,
  });
  const { data: reports, isLoading: isGettingReports } = useGetAllUserReports({
    userId: userId as string,
  });

  const { mutate: suspendAccount, isPending: isSuspending } =
    useSuspendAccount();
  const {
    mutate: cancelAccountSuspension,
    isPending: isCancelingAccountSuspension,
  } = useCancelAccountSuspension();

  let filteredReports: IReport[] = [];

  if (reports && status === "pending") {
    filteredReports = reports?.filter((report) => !report.isAcknowledged);
  } else if (reports && status === "acknowledged") {
    filteredReports = reports?.filter((report) => report.isAcknowledged);
  } else {
    filteredReports = reports || [];
  }

  function handleSuspendAccount() {
    if (!user) return;

    suspendAccount({ userId: user._id });
    setSuspendModal(false);
  }

  function handleCancelAccountSuspension() {
    if (!user) return;

    cancelAccountSuspension({ userId: user._id });
  }

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col space-y-6">
      <Header></Header>

      <Tabs defaultValue="details" className="px-8 md:px-16 w-full">
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

          {user?.isSuspended ? (
            <Button
              className="text-xs md:text-base border border-slate-300 bg-slate-100 transition-all duration-300 disabled:bg-slate-300 text-black hover:bg-slate-200"
              disabled={isCancelingAccountSuspension}
              onClick={handleCancelAccountSuspension}
            >
              Cancel suspend account
            </Button>
          ) : (
            <Button
              className="text-xs md:text-base bg-red-500 hover:bg-red-600 transition-all duration-300 disabled:bg-slate-300"
              disabled={isSuspending}
              onClick={() => setSuspendModal(true)}
            >
              Suspend account
            </Button>
          )}
        </div>

        {/* details */}
        {isLoading ? (
          <UserDetailsSkeleton />
        ) : (
          <TabsContent
            value="details"
            className="text-black text-xs md:text-base py-4"
          >
            <div className="flex flex-col space-y-8">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-slate-300 mx-auto">
                <img
                  src={user?.image}
                  alt="User Image"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label className="text-black text-xs md:text-base">
                    Name
                  </Label>
                  <Input
                    value={user?.name}
                    className="text-black text-xs md:text-base"
                    disabled
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <Label className="text-black text-xs md:text-base">
                    Email
                  </Label>
                  <Input
                    value={user?.email}
                    className="text-black text-xs md:text-base"
                    disabled
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        )}

        {/* reports */}
        {isGettingReports ? (
          <UserReportsSkeleton />
        ) : (
          <TabsContent
            value="reports"
            className="text-black text-xs md:text-base py-4"
          >
            <div className="flex flex-col space-y-4">
              {/* filter by status */}
              <Select
                value={status}
                onValueChange={(value) => setStatus(value)}
              >
                <SelectTrigger className="w-[180px] text-xs md:text-base">
                  <SelectValue
                    placeholder="Filter by status"
                    defaultValue={"All"}
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
                  {filteredReports?.map((report) => (
                    <UserReportItem report={report} key={report._id} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* suspend modal */}
      <CustomModal
        modal={suspendModal}
        setModal={setSuspendModal}
        handler={handleSuspendAccount}
        isPending={isSuspending}
        title="Confirm suspend account"
        description="This account will not be able to access this application"
        variant="destructive"
      />
    </div>
  );
}
