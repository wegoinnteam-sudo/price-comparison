"use client";

import {
  Activity,
  Bell,
  Bot,
  CalendarDays,
  ChartCandlestick,
  CloudSun,
  DollarSign,
  Newspaper,
  Settings,
  TrendingUp,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceHistoryChart, RoomComparisonChart, TourismTrendChart } from "@/components/dashboard/charts";
import {
  aiInsights,
  demandHeatmap,
  newsEvents,
  pricingHistory,
  roomTypes,
  settingsRows,
} from "@/lib/market-data";
import { formatKrw, formatPercent } from "@/lib/utils";

const tabIcons = [
  ["dashboard", Activity],
  ["competitorPricing", ChartCandlestick],
  ["tourismTrends", TrendingUp],
  ["industryNews", Newspaper],
  ["aiInsights", Bot],
  ["settings", Settings],
] as const;

const copy = {
  en: {
    brand: "Seoul Hostel Market Desk",
    title: "AI-powered market dashboard",
    ready: "Daily automation ready",
    database: "Google Sheets database",
    alerts: "Market alerts",
    tabs: {
      dashboard: "Dashboard",
      competitorPricing: "Competitor Pricing",
      tourismTrends: "Tourism Trends",
      industryNews: "Industry News",
      aiInsights: "AI Insights",
      settings: "Settings",
    },
    metrics: {
      marketAdr: "Market ADR",
      weekendPremium: "Weekend premium",
      cheapestCompetitor: "Cheapest competitor",
      weatherImpact: "Weather impact",
      vsWeekday: "vs weekday",
      lightRain: "Light rain",
      walkIn: "-3% walk-in estimate",
    },
    sections: {
      priceHistory: "Price History",
      priceHistoryDesc: "Weekday, weekend, and blended market rate movement from Agoda snapshots.",
      aiBrief: "AI Pricing Brief",
      aiBriefDesc: "Daily OpenAI summaries are stored in the ai_insights sheet.",
      roomComparison: "Room-Type Pricing Comparison",
      roomComparisonDesc: "Target floors compared with observed market averages.",
      snapshots: "Latest Competitor Snapshots",
      snapshotsDesc: "Duplicate rows are skipped by date, competitor, room type, platform, and day type.",
      tourismDemand: "Foreign Tourism Demand",
      tourismDemandDesc: "Search-interest style index for Seoul and Korea travel demand.",
      heatmap: "Demand Heatmap",
      heatmapDesc: "Occupancy pressure estimate by day and booking window.",
      trackedRooms: "Tracked Room Types",
      trackedRoomsDesc: "Based on the Wegoinn room type reference.",
      automation: "Automation Settings",
      automationDesc: "Lightweight personal workflow with GitHub Actions and Google Sheets.",
    },
    table: {
      date: "Date",
      competitor: "Competitor",
      room: "Room",
      day: "Day",
      platform: "Platform",
      price: "Price",
    },
    language: {
      english: "English",
      korean: "한국어",
    },
  },
  ko: {
    brand: "서울 호스텔 마켓 대시보드",
    title: "AI 기반 시장 관리 대시보드",
    ready: "매일 자동 업데이트 준비됨",
    database: "Google Sheets 데이터베이스",
    alerts: "시장 알림",
    tabs: {
      dashboard: "대시보드",
      competitorPricing: "경쟁사 가격",
      tourismTrends: "관광 수요",
      industryNews: "업계 뉴스",
      aiInsights: "AI 인사이트",
      settings: "설정",
    },
    metrics: {
      marketAdr: "시장 평균 객단가",
      weekendPremium: "주말 프리미엄",
      cheapestCompetitor: "최저가 경쟁사",
      weatherImpact: "날씨 영향",
      vsWeekday: "평일 대비",
      lightRain: "약한 비",
      walkIn: "워크인 수요 -3% 예상",
    },
    sections: {
      priceHistory: "가격 히스토리",
      priceHistoryDesc: "Agoda 스냅샷 기준 평일, 주말, 전체 시장 가격 흐름입니다.",
      aiBrief: "AI 가격 브리핑",
      aiBriefDesc: "OpenAI가 생성한 일일 요약은 ai_insights 시트에 저장됩니다.",
      roomComparison: "객실 타입별 가격 비교",
      roomComparisonDesc: "시장 평균 가격과 추천 기준가를 비교합니다.",
      snapshots: "최근 경쟁사 가격",
      snapshotsDesc: "날짜, 경쟁사, 객실 타입, 플랫폼, 평일/주말 기준으로 중복 행을 건너뜁니다.",
      tourismDemand: "외국인 관광 수요",
      tourismDemandDesc: "서울 및 한국 여행 검색 관심도를 추적하는 수요 지표입니다.",
      heatmap: "수요 히트맵",
      heatmapDesc: "요일과 예약 기간별 객실 수요 압력 추정치입니다.",
      trackedRooms: "추적 객실 타입",
      trackedRoomsDesc: "Wegoinn 객실 타입 기준으로 추적합니다.",
      automation: "자동화 설정",
      automationDesc: "GitHub Actions와 Google Sheets를 사용하는 가벼운 개인용 워크플로입니다.",
    },
    table: {
      date: "날짜",
      competitor: "경쟁사",
      room: "객실",
      day: "구분",
      platform: "플랫폼",
      price: "가격",
    },
    language: {
      english: "English",
      korean: "한국어",
    },
  },
} as const;

