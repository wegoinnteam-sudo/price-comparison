import "dotenv/config";
import OpenAI from "openai";
import { sheetNames } from "../lib/automation/config";
import { appendUniqueRows, readSheet } from "../lib/automation/sheets";

const pricingHeaders = ["date", "competitor", "room_type", "ota_platform", "day_type", "price", "source_url"];
const insightHeaders = ["date", "summary", "pricing_recommendations", "alerts", "model"];

export async function generateAiInsights() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const pricingRows = await readSheet(sheetNames.pricingHistory, pricingHeaders);
  const recentRows = pricingRows.slice(-80);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are an analyst for a small Seoul hostel owner. Be concise, practical, and focus on room pricing, demand, and competitor movement.",
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "Generate daily hostel market insights.",
          roomTypes: [
            "Single Room",
            "Double Room",
            "Twin Bunk Room",
            "Twin Room",
            "Triple Room",
            "Family Room",
            "Deluxe Family Room",
          ],
          pricingRows: recentRows,
          requiredOutput:
            "Return JSON with summary, pricingRecommendations, and alerts. Keep each field under 700 characters.",
        }),
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message.content ?? "{}";
  const parsed = JSON.parse(content) as {
    summary?: string;
    pricingRecommendations?: string;
    alerts?: string;
  };

  const result = await appendUniqueRows(
    sheetNames.aiInsights,
    insightHeaders,
    [[new Date().toISOString().slice(0, 10), parsed.summary ?? "", parsed.pricingRecommendations ?? "", parsed.alerts ?? "", response.model]],
    [0],
  );

  console.log(`AI insights complete. Appended ${result.appended}, skipped ${result.skipped}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateAiInsights().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
