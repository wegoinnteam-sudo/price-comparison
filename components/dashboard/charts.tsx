"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { priceTrend, roomComparison, tourismTrend } from "@/lib/market-data";
import { formatKrw } from "@/lib/utils";

const tooltipStyle = {
  background: "hsl(220 22% 10%)",
  border: "1px solid hsl(218 17% 20%)",
  borderRadius: "8px",
  color: "hsl(210 20% 96%)",
};

export function PriceHistoryChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={priceTrend}>
        <defs>
          <linearGradient id="market" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="hsl(218 17% 20%)" strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatKrw(Number(value))} />
        <Legend />
        <Area type="monotone" dataKey="market" stroke="#14b8a6" fill="url(#market)" strokeWidth={2} />
        <Line type="monotone" dataKey="weekday" stroke="#60a5fa" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="weekend" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RoomComparisonChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={roomComparison} layout="vertical" margin={{ left: 16 }}>
        <CartesianGrid stroke="hsl(218 17% 20%)" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
        <YAxis dataKey="roomType" type="category" width={116} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatKrw(Number(value))} />
        <Legend />
        <Bar dataKey="market" fill="#38bdf8" radius={[0, 4, 4, 0]} />
        <Bar dataKey="target" fill="#14b8a6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TourismTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={tourismTrend}>
        <CartesianGrid stroke="hsl(218 17% 20%)" strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis domain={[40, 100]} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        <Line type="monotone" dataKey="japan" stroke="#14b8a6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="usa" stroke="#60a5fa" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="china" stroke="#f59e0b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="europe" stroke="#f472b6" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