const roomTypeKo: Record<string, string> = {
  "Single Room": "싱글룸",
  "Double Room": "더블룸",
  "Twin Bunk Room": "트윈 벙크룸",
  "Twin Room": "트윈룸",
  "Triple Room": "트리플룸",
  "Family Room": "패밀리룸",
  "Deluxe Family Room": "디럭스 패밀리룸",
};

const dayTypeKo: Record<string, string> = {
  Weekday: "평일",
  Weekend: "주말",
};

const weekdayKo: Record<string, string> = {
  Mon: "월",
  Tue: "화",
  Wed: "수",
  Thu: "목",
  Fri: "금",
  Sat: "토",
  Sun: "일",
};

const aiInsightKo: Record<string, { title: string; detail: string; action: string }> = {
  "Weekend demand increasing": {
    title: "주말 수요 증가",
    detail: "시장 주말 ADR이 평일보다 15.2% 높고, 최근 세 번의 업데이트에서 계속 상승했습니다.",
    action: "더블룸과 트윈룸 주말 최저가를 8,000원 올리는 것을 권장합니다.",
  },
  "Family inventory has pricing room": {
    title: "패밀리 객실 가격 여력 있음",
    detail: "디럭스 패밀리룸과 일반 패밀리룸의 시장 가격 차이가 커지고 있습니다.",
    action: "디럭스 패밀리룸은 패밀리룸보다 최소 45,000원 높게 유지하세요.",
  },
  "Cheapest competitor detected": {
    title: "최저가 경쟁사 감지",
    detail: "Hostel Haru가 싱글룸과 더블룸에서 반복적으로 최저가를 보이고 있습니다.",
    action: "예상 점유율보다 10% 이상 낮지 않다면 무리하게 가격을 맞추지 마세요.",
  },
};

const newsKo: Record<string, { title: string; category: string; impact: string; summary: string; pricing: string }> = {
  "Large K-pop concert weekend in Seoul": {
    title: "서울 대형 K-pop 콘서트 주말",
    category: "이벤트",
    impact: "높음",
    summary: "서울 중심부의 금요일, 토요일 단기 숙박 수요가 증가할 가능성이 큽니다.",
    pricing: "예약 속도가 유지되면 개인실 가격을 8-12% 인상하세요.",
  },
  "Japan to Korea travel searches rising": {
    title: "일본발 한국 여행 검색 증가",
    category: "수요",
    impact: "중간",
    summary: "이번 주 추적 시장 중 일본 검색 관심도가 가장 강한 인바운드 신호입니다.",
    pricing: "더블룸과 트윈룸의 주말 저가 판매 여부를 확인하세요.",
  },
  "Airline capacity expansion into Incheon": {
    title: "인천행 항공 공급 확대",
    category: "항공",
    impact: "중간",
    summary: "좌석 공급 증가는 피크 주말 외에도 안정적인 점유율을 뒷받침할 수 있습니다.",
    pricing: "주말 재고가 빠지기 전에는 평일 가격을 소폭 인상하는 방식이 적절합니다.",
  },
};

