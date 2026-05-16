"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  ChartCandlestick,
  Newspaper,
  Settings,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { href: "/", label: "대시보드", icon: Activity },
  { href: "/competitor-pricing", label: "경쟁사 가격", icon: ChartCandlestick },
  { href: "/tourism-trends", label: "관광수요", icon: TrendingUp },
  { href: "/industry-news", label: "업계뉴스", icon: Newspaper },
  { href: "/ai-insights", label: "AI 인사이트", icon: Bot },
  { href: "/settings", label: "설정", icon: Settings },
];

export function DashboardShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ChartCandlestick className="h-4 w-4 text-primary" />
            서울 호스텔 마켓 대시보드
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex h-9 w-fit rounded-md border bg-secondary p-1">
          <button className="rounded px-3 text-xs font-medium text-muted-foreground" type="button">
            English
          </button>
          <button className="rounded bg-primary px-3 text-xs font-medium text-primary-foreground" type="button">
            한국어
          </button>
        </div>
      </header>

      <nav className="flex gap-2 overflow-x-auto rounded-lg border bg-card p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </main>
  );
}
