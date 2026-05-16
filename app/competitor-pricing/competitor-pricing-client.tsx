"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompetitorRoomSelectionChart } from "@/components/dashboard/charts";
import {
  getCompetitorRoomMonthlyHistory,
  getCompetitorRoomRates,
  marketAverageAdr,
  roomTypes,
  seoulCompetitors,
  wegoAverageRate,
  wegoMonthlyRates,
  wegoRoomRates,
  type RoomType,
} from "@/lib/market-data";
import { formatKrw } from "@/lib/utils";

export function CompetitorPricingClient() {
  const [competitorName, setCompetitorName] = useState(seoulCompetitors[0].name);
  const [selectedRooms, setSelectedRooms] = useState<RoomType[]>(["더블", "패밀리", "트윈배드"]);

  const competitor = seoulCompetitors.find((item) => item.name === competitorName) ?? seoulCompetitors[0];
  const roomRates = useMemo(() => getCompetitorRoomRates(competitor.name), [competitor.name]);
  const chartData = useMemo(() => {
    const selectedData = getCompetitorRoomMonthlyHistory(competitor.name, selectedRooms);

    return selectedData.map((row, index) => ({
      ...row,
      "Wegoinn Hostel": wegoMonthlyRates[index].average,
    }));
  }, [competitor.name, selectedRooms]);

  function toggleRoom(roomType: RoomType) {
    setSelectedRooms((current) => {
      if (current.includes(roomType)) {
        return current.length === 1 ? current : current.filter((room) => room !== roomType);
      }

      return [...current, roomType];
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard title="시장 평균 객단가" value={formatKrw(marketAverageAdr)} caption="30개 경쟁 숙소 평균" />
        <MetricCard title="Wegoinn Hostel 평단가" value={formatKrw(wegoAverageRate)} caption="비교 기준" />
        <MetricCard title="시장 대비 Wegoinn" value={formatKrw(wegoAverageRate - marketAverageAdr)} caption="양수는 시장보다 높은 가격" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>경쟁업체 선택</CardTitle>
          <CardDescription>서울 주요 호스텔/게스트하우스 30곳 중 하나를 선택해 룸타입별 가격을 비교합니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            <label className="text-sm font-medium" htmlFor="competitor">
              경쟁업체
            </label>
            <select
              id="competitor"
              value={competitor.name}
              onChange={(event) => setCompetitorName(event.target.value)}
              className="h-10 w-full rounded-md border bg-secondary px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            >
              {seoulCompetitors.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <div className="rounded-md border bg-secondary/35 p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{competitor.name}</p>
              <p className="mt-1">지역: {competitor.area}</p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {roomRates.map((room) => {
              const wego = wegoRoomRates.find((item) => item.roomType === room.roomType);
              const gap = wego ? room.average - wego.today : 0;

              return (
                <a
                  key={room.roomType}
                  href={competitor.bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border bg-secondary/25 p-3 transition-colors hover:border-primary/60 hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`${competitor.name} ${room.roomType} 예약 페이지 열기`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{room.roomType}</p>
                    <Badge tone={gap > 0 ? "green" : "amber"}>{gap > 0 ? "+" : ""}{formatKrw(gap)}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">주중 {formatKrw(room.weekday)}</p>
                  <p className="text-xs text-muted-foreground">주말 {formatKrw(room.weekend)}</p>
                  <p className="mt-2 text-xs text-primary">Wegoinn {wego ? formatKrw(wego.today) : "-"}</p>
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>그래프 룸타입</CardTitle>
            <CardDescription>체크한 룸타입만 월별 그래프에 표시합니다.</CardDescription>
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
            <CardTitle>{competitor.name} 월별 룸타입 가격</CardTitle>
            <CardDescription>선택 룸타입별 월별 금액과 Wegoinn Hostel 평단가를 항상 함께 표시합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <CompetitorRoomSelectionChart data={chartData} series={selectedRooms} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({ title, value, caption }: { title: string; value: string; caption: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
        <p className="mt-1 text-sm text-primary">{caption}</p>
      </CardContent>
    </Card>
  );
}
