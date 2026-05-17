"use client";

import { useMemo, useState } from "react";
import { ExternalLink, X } from "lucide-react";
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
  const [selectedPriceRoom, setSelectedPriceRoom] = useState<RoomType | null>(null);

  const competitor = seoulCompetitors.find((item) => item.name === competitorName) ?? seoulCompetitors[0];
  const roomRates = useMemo(() => getCompetitorRoomRates(competitor.name), [competitor.name]);
  const selectedPrice = selectedPriceRoom ? roomRates.find((room) => room.roomType === selectedPriceRoom) : null;
  const selectedWegoinnPrice = selectedPriceRoom
    ? wegoRoomRates.find((room) => room.roomType === selectedPriceRoom)
    : null;
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
                <button
                  key={room.roomType}
                  type="button"
                  onClick={() => setSelectedPriceRoom(room.roomType)}
                  className="rounded-md border bg-secondary/25 p-3 text-left transition-colors hover:border-primary/60 hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`${competitor.name} ${room.roomType} 가격 확인`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{room.roomType}</p>
                    <Badge tone={gap > 0 ? "green" : "amber"}>{gap > 0 ? "+" : ""}{formatKrw(gap)}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">주중 {formatKrw(room.weekday)}</p>
                  <p className="text-xs text-muted-foreground">주말 {formatKrw(room.weekend)}</p>
                  <p className="mt-2 text-xs text-primary">Wegoinn {wego ? formatKrw(wego.today) : "-"}</p>
                  <p className="mt-1 text-xs text-sky-300">가격 확인 및 OTA 열기</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedPrice ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-xl overflow-hidden rounded-lg border bg-card shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b bg-secondary/70 p-4">
              <div>
                <p className="text-sm text-muted-foreground">OTA 가격 확인</p>
                <h2 className="mt-1 text-lg font-semibold">{competitor.name}</h2>
                <p className="mt-1 text-sm text-primary">{selectedPrice.roomType}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPriceRoom(null)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="가격 확인 닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <PriceBox label="경쟁사 주중" value={formatKrw(selectedPrice.weekday)} />
                <PriceBox label="경쟁사 주말" value={formatKrw(selectedPrice.weekend)} />
                <PriceBox label="경쟁사 평균" value={formatKrw(selectedPrice.average)} highlight />
              </div>

              {selectedWegoinnPrice ? (
                <div className="rounded-md border bg-secondary/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Wegoinn Hostel 비교</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        현재 {selectedPrice.roomType} 기준가 {formatKrw(selectedWegoinnPrice.today)}
                      </p>
                    </div>
                    <Badge tone={selectedPrice.average > selectedWegoinnPrice.today ? "green" : "amber"}>
                      {selectedPrice.average > selectedWegoinnPrice.today ? "+" : ""}
                      {formatKrw(selectedPrice.average - selectedWegoinnPrice.today)}
                    </Badge>
                  </div>
                </div>
              ) : null}

              <div className="rounded-md border bg-secondary/25 p-3 text-sm text-muted-foreground">
                앱에 표시된 금액은 대시보드 추정/수집 데이터입니다. 아래 버튼으로 OTA 검색 결과를 열어 실제 판매가와 예약 가능 여부를 확인하세요.
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <a
                  href={buildRoomBookingUrl(competitor.name, selectedPrice.roomType)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                >
                  Booking에서 금액 확인
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href={buildRoomAgodaUrl(competitor.name, selectedPrice.roomType)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-secondary px-4 text-sm font-medium text-foreground hover:bg-secondary/80"
                >
                  Agoda에서 금액 확인
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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

function PriceBox({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${highlight ? "bg-primary/15" : "bg-secondary/25"}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function buildRoomBookingUrl(competitorName: string, roomType: RoomType) {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 7);

  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 1);

  const params = new URLSearchParams({
    ss: `${competitorName} ${roomType}`,
    checkin: formatBookingDate(checkIn),
    checkout: formatBookingDate(checkOut),
    group_adults: roomType.includes("패밀리") || roomType.includes("4벙크") ? "4" : "2",
    no_rooms: "1",
    group_children: "0",
    selected_currency: "KRW",
    lang: "ko-kr",
  });

  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

function buildRoomAgodaUrl(competitorName: string, roomType: RoomType) {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 7);

  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 1);

  const params = new URLSearchParams({
    text: `${competitorName} ${roomType}`,
    checkIn: formatBookingDate(checkIn),
    checkOut: formatBookingDate(checkOut),
    rooms: "1",
    adults: roomType.includes("패밀리") || roomType.includes("4벙크") ? "4" : "2",
    children: "0",
    currency: "KRW",
  });

  return `https://www.agoda.com/search?${params.toString()}`;
}

function formatBookingDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
