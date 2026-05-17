"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ExternalLink, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompetitorRoomSelectionChart } from "@/components/dashboard/charts";
import {
  getCompetitorRatesByDate,
  getCompetitorRoomMonthlyHistory,
  getWegoinnRatesByDate,
  roomTypes,
  seoulCompetitors,
  wegoMonthlyRates,
  type RoomType,
} from "@/lib/market-data";
import { formatKrw } from "@/lib/utils";

type StarRating = 1 | 2 | 3 | 4 | 5;
type OtaPlatform = "Skyscanner" | "Agoda" | "Booking.com" | "Hotels.com" | "Expedia" | "Trip.com" | "Hostelworld";
type VerifiedOtaPrice = {
  ota: OtaPlatform;
  actualPrice: number | null;
  taxIncluded: boolean | null;
  refundable: boolean | null;
  breakfastIncluded: boolean | null;
  memberRate: string | null;
  directPriceUrl: string | null;
};

const starOptions: StarRating[] = [1, 2, 3, 4, 5];
const otaPlatforms: OtaPlatform[] = ["Skyscanner", "Agoda", "Booking.com", "Hotels.com", "Expedia", "Trip.com", "Hostelworld"];

export function CompetitorPricingClient() {
  const [competitorName, setCompetitorName] = useState(seoulCompetitors[0].name);
  const [selectedStarRating, setSelectedStarRating] = useState<StarRating>(seoulCompetitors[0].starRating);
  const [selectedDateValue, setSelectedDateValue] = useState("2026-05-16");
  const [selectedRooms, setSelectedRooms] = useState<RoomType[]>(["더블", "패밀리", "트윈배드"]);
  const [selectedPriceRoom, setSelectedPriceRoom] = useState<RoomType | null>(null);

  const filteredCompetitors = useMemo(
    () => seoulCompetitors.filter((item) => item.starRating === selectedStarRating),
    [selectedStarRating],
  );
  const competitor = filteredCompetitors.find((item) => item.name === competitorName) ?? filteredCompetitors[0] ?? seoulCompetitors[0];
  const selectedDate = useMemo(() => new Date(`${selectedDateValue}T00:00:00`), [selectedDateValue]);
  const selectedDateLabel = selectedDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  const competitorDateInfo = useMemo(() => getCompetitorRatesByDate(competitor.name, selectedDate), [competitor.name, selectedDate]);
  const wegoinnDateInfo = useMemo(() => getWegoinnRatesByDate(selectedDate), [selectedDate]);
  const selectedPrice = selectedPriceRoom ? competitorDateInfo.rooms.find((room) => room.roomType === selectedPriceRoom) : null;
  const selectedWegoinnPrice = selectedPriceRoom
    ? wegoinnDateInfo.rooms.find((room) => room.roomType === selectedPriceRoom)
    : null;
  const verifiedOtaPrices = useMemo(
    () => getVerifiedOtaPrices(competitor.name, selectedDateValue, selectedPrice),
    [competitor.name, selectedDateValue, selectedPrice],
  );
  const cheapestVerifiedOta = verifiedOtaPrices
    .filter((row): row is VerifiedOtaPrice & { actualPrice: number; directPriceUrl: string } =>
      row.actualPrice !== null && Boolean(row.directPriceUrl),
    )
    .sort((a, b) => a.actualPrice - b.actualPrice)[0];
  const averageGap = competitorDateInfo.average - wegoinnDateInfo.average;
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

  function selectStarRating(rating: StarRating) {
    const nextCompetitors = seoulCompetitors.filter((item) => item.starRating === rating);

    setSelectedStarRating(rating);
    setCompetitorName(nextCompetitors[0]?.name ?? seoulCompetitors[0].name);
    setSelectedPriceRoom(null);
  }

  function selectCompetitor(name: string) {
    setCompetitorName(name);
    setSelectedPriceRoom(null);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard title="선택일 Wegoinn 평단가" value={formatKrw(wegoinnDateInfo.average)} caption={selectedDateLabel} />
        <MetricCard title="선택 업체 평단가" value={formatKrw(competitorDateInfo.average)} caption={`${competitor.name} · ${competitor.starRating}성`} />
        <MetricCard title="선택 업체 대비 Wegoinn" value={formatKrw(wegoinnDateInfo.average - competitorDateInfo.average)} caption="양수는 Wegoinn이 높은 가격" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>경쟁업체 선택</CardTitle>
          <CardDescription>성급과 날짜를 선택해 해당 조건의 호스텔/호텔 가격을 Wegoinn Hostel과 비교합니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">성급</p>
              <div className="grid grid-cols-5 gap-2">
                {starOptions.map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => selectStarRating(rating)}
                    className={`h-10 rounded-md border px-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                      selectedStarRating === rating
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-secondary/25 text-foreground hover:border-primary/60 hover:bg-secondary/50"
                    }`}
                    aria-pressed={selectedStarRating === rating}
                  >
                    {rating}성
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{selectedStarRating}성 경쟁업체</p>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {filteredCompetitors.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => selectCompetitor(item.name)}
                    className={`w-full rounded-md border p-3 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                      item.name === competitor.name
                        ? "border-primary bg-primary/15 text-foreground"
                        : "bg-secondary/25 text-foreground hover:border-primary/60 hover:bg-secondary/50"
                    }`}
                    aria-pressed={item.name === competitor.name}
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{item.area} · {item.starRating}성</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="text-sm font-medium" htmlFor="price-date">
              가격 확인 날짜
            </label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="price-date"
                type="date"
                value={selectedDateValue}
                onChange={(event) => {
                  setSelectedDateValue(event.target.value);
                  setSelectedPriceRoom(null);
                }}
                className="h-10 w-full rounded-md border bg-secondary pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="rounded-md border bg-secondary/35 p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{competitor.name}</p>
              <p className="mt-1">지역: {competitor.area}</p>
              <p className="mt-1">성급: {competitor.starRating}성</p>
              <p className="mt-1">선택일: {selectedDateLabel} · {competitorDateInfo.dayType}</p>
              <p className="mt-1">검색 가능 업체: {filteredCompetitors.length}곳</p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {competitorDateInfo.rooms.map((room) => {
              const wego = wegoinnDateInfo.rooms.find((item) => item.roomType === room.roomType);
              const gap = wego ? room.selectedDateRate - wego.selectedDateRate : 0;

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
                  <p className="mt-2 text-xs text-primary">선택 업체 {formatKrw(room.selectedDateRate)}</p>
                  <p className="text-xs text-muted-foreground">Wegoinn {wego ? formatKrw(wego.selectedDateRate) : "-"}</p>
                  <p className="mt-1 text-xs text-sky-300">선택일 비교 및 검증 링크 확인</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>선택 날짜 가격 비교</CardTitle>
          <CardDescription>{selectedDateLabel} 기준 Wegoinn Hostel과 {competitor.name}의 룸타입별 금액입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">룸타입</th>
                  <th>Wegoinn</th>
                  <th>{competitor.name}</th>
                  <th className="text-right">차이</th>
                </tr>
              </thead>
              <tbody>
                {competitorDateInfo.rooms.map((room) => {
                  const wego = wegoinnDateInfo.rooms.find((item) => item.roomType === room.roomType);
                  const gap = wego ? room.selectedDateRate - wego.selectedDateRate : 0;

                  return (
                    <tr key={room.roomType} className="border-b border-border/60">
                      <td className="py-3 font-medium">{room.roomType}</td>
                      <td>{wego ? formatKrw(wego.selectedDateRate) : "-"}</td>
                      <td>{formatKrw(room.selectedDateRate)}</td>
                      <td className="text-right">
                        <Badge tone={gap > 0 ? "green" : "amber"}>{gap > 0 ? "+" : ""}{formatKrw(gap)}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 rounded-md border bg-secondary/25 p-3 text-sm text-muted-foreground">
            선택 업체 평균은 Wegoinn보다 {averageGap > 0 ? formatKrw(averageGap) : formatKrw(Math.abs(averageGap))} {averageGap > 0 ? "높습니다." : "낮습니다."}
          </div>
        </CardContent>
      </Card>

      {selectedPrice ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-xl overflow-hidden rounded-lg border bg-card shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b bg-secondary/70 p-4">
              <div>
                <p className="text-sm text-muted-foreground">선택일 가격 확인</p>
                <h2 className="mt-1 text-lg font-semibold">{competitor.name}</h2>
                <p className="mt-1 text-sm text-primary">{selectedPrice.roomType} · {selectedDateLabel}</p>
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
                <PriceBox label="Wegoinn 선택일" value={selectedWegoinnPrice ? formatKrw(selectedWegoinnPrice.selectedDateRate) : "-"} />
                <PriceBox label="선택 업체 선택일" value={formatKrw(selectedPrice.selectedDateRate)} highlight />
                <PriceBox
                  label="선택 업체 차이"
                  value={selectedWegoinnPrice ? formatKrw(selectedPrice.selectedDateRate - selectedWegoinnPrice.selectedDateRate) : "-"}
                />
              </div>

              {selectedWegoinnPrice ? (
                <div className="rounded-md border bg-secondary/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Wegoinn Hostel 비교</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {selectedDateLabel} {selectedPrice.roomType} 기준가 {formatKrw(selectedWegoinnPrice.selectedDateRate)}
                      </p>
                    </div>
                    <Badge tone={selectedPrice.selectedDateRate > selectedWegoinnPrice.selectedDateRate ? "green" : "amber"}>
                      {selectedPrice.selectedDateRate > selectedWegoinnPrice.selectedDateRate ? "+" : ""}
                      {formatKrw(selectedPrice.selectedDateRate - selectedWegoinnPrice.selectedDateRate)}
                    </Badge>
                  </div>
                </div>
              ) : null}

              <div className="rounded-md border bg-secondary/25 p-3 text-sm text-muted-foreground">
                Skyscanner 금액은 화면 읽기 실패 시 대시보드 선택일 금액을 임시로 붙입니다. 링크를 눌러 Skyscanner에서 실제 표시 금액을 다시 검수하세요.
              </div>

              <div className="rounded-md border">
                <div className="border-b bg-secondary/35 p-3">
                  <p className="text-sm font-semibold">OTA 실제 판매가 검증</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {cheapestVerifiedOta
                      ? `최저가: ${cheapestVerifiedOta.ota} ${formatKrw(cheapestVerifiedOta.actualPrice)}`
                      : "아직 실제 금액이 노출된 상세 예약 페이지가 수집되지 않았습니다."}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-xs">
                    <thead className="uppercase text-muted-foreground">
                      <tr className="border-b">
                        <th className="p-3">OTA</th>
                        <th>실제 판매가</th>
                        <th>세금 포함</th>
                        <th>취소 가능</th>
                        <th>조식</th>
                        <th>회원가</th>
                        <th className="text-right">직접 가격 확인 링크</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifiedOtaPrices.map((row) => (
                        <tr key={row.ota} className="border-b border-border/60">
                          <td className="p-3 font-medium">{row.ota}</td>
                          <td>{row.actualPrice === null ? "미수집" : formatKrw(row.actualPrice)}</td>
                          <td>{formatNullableBoolean(row.taxIncluded)}</td>
                          <td>{formatNullableBoolean(row.refundable)}</td>
                          <td>{formatNullableBoolean(row.breakfastIncluded)}</td>
                          <td>{row.memberRate ?? "미확인"}</td>
                          <td className="text-right">
                            {row.directPriceUrl ? (
                              <a
                                href={row.directPriceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-end gap-1 font-medium text-primary underline-offset-4 hover:underline"
                              >
                                직접 확인
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">상세 가격 URL 미수집</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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

function getVerifiedOtaPrices(
  competitorName: string,
  checkin: string,
  selectedPrice: { selectedDateRate: number; roomType: RoomType } | null | undefined,
): VerifiedOtaPrice[] {
  const checkout = addDays(checkin, 1);

  return otaPlatforms.map((ota) => {
    if (ota === "Skyscanner") {
      return {
        ota,
        actualPrice: selectedPrice?.selectedDateRate ?? null,
        taxIncluded: null,
        refundable: null,
        breakfastIncluded: null,
        memberRate: "화면 읽기 실패 시 임시 금액",
        directPriceUrl: buildSkyscannerUrl(competitorName, checkin, checkout),
      };
    }

    return {
      ota,
      actualPrice: null,
      taxIncluded: null,
      refundable: null,
      breakfastIncluded: null,
      memberRate: null,
      directPriceUrl: null,
    };
  });
}

function formatNullableBoolean(value: boolean | null) {
  if (value === null) return "미확인";
  return value ? "예" : "아니오";
}

function buildSkyscannerUrl(competitorName: string, checkin: string, checkout: string) {
  const entityId = skyscannerEntityIds[competitorName];
  const params = new URLSearchParams({
    checkin,
    checkout,
    adults: "2",
    rooms: "1",
  });

  if (entityId) {
    params.set("entity_id", entityId);
  } else {
    params.set("query", competitorName);
  }

  return `https://www.skyscanner.co.kr/hotels/search?${params.toString()}`;
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const skyscannerEntityIds: Record<string, string> = {
  "Wegoinn Hostel": "204216163",
};

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
