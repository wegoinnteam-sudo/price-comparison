import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/shell";
import { newsEvents } from "@/lib/market-data";

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

export default function IndustryNewsPage() {
  return (
    <DashboardShell
      title="업계뉴스"
      description="숙박 가격에 영향을 줄 수 있는 이벤트, 여행 수요, 항공 공급 뉴스를 분리해 봅니다."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {newsEvents.map((event) => {
          const item = newsKo[event.title] ?? event;

          return (
            <Card key={event.title}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="blue">{item.category}</Badge>
                  <Badge tone={item.impact === "높음" ? "red" : "amber"}>{item.impact}</Badge>
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="rounded-md border bg-secondary/35 p-3 text-sm text-primary">{item.pricing}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </DashboardShell>
  );
}
