import {
  aiInsights,
  marketAverageAdr,
  newsEvents,
  pricingHistory,
  tourismTrend,
  wegoAverageRate,
  wegoRoomRates,
  wegoWeeklyRates,
} from "../../lib/market-data";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Env = {
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
};

type PagesContext<Bindings> = {
  request: Request;
  env: Bindings;
};

export const onRequestPost = async ({ request, env }: PagesContext<Env>) => {
  if (!env.OPENAI_API_KEY) {
    return jsonResponse({ error: "OPENAI_API_KEY is not configured." }, 500);
  }

  const payload = await request.json().catch(() => null) as { messages?: ChatMessage[] } | null;
  const messages = (payload?.messages ?? [])
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-10);

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return jsonResponse({ error: "A user message is required." }, 400);
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a concise Korean assistant for Wegoinn Hostel's pricing dashboard. Answer only from the provided dashboard context. If the user asks for information not present in the context, say that the dashboard data does not include it yet. Focus on daily notes, pricing, demand, competitor movement, and action items.",
        },
        {
          role: "user",
          content: JSON.stringify({
            today: new Date().toISOString().slice(0, 10),
            dashboardContext: buildDashboardContext(),
          }),
        },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return jsonResponse({ error: "OpenAI request failed.", detail }, 502);
  }

  const result = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return jsonResponse({ reply: result.choices?.[0]?.message?.content ?? "답변을 생성하지 못했습니다." });
};

function buildDashboardContext() {
  return {
    wegoinn: {
      averageRate: wegoAverageRate,
      roomRates: wegoRoomRates,
      weeklyRates: wegoWeeklyRates,
    },
    market: {
      averageAdr: marketAverageAdr,
      recentPricingRows: pricingHistory.slice(-20),
    },
    tourismTrend,
    newsEvents,
    aiInsights,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
