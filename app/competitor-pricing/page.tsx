import { DashboardShell } from "@/components/dashboard/shell";
import { CompetitorPricingClient } from "./competitor-pricing-client";

export default function CompetitorPricingPage() {
  return (
    <DashboardShell
      title="경쟁사 가격"
      description="시장 평균 객단가, 경쟁사 30곳의 룸타입별 주중/주말 가격, Wegoinn Hostel 대비 월별 가격 흐름입니다."
    >
      <CompetitorPricingClient />
    </DashboardShell>
  );
}
