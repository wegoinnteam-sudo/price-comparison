import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/shell";
import { TourismTrendChart } from "@/components/dashboard/charts";
import { demandHeatmap } from "@/lib/market-data";

const weekdayKo: Record<string, string> = {
  Mon: "월",
  Tue: "화",
  Wed: "수",
  Thu: "목",
  Fri: "금",
  Sat: "토",
  Sun: "일",
};

export default function TourismTrendsPage() {
  return (
    <DashboardShell
      title="관광수요"
      description="서울 인바운드 관광 수요와 요일별 예약 압력을 따로 확인합니다."
    >
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>외국인 관광 수요</CardTitle>
            <CardDescription>서울 및 한국 여행 검색 관심도 기반 수요 지표입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <TourismTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>수요 히트맵</CardTitle>
            <CardDescription>요일과 예약 리드타임별 객실 수요 압력 추정치입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div />
              {["7일", "14일", "21일", "30일"].map((label) => (
                <div key={label} className="text-muted-foreground">{label}</div>
              ))}
              {demandHeatmap.flatMap(([day, ...values]) => [
                <div key={`${day}-label`} className="flex items-center justify-center rounded-md bg-secondary px-2 py-3 font-medium">
                  {weekdayKo[day]}
                </div>,
                ...values.map((value, index) => (
                  <div
                    key={`${day}-${index}`}
                    className="rounded-md border px-2 py-3 font-medium text-foreground"
                    style={{ backgroundColor: `rgba(20, 184, 166, ${Number(value) / 140})` }}
                  >
                    {value}
                  </div>
                )),
              ])}
            </div>
          </CardContent>
        </Card>
      </section>
    </DashboardShell>
  );
}
