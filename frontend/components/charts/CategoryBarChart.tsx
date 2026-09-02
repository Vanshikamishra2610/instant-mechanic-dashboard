"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { CategoryBreakdownPoint } from "@/lib/types";

const BAR_COLOR = "#F2A93B";

export function CategoryBarChart({ data }: { data: CategoryBreakdownPoint[] }) {
  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2B3136" horizontal={false} />
        <XAxis type="number" tick={{ fill: "#6B747B", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fill: "#9AA3AA", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={140}
        />
        <Tooltip
          contentStyle={{
            background: "#1E2327",
            border: "1px solid #2B3136",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value: number) => [value, "Bookings"]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={16}>
          {sorted.map((_, i) => (
            <Cell key={i} fill={BAR_COLOR} fillOpacity={1 - i * 0.07} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
