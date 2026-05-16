import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/shell";
import { settingsRows } from "@/lib/market-data";

const settingsKo: Record<string, [string, string, string]> = {
  Spreadsheet: ["스프레드시트", "Google Sheets를 데이터베이스로 사용", "서비스 계정 연결"],
  "Pricing scrape": ["가격 스크래핑", "Agoda 경쟁사 가격 매일 확인", "GitHub Actions 스케줄"],
  "AI analysis": ["AI 분석", "OpenAI 일일 요약", "ai_insights에 저장"],
  "Room reference": ["객실 기준", "wegoinn.com/roomtype.html", "7개 Wegoinn 룸타입 추적"],
};

export default function SettingsPage() {
  return (
    <DashboardShell
      title="설정"
      description="데이터 소스, 자동화, AI 분석 기준을 한 페이지에서 확인합니다."
    >
      <Card>
        <CardHeader>
          <CardTitle>자동화 설정</CardTitle>
          <CardDescription>GitHub Actions, Google Sheets, AI 요약을 사용하는 운영 구조입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">항목</th>
                  <th>설명</th>
                  <th className="text-right">상태</th>
                </tr>
              </thead>
              <tbody>
                {settingsRows.map(([key]) => {
                  const row = settingsKo[key] ?? [key, "", ""];

                  return (
                    <tr key={key} className="border-b border-border/60">
                      <td className="py-3 font-medium">{row[0]}</td>
                      <td className="text-muted-foreground">{row[1]}</td>
                      <td className="text-right"><Badge tone="green">{row[2]}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
