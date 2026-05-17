import {
  aiInsights,
  marketAverageAdr,
  newsEvents,
  pricingHistory,
  tourismTrend,
  wegoAverageRate,
  wegoRoomRateSource,
  wegoRoomRates,
  wegoWeeklyRates,
} from "../../lib/market-data";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Env = {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
};

type PagesContext<Bindings> = {
  request: Request;
  env: Bindings;
};

export const onRequestPost = async ({ request, env }: PagesContext<Env>) => {
  const apiKey = env.GEMINI_API_KEY?.trim();
  const model = env.GEMINI_MODEL?.trim() || "gemini-3-flash-preview";

  if (!apiKey) {
    return jsonResponse({ error: "GEMINI_API_KEY is not configured." }, 500);
  }

  const payload = await request.json().catch(() => null) as { messages?: ChatMessage[] } | null;
  const messages = (payload?.messages ?? [])
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-10);

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return jsonResponse({ error: "A user message is required." }, 400);
  }

  let response: Response;

  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                "You are a concise Korean assistant for Wegoinn Hostel's pricing dashboard. Answer only from the provided dashboard context. If the user asks for information not present in the context, say that the dashboard data does not include it yet. Focus on daily notes, pricing, demand, competitor movement, and action items. When answering Wegoinn Hostel room-type prices, add exactly one final source line in Korean using this format: 출처: [source label](source URL).",
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify({
                  today: new Date().toISOString().slice(0, 10),
                  dashboardContext: buildDashboardContext(),
                }),
              },
            ],
          },
          ...messages.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 700,
        },
      }),
    });
  } catch (error) {
    return jsonResponse(
      {
        error: "Gemini network request failed.",
        detail: error instanceof Error ? error.message : "Unknown network error",
      },
      502,
    );
  }

  if (!response.ok) {
    const detail = await readGeminiError(response);
    return jsonResponse(
      {
        error: "Gemini request failed.",
        detail,
        status: response.status,
      },
      502,
    );
  }

  const result = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  return jsonResponse({ reply: extractGeminiText(result) ?? "답변을 생성하지 못했습니다." });
};

export const onRequestGet = async ({ env }: PagesContext<Env>) => {
  return jsonResponse({
    ok: true,
    geminiKeyConfigured: Boolean(env.GEMINI_API_KEY?.trim()),
    model: env.GEMINI_MODEL?.trim() || "gemini-3-flash-preview",
  });
};

function buildDashboardContext() {
  return {
    wegoinn: {
      averageRate: wegoAverageRate,
      roomRates: wegoRoomRates,
      roomRateSource: wegoRoomRateSource,
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

function extractGeminiText(result: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }) {
  return result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
}

async function readGeminiError(response: Response) {
  const text = await response.text();

  try {
    const parsed = JSON.parse(text) as { error?: { message?: string; status?: string; code?: number } };
    const message = parsed.error?.message ?? text;
    const status = parsed.error?.status ? ` status=${parsed.error.status}` : "";
    const code = parsed.error?.code ? ` code=${parsed.error.code}` : "";

    return `${message}${status}${code}`.trim();
  } catch {
    return text;
  }
}
