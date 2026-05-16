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

const tabs = [
  ["Dashboard", Activity],
  ["Competitor Pricing", ChartCandlestick],
  ["Tourism Trends", TrendingUp],
  ["Industry News", Newspaper],
  ["AI Insights", Bot],
  ["Settings", Settings],
] as const;

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
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ChartCandlestick className="h-4 w-4 text-primary" />
            Seoul Hostel Market Desk
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
            AI-powered market dashboard
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="green">Daily automation ready</Badge>
          <Badge tone="blue">Google Sheets database</Badge>
          <Button size="sm">
            <Bell className="h-4 w-4" />
            Market alerts
          </Button>
        </div>
      </header>

      <nav className="flex gap-2 overflow-x-auto rounded-lg border bg-card p-2">
        {tabs.map(([label, Icon], index) => (
          <a
            key={label}
            href={`#${label.toLowerCase().replaceAll(" ", "-")}`}
            className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm transition-colors ${
              index === 0
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        ))}
      </nav>

      <section id="dashboard" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Market ADR" value={formatKrw(latestAverage)} change={formatPercent(7.4)} icon={DollarSign} />
        <MetricCard title="Weekend premium" value={formatPercent(((weekendAverage - weekdayAverage) / weekdayAverage) * 100)} change="vs weekday" icon={CalendarDays} />
        <MetricCard title="Cheapest competitor" value={cheapest.competitor} change={formatKrw(cheapest.price)} icon={TrendingUp} />
        <MetricCard title="Weather impact" value="Light rain" change="-3% walk-in estimate" icon={CloudSun} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
            <CardDescription>Weekday, weekend, and blended market rate movement from Agoda snapshots.</CardDescription>
          </CardHeader>
          <CardContent>
            <PriceHistoryChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI Pricing Brief</CardTitle>
            <CardDescription>Daily OpenAI summaries are stored in the ai_insights sheet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.map((insight) => (
              <div key={insight.title} className="rounded-lg border bg-secondary/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{insight.title}</p>
                  <Badge tone={insight.tone}>AI</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{insight.detail}</p>
                <p className="mt-2 text-sm text-primary">{insight.action}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="competitor-pricing" className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Room-Type Pricing Comparison</CardTitle>
            <CardDescription>Target floors compared with observed market averages.</CardDescription>
          </CardHeader>
          <CardContent>
            <RoomComparisonChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Latest Competitor Snapshots</CardTitle>
            <CardDescription>Duplicate rows are skipped by date, competitor, room type, platform, and day type.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[660px] text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2">Date</th>
                    <th>Competitor</th>
                    <th>Room</th>
                    <th>Day</th>
                    <th>Platform</th>
                    <th className="text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingHistory.slice(-8).reverse().map((row) => (
                    <tr key={`${row.date}-${row.competitor}-${row.roomType}`} className="border-b border-border/60">
                      <td className="py-3 text-muted-foreground">{row.date}</td>
                      <td>{row.competitor}</td>
                      <td>{row.roomType}</td>
                      <td><Badge tone={row.dayType === "Weekend" ? "amber" : "muted"}>{row.dayType}</Badge></td>
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
            <CardTitle>Foreign Tourism Demand</CardTitle>
            <CardDescription>Search-interest style index for Seoul and Korea travel demand.</CardDescription>
          </CardHeader>
          <CardContent>
            <TourismTrendChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Demand Heatmap</CardTitle>
            <CardDescription>Occupancy pressure estimate by day and booking window.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-[64px_repeat(4,minmax(0,1fr))] gap-2 text-xs">
              <div />
              {["0-7d", "8-14d", "15-30d", "31-60d"].map((label) => (
                <div key={label} className="text-center text-muted-foreground">{label}</div>
              ))}
              {demandHeatmap.map(([day, ...values]) => (
                <div key={day} className="contents">
                  <div key={`${day}-label`} className="flex items-center text-muted-foreground">{day}</div>
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
        {newsEvents.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <Badge tone={item.impact === "High" ? "red" : "blue"}>{item.impact}</Badge>
                <Badge tone="muted">{item.category}</Badge>
              </div>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.summary}</p>
              <p className="mt-3 text-sm text-primary">{item.pricing}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="ai-insights" className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tracked Room Types</CardTitle>
            <CardDescription>Based on the Wegoinn room type reference.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {roomTypes.map((room) => <Badge key={room} tone="muted">{room}</Badge>)}
          </CardContent>
        </Card>
        <Card id="settings">
          <CardHeader>
            <CardTitle>Automation Settings</CardTitle>
            <CardDescription>Lightweight personal workflow with GitHub Actions and Google Sheets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {settingsRows.map(([name, description, status]) => (
              <div key={name} className="flex items-center justify-between gap-3 rounded-lg border bg-secondary/35 p-3">
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <Badge tone="green">{status}</Badge>
              </div>
            ))}
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
