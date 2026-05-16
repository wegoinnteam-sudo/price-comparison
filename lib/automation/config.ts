export const spreadsheetId =
  process.env.GOOGLE_SPREADSHEET_ID ?? "1kqUpW-38Ix-jRoi5NkeTo5ANzr4JuX1eS0lfJ5HL3eg";

export const sheetNames = {
  pricingHistory: "pricing_history",
  tourismTrends: "tourism_trends",
  aiInsights: "ai_insights",
  newsEvents: "news_events",
} as const;

export const competitors = [
  {
    name: "Hostel Haru",
    platform: "Agoda",
    agodaUrl: process.env.AGODA_COMPETITOR_HOSTEL_HARU_URL ?? "",
  },
  {
    name: "Seoul Cube",
    platform: "Agoda",
    agodaUrl: process.env.AGODA_COMPETITOR_SEOUL_CUBE_URL ?? "",
  },
  {
    name: "Myeongdong Stay",
    platform: "Agoda",
    agodaUrl: process.env.AGODA_COMPETITOR_MYEONGDONG_STAY_URL ?? "",
  },
] as const;

export const trackedRoomTypes = [
  "Single Room",
  "Double Room",
  "Twin Bunk Room",
  "Twin Room",
  "Triple Room",
  "Family Room",
  "Deluxe Family Room",
] as const;
