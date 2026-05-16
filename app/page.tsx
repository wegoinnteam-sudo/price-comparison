import type React from "react";
import { CalendarDays, CloudSun, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/dashboard/shell";
import { WegoinnMonthlyRateChart } from "@/components/dashboard/charts";
import { formatKrw, formatPercent } from "@/lib/utils";
import { wegoAverageRate, wegoMonthlyRates, wegoRoomRates, wegoWeeklyRates } from "@/lib/market-data";

const weekendAverage = Math.round(
  wegoRoomRates.reduce((sum, row) => sum + row.weekend, 0) / wegoRoomRates.length,
);
const weekdayAverage = Math.round(
  wegoRoomRates.reduce((sum, row) => sum + row.weekday, 0) / wegoRoomRates.length,
);

export default function DashboardPage() {
  return (
    <DashboardShell
      title="대시보드"
      description="Wegoinn Hostel의 현재 평단가, 룸타입별 주중/주말 가격, 12개월 가격 흐름입니다."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="현재 평단가" value={formatKrw(wegoAverageRate)} change="7개 룸타입 평균" icon={DollarSign} />
        <MetricCard title="주중 평균가" value={formatKrw(weekdayAverage)} change="월-목 기준" icon={CalendarDays} />
        <MetricCard title="주말 평균가" value={formatKrw(weekendAverage)} change="금-토 기준" icon={TrendingUp} />
        <MetricCard title="주말 프리미엄" value={formatPercent(((weekendAverage - weekdayAverage) / weekdayAverage) * 100)} change="평일 대비" icon={CloudSun} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
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

        <Card>
          <CardHeader>
            <CardTitle>객실 타입별 오늘 가격</CardTitle>
            <CardDescription>사용자가 제공한 Wegoinn 룸타입 기준입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {wegoRoomRates.map((room) => (
              <div key={room.roomType} className="flex items-center justify-between rounded-lg border bg-secondary/35 p-3">
                <div>
                  <p className="text-sm font-medium">{room.roomType}</p>
                  <p className="text-xs text-muted-foreground">
                    평일 {formatKrw(room.weekday)} · 주말 {formatKrw(room.weekend)}
                  </p>
                </div>
                <Badge tone="green">{formatKrw(room.today)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Wegoinn Hostel 월별 가격 흐름</CardTitle>
          <CardDescription>2026년 1월부터 12월까지 주중, 주말, 평단가 추정 흐름입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <WegoinnMonthlyRateChart data={wegoMonthlyRates} />
        </CardContent>
      </Card>
    </DashboardShell>
  );
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
