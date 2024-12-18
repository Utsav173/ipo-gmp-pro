import { StatsData } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { priceFormatter } from "@/lib/utils";

const Stats = ({ statsData }: { statsData: StatsData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Active IPOs</CardTitle>
          <CardDescription>Currently open for subscription</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          <div className="text-2xl font-bold">{statsData.activeIPOs}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Upcoming IPOs</CardTitle>
          <CardDescription>Opening soon</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          <div className="text-2xl font-bold">{statsData.upcomingIPOs}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Average GMP</CardTitle>
          <CardDescription>Current market premium</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          <div className="text-2xl font-bold">
            {priceFormatter.format(statsData.avgGMP)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stats;