const settingsKo: Record<string, [string, string, string]> = {
  Spreadsheet: ["스프레드시트", "Google Sheets를 데이터베이스로 사용", "서비스 계정 연결"],
  "Pricing scrape": ["가격 스크래핑", "Agoda 경쟁사 가격 매일 확인", "GitHub Actions 스케줄"],
  "AI analysis": ["AI 분석", "OpenAI 일일 요약", "ai_insights에 저장"],
  "Room reference": ["객실 기준", "wegoinn.com/roomtype.html", "7개 객실 타입 추적"],
};

const latestAverage =
  pricingHistory.reduce((sum, row) => sum + row.price, 0) / pricingHistory.length;
const cheapest = pricingHistory.reduce((min, row) => (row.price < min.price ? row : min));
const weekendAverage =
  pricingHistory.filter((row) => row.dayType === "Weekend").reduce((sum, row) => sum + row.price, 0) /
  pricingHistory.filter((row) => row.dayType === "Weekend").length;
const weekdayAverage =
  pricingHistory.filter((row) => row.dayType === "Weekday").reduce((sum, row) => sum + row.price, 0) /
  pricingHistory.filter((row) => row.dayType === "Weekday").length;

export default function Home() {
  const [language, setLanguage] = useState<keyof typeof copy>("en");
  const t = copy[language];
  const isKo = language === "ko";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ChartCandlestick className="h-4 w-4 text-primary" />
            {t.brand}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
            {t.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 rounded-md border bg-secondary p-1">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded px-3 text-xs font-medium transition-colors ${
                language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.language.english}
            </button>
            <button
              type="button"
              onClick={() => setLanguage("ko")}
              className={`rounded px-3 text-xs font-medium transition-colors ${
                language === "ko" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.language.korean}
            </button>
          </div>
          <Badge tone="green">{t.ready}</Badge>
          <Badge tone="blue">{t.database}</Badge>
          <Button size="sm">
            <Bell className="h-4 w-4" />
            {t.alerts}
          </Button>
        </div>
      </header>

      <nav className="flex gap-2 overflow-x-auto rounded-lg border bg-card p-2">
        {tabIcons.map(([key, Icon], index) => (
          <a
            key={key}
            href={`#${key === "competitorPricing" ? "competitor-pricing" : key === "tourismTrends" ? "tourism-trends" : key === "industryNews" ? "industry-news" : key === "aiInsights" ? "ai-insights" : key}`}
            className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm transition-colors ${
              index === 0
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {t.tabs[key]}
          </a>
        ))}
      </nav>

      <section id="dashboard" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title={t.metrics.marketAdr} value={formatKrw(latestAverage)} change={formatPercent(7.4)} icon={DollarSign} />
        <MetricCard title={t.metrics.weekendPremium} value={formatPercent(((weekendAverage - weekdayAverage) / weekdayAverage) * 100)} change={t.metrics.vsWeekday} icon={CalendarDays} />
        <MetricCard title={t.metrics.cheapestCompetitor} value={cheapest.competitor} change={formatKrw(cheapest.price)} icon={TrendingUp} />
        <MetricCard title={t.metrics.weatherImpact} value={t.metrics.lightRain} change={t.metrics.walkIn} icon={CloudSun} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t.sections.priceHistory}</CardTitle>
            <CardDescription>{t.sections.priceHistoryDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <PriceHistoryChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.sections.aiBrief}</CardTitle>
            <CardDescription>{t.sections.aiBriefDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.map((insight) => {
              const translated = isKo ? aiInsightKo[insight.title] : undefined;
              return (
              <div key={insight.title} className="rounded-lg border bg-secondary/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{translated?.title ?? insight.title}</p>
                  <Badge tone={insight.tone}>AI</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{translated?.detail ?? insight.detail}</p>
                <p className="mt-2 text-sm text-primary">{translated?.action ?? insight.action}</p>
              </div>
            )})}
          </CardContent>
        </Card>
      </section>

      <section id="competitor-pricing" className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t.sections.roomComparison}</CardTitle>
            <CardDescription>{t.sections.roomComparisonDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <RoomComparisonChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.sections.snapshots}</CardTitle>
            <CardDescription>{t.sections.snapshotsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[660px] text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2">{t.table.date}</th>
                    <th>{t.table.competitor}</th>
                    <th>{t.table.room}</th>
                    <th>{t.table.day}</th>
                    <th>{t.table.platform}</th>
                    <th className="text-right">{t.table.price}</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingHistory.slice(-8).reverse().map((row) => (
                    <tr key={`${row.date}-${row.competitor}-${row.roomType}`} className="border-b border-border/60">
                      <td className="py-3 text-muted-foreground">{row.date}</td>
                      <td>{row.competitor}</td>
                      <td>{isKo ? roomTypeKo[row.roomType] : row.roomType}</td>
                      <td><Badge tone={row.dayType === "Weekend" ? "amber" : "muted"}>{isKo ? dayTypeKo[row.dayType] : row.dayType}</Badge></td>
                      <td>{row.platform}</td>
                      <td className="text-right font-medium">{formatKrw(row.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="tourism-trends" className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t.sections.tourismDemand}</CardTitle>
            <CardDescription>{t.sections.tourismDemandDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <TourismTrendChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.sections.heatmap}</CardTitle>
            <CardDescription>{t.sections.heatmapDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-[64px_repeat(4,minmax(0,1fr))] gap-2 text-xs">
              <div />
              {["0-7d", "8-14d", "15-30d", "31-60d"].map((label) => (
                <div key={label} className="text-center text-muted-foreground">{label}</div>
              ))}
              {demandHeatmap.map(([day, ...values]) => (
                <div key={day} className="contents">
                  <div key={`${day}-label`} className="flex items-center text-muted-foreground">{isKo ? weekdayKo[day] : day}</div>
                  {values.map((value, index) => (
                    <div
                      key={`${day}-${index}`}
                      className="rounded-md border py-3 text-center font-medium"
                      style={{ backgroundColor: `rgba(20, 184, 166, ${value / 145})` }}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="industry-news" className="grid gap-4 lg:grid-cols-3">
        {newsEvents.map((item) => {
          const translated = isKo ? newsKo[item.title] : undefined;
          return (
          <Card key={item.title}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <Badge tone={item.impact === "High" ? "red" : "blue"}>{translated?.impact ?? item.impact}</Badge>
                <Badge tone="muted">{translated?.category ?? item.category}</Badge>
              </div>
              <CardTitle className="text-base">{translated?.title ?? item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{translated?.summary ?? item.summary}</p>
              <p className="mt-3 text-sm text-primary">{translated?.pricing ?? item.pricing}</p>
            </CardContent>
          </Card>
        )})}
      </section>

      <section id="ai-insights" className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.sections.trackedRooms}</CardTitle>
            <CardDescription>{t.sections.trackedRoomsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {roomTypes.map((room) => <Badge key={room} tone="muted">{isKo ? roomTypeKo[room] : room}</Badge>)}
          </CardContent>
        </Card>
        <Card id="settings">
          <CardHeader>
            <CardTitle>{t.sections.automation}</CardTitle>
            <CardDescription>{t.sections.automationDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {settingsRows.map(([name, description, status]) => {
              const translated = isKo ? settingsKo[name] : undefined;
              return (
              <div key={name} className="flex items-center justify-between gap-3 rounded-lg border bg-secondary/35 p-3">
                <div>
                  <p className="text-sm font-medium">{translated?.[0] ?? name}</p>
                  <p className="text-xs text-muted-foreground">{translated?.[1] ?? description}</p>
                </div>
                <Badge tone="green">{translated?.[2] ?? status}</Badge>
              </div>
            )})}
          </CardContent>
        </Card>
      </section>
    </main>
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
