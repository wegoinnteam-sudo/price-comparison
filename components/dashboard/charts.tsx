"use client";

import {
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
      <LineChart data={priceTrend}>
        <CartesianGrid stroke="hsl(218 17% 20%)" strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatKrw(Number(value))} />
        <Legend />
        <Line type="monotone" dataKey="market" stroke="#14b8a6" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="weekday" stroke="#60a5fa" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="weekend" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RoomComparisonChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={roomComparison}>
        <CartesianGrid stroke="hsl(218 17% 20%)" strokeDasharray="3 3" />
        <XAxis dataKey="roomType" />
        <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatKrw(Number(value))} />
        <Legend />
        <Line type="monotone" dataKey="market" name="시장 평균" stroke="#38bdf8" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="target" name="Wegoinn" stroke="#14b8a6" strokeWidth={3} dot={false} />
      </LineChart>
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

export function MonthlyCompetitorHistoryChart({
  data,
}: {
  data: Array<{ month: string; weekday: number; weekend: number; average: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid stroke="hsl(218 17% 20%)" strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatKrw(Number(value))} />
        <Legend />
        <Line type="monotone" dataKey="weekday" stroke="#60a5fa" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="weekend" stroke="#f59e0b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="average" stroke="#14b8a6" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WegoinnMonthlyRateChart({
  data,
}: {
  data: Array<{ month: string; weekday: number; weekend: number; average: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid stroke="hsl(218 17% 20%)" strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatKrw(Number(value))} />
        <Legend />
        <Line type="monotone" dataKey="average" name="평단가" stroke="#14b8a6" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="weekday" name="주중" stroke="#60a5fa" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="weekend" name="주말" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WegoinnRoomMonthlyChart({
  data,
  series,
}: {
  data: Array<Record<string, string | number>>;
  series: string[];
}) {
  const colors = ["#60a5fa", "#f59e0b", "#f472b6", "#a78bfa", "#34d399", "#fb7185", "#facc15"];

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={data}>
        <CartesianGrid stroke="hsl(218 17% 20%)" strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatKrw(Number(value))} />
        <Legend />
        {series.map((name, index) => (
          <Line key={name} type="monotone" dataKey={name} stroke={colors[index % colors.length]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CompetitorRoomSelectionChart({
  data,
  series,
}: {
  data: Array<Record<string, string | number>>;
  series: string[];
}) {
  const colors = ["#60a5fa", "#f59e0b", "#f472b6", "#a78bfa", "#34d399", "#fb7185", "#facc15"];
  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={data}>
        <CartesianGrid stroke="hsl(218 17% 20%)" strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatKrw(Number(value))} />
        <Legend />
        <Line type="monotone" dataKey="Wegoinn Hostel" name="Wegoinn Hostel 평단가" stroke="#ef4444" strokeWidth={3} dot={false} />
        {series.map((name, index) => (
          <Line key={name} type="monotone" dataKey={name} stroke={colors[index % colors.length]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
