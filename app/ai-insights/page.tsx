import { Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/shell";
import { aiInsights } from "@/lib/market-data";

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
    detail: "일부 경쟁사가 싱글룸과 더블룸에서 반복적으로 최저가를 보이고 있습니다.",
    action: "예상 점유율보다 10% 이상 낮지 않다면 무리하게 가격을 맞추지 마세요.",
  },
};

export default function AiInsightsPage() {
  return (
    <DashboardShell
      title="AI 인사이트"
      description="가격 조정에 바로 참고할 수 있는 AI 요약과 실행 제안을 따로 관리합니다."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {aiInsights.map((insight) => {
          const item = aiInsightKo[insight.title] ?? insight;

          return (
            <Card key={insight.title}>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.detail}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge tone={insight.tone}>추천 액션</Badge>
                <p className="rounded-md border bg-secondary/35 p-3 text-sm text-foreground">{item.action}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </DashboardShell>
  );
}
