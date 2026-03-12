import { CrowdDataPoint } from "@/data/mockEvents";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface CrowdGrowthChartProps {
  data: CrowdDataPoint[];
  height?: number;
}

const CrowdGrowthChart = ({ data, height = 140 }: CrowdGrowthChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="crowdGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(267, 100%, 50%)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="hsl(267, 100%, 50%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "hsl(0 0% 54%)", fontFamily: "Space Mono" }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "hsl(0 0% 54%)", fontFamily: "Space Mono" }}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(0 0% 8%)",
            border: "1px solid hsl(0 0% 16%)",
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "Space Mono",
            color: "hsl(0 0% 96%)",
          }}
          formatter={(value: number) => [`${value} people`, "Crowd"]}
        />
        <Area
          type="monotone"
          dataKey="people"
          stroke="hsl(267, 100%, 50%)"
          strokeWidth={2}
          fill="url(#crowdGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CrowdGrowthChart;
