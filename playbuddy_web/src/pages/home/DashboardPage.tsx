import { useEffect, useState } from "react";

import Header from "@/components/Header";
import DashboardSkeleton from "@/components/skeleton/DashbaordSkeleton";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useGetDashboardData } from "@/lib/React Query/user";
import { GroupChatPerSportTypeType } from "@/types";
import { MapPinned, MessageCircleMore, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  count: {
    label: "Group chats",
    color: "oklch(29.3% 0.066 243.157)",
  },
  totalUsersInGroups: {
    label: "Users",
    color: "oklch(68.5% 0.169 237.323)",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data, isLoading: isLoading } = useGetDashboardData();

  const [groupChatsPerSportType, setGroupChatsPerSportType] = useState<
    GroupChatPerSportTypeType[]
  >([]);

  console.log(groupChatsPerSportType);

  useEffect(() => {
    if (data) {
      setGroupChatsPerSportType(data.groupChatsPerSportType);
    }
  }, [data]);

  const content = isLoading ? (
    <DashboardSkeleton />
  ) : (
    <main className="flex-1 space-y-8 px-8 md:px-16 py-4">
      <div className="flex items-center justify-center gap-x-4">
        {/* total users */}
        <div
          className="flex-1 h-28 rounded-sm bg-slate-100 shadow p-4 flex flex-col justify-between cursor-pointer"
          onClick={() => navigate("/users")}
        >
          <div className="flex items-center justify-center gap-x-2">
            <Users className="" strokeWidth={2} />
            <p className="font-poppins-medium text-black text-lg md:text-xl">
              Total users
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <p className="font-poppins-medium text-black text-4xl">
              {data?.totalUsers}
            </p>
          </div>
        </div>

        {/* online user */}
        <div className="flex-1 h-28 rounded-sm bg-slate-100 shadow p-4 flex flex-col justify-between">
          <div className="flex items-center justify-center gap-x-2">
            <div className="relative">
              <Users className="" strokeWidth={2} />
              <div className="w-2 h-2 bg-green-500 rounded-full absolute -top-1 -right-1 shadow" />
            </div>
            <p className="font-poppins-medium text-black text-lg md:text-xl">
              Online users
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <p className="font-poppins-medium text-black  text-4xl">
              {data?.onlineUsers}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-x-4">
        {/* total locations */}
        <div
          className="flex-1 h-28 rounded-sm bg-slate-100 shadow p-4 flex flex-col justify-between cursor-pointer"
          onClick={() => navigate("/locations")}
        >
          <div className="flex items-center justify-center gap-x-2">
            <MapPinned className="" strokeWidth={2} />
            <p className="font-poppins-medium text-black text-lg md:text-xl">
              Total locations
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <p className="font-poppins-medium text-black text-4xl">
              {data?.totalLocations}
            </p>
          </div>
        </div>

        {/* today messages */}
        <div className="flex-1 h-28 rounded-sm bg-slate-100 shadow p-4 flex flex-col justify-between">
          <div className="flex items-center justify-center gap-x-2">
            <MessageCircleMore className="" strokeWidth={2} />

            <p className="font-poppins-medium text-black text-lg md:text-xl">
              Today messages
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <p className="font-poppins-medium text-black  text-4xl">
              {data?.totalMessages}
            </p>
          </div>
        </div>
      </div>

      <ChartContainer
        config={chartConfig}
        className="min-h-56 max-h-80 bg-slate-100 shadow py-4  rounded-sm w-full"
      >
        <BarChart accessibilityLayer data={groupChatsPerSportType} barSize={40}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="sportType"
            tickLine={false}
            tickMargin={12}
            axisLine={false}
          />
          <YAxis
            dataKey="totalUsersInGroups"
            tickLine={false}
            tickMargin={12}
            axisLine={false}
            allowDecimals={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          <Bar
            dataKey="totalUsersInGroups"
            fill="var(--color-totalUsersInGroups)"
            radius={4}
          />
        </BarChart>
      </ChartContainer>
    </main>
  );

  return (
    <div className="flex flex-col">
      <Header />
      {content}
    </div>
  );
}
