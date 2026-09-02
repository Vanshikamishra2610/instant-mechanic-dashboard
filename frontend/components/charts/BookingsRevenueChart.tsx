"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TimeSeriesPoint } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function BookingsRevenueChart({
  data,
  metric,
}: {
  data: TimeSeriesPoint[];
  metric: "bookings" | "revenue";
}) {
  const color = metric === "bookings" ? "#4B9FD6" : "#F2A93B";

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2B3136" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#6B747B", fontSize: 11 }}
          axisLine={{ stroke: "#2B3136" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fill: "#6B747B", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={metric === "revenue" ? 56 : 32}
          tickFormatter={(v) => (metric === "revenue" ? `₹${Math.round(v / 1000)}k` : v)}
        />
        <Tooltip
          contentStyle={{
            background: "#1E2327",
            border: "1px solid #2B3136",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#9AA3AA" }}
          formatter={(value: number) =>
            metric === "revenue" ? [formatCurrency(value), "Revenue"] : [value, "Bookings"]
          }
        />
        <Area
          type="monotone"
          dataKey={metric}
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${metric})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
