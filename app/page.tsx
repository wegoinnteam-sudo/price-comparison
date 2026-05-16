"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, CloudSun, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/dashboard/shell";
import { WegoinnRoomMonthlyChart } from "@/components/dashboard/charts";
import { formatKrw, formatPercent } from "@/lib/utils";
import {
  getWegoinnRatesByDate,
  getWegoinnRoomMonthlyHistory,
  roomTypes,
  wegoRoomRates,
  wegoWeeklyRates,
  type RoomType,
} from "@/lib/market-data";

const weekendAverage = Math.round(
  wegoRoomRates.reduce((sum, row) => sum + row.weekend, 0) / wegoRoomRates.length,
);
const weekdayAverage = Math.round(
  wegoRoomRates.reduce((sum, row) => sum + row.weekday, 0) / wegoRoomRates.length,
);
const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export default function DashboardPage() {
  const [selectedRooms, setSelectedRooms] = useState<RoomType[]>(["싱글", "더블", "트윈배드"]);
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 4, 16));
  const [visibleMonth, setVisibleMonth] = useState(new Date(2026, 4, 1));

  const selectedDateInfo = useMemo(() => getWegoinnRatesByDate(selectedDate), [selectedDate]);
  const roomChartData = useMemo(() => getWegoinnRoomMonthlyHistory(selectedRooms), [selectedRooms]);
  const selectedDateLabel = selectedDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  function toggleRoom(roomType: RoomType) {
    setSelectedRooms((current) => {
      if (current.includes(roomType)) {
        return current.length === 1 ? current : current.filter((room) => room !== roomType);
      }

      return [...current, roomType];
    });
  }

  return (
    <DashboardShell
      title="대시보드"
      description="Wegoinn Hostel의 날짜별 가격과 룸타입별 12개월 가격 흐름입니다."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="선택일 평단가" value={formatKrw(selectedDateInfo.average)} change={selectedDateLabel} icon={DollarSign} />
        <MetricCard title="선택일 구분" value={selectedDateInfo.dayType} change="달력 선택 기준" icon={CalendarDays} />
        <MetricCard title="주말 평균가" value={formatKrw(weekendAverage)} change="금-토 기준" icon={TrendingUp} />
        <MetricCard title="주말 프리미엄" value={formatPercent(((weekendAverage - weekdayAverage) / weekdayAverage) * 100)} change="평일 대비" icon={CloudSun} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <CalendarCard
          selectedDate={selectedDate}
          visibleMonth={visibleMonth}
          onDateSelect={setSelectedDate}
          onMonthChange={setVisibleMonth}
        />

        <Card>
          <CardHeader>
            <CardTitle>선택 날짜 룸타입별 가격</CardTitle>
            <CardDescription>{selectedDateLabel} 기준으로 계산된 Wegoinn Hostel 가격입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedDateInfo.rooms.map((room) => (
              <div key={room.roomType} className="flex items-center justify-between rounded-lg border bg-secondary/35 p-3">
                <div>
                  <p className="text-sm font-medium">{room.roomType}</p>
                  <p className="text-xs text-muted-foreground">
                    주중 {formatKrw(room.weekday)} · 주말 {formatKrw(room.weekend)}
                  </p>
                </div>
                <Badge tone="green">{formatKrw(room.selectedDateRate)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>월별 그래프 룸타입</CardTitle>
            <CardDescription>체크한 룸타입만 오른쪽 그래프에 표시됩니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {roomTypes.map((roomType) => (
              <label key={roomType} className="flex h-10 items-center gap-3 rounded-md border bg-secondary/25 px-3 text-sm">
                <input
                  type="checkbox"
                  checked={selectedRooms.includes(roomType)}
                  onChange={() => toggleRoom(roomType)}
                  className="h-4 w-4 accent-teal-400"
                />
                <span>{roomType}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wegoinn Hostel 룸타입별 월별 가격 흐름</CardTitle>
            <CardDescription>2026년 1월부터 12월까지 선택한 룸타입의 월별 금액입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <WegoinnRoomMonthlyChart data={roomChartData} series={selectedRooms} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Wegoinn Hostel 주간 가격</CardTitle>
          <CardDescription>4주간 주중, 주말, 혼합 평균 기준입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">주차</th>
                  <th>평일</th>
                  <th>주말</th>
                  <th className="text-right">평균</th>
                </tr>
              </thead>
              <tbody>
                {wegoWeeklyRates.map((row) => (
                  <tr key={row.week} className="border-b border-border/60">
                    <td className="py-3">{row.week}</td>
                    <td>{formatKrw(row.weekday)}</td>
                    <td>{formatKrw(row.weekend)}</td>
                    <td className="text-right font-medium">{formatKrw(row.blended)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function CalendarCard({
  selectedDate,
  visibleMonth,
  onDateSelect,
  onMonthChange,
}: {
  selectedDate: Date;
  visibleMonth: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay }, (_, index) => index);
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const monthLabel = visibleMonth.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>예약 달력</CardTitle>
            <CardDescription>날짜를 클릭하면 대시보드 가격 정보가 업데이트됩니다.</CardDescription>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-secondary/25 p-4">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onMonthChange(new Date(year, month - 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="이전 달"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold">{monthLabel}</p>
            <button
              type="button"
              onClick={() => onMonthChange(new Date(year, month + 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="다음 달"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {dayLabels.map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((blank) => (
              <div key={`blank-${blank}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const date = new Date(year, month, day);
              const active = toDateKey(date) === toDateKey(selectedDate);
              const weekend = date.getDay() === 5 || date.getDay() === 6;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => onDateSelect(date)}
                  className={`aspect-square rounded-md border text-sm font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : weekend
                        ? "bg-amber-400/10 text-amber-200 hover:border-amber-300"
                        : "bg-card hover:border-primary/60 hover:bg-secondary"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-xl font-semibold">{value}</p>
          <p className="mt-1 text-sm text-primary">{change}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
