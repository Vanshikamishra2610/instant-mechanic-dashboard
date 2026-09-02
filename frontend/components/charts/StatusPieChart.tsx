"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { StatusBreakdownPoint } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/utils";

const COLORS: Record<string, string> = {
  pending: "#9AA3AA",
  assigned: "#4B9FD6",
  on_the_way: "#B98CE8",
  in_progress: "#F2A93B",
  completed: "#4CAF6D",
  cancelled: "#E5484D",
};

export function StatusPieChart({ data }: { data: StatusBreakdownPoint[] }) {
  const chartData = data.map((d) => ({
    name: STATUS_LABEL[d.status] || d.status,
    value: d.count,
    key: d.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={90}
          paddingAngle={3}
          strokeWidth={0}
        >
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={COLORS[entry.key] || "#6B747B"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#1E2327",
            border: "1px solid #2B3136",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={48}
          wrapperStyle={{ fontSize: 11, color: "#9AA3AA" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
