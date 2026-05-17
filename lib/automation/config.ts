export const spreadsheetId =
  process.env.GOOGLE_SPREADSHEET_ID ?? "1kqUpW-38Ix-jRoi5NkeTo5ANzr4JuX1eS0lfJ5HL3eg";

export const sheetNames = {
  pricingHistory: "pricing_history",
  skyscannerPrices: "skyscanner_prices",
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

export type SkyscannerHotelMapping = {
  name: string;
  entityId: string;
  adults?: number;
  rooms?: number;
};

export const skyscannerHotelMappings = parseSkyscannerMappings();

export const skyscannerDefaults = {
  adults: Number(process.env.SKYSCANNER_DEFAULT_ADULTS ?? "2"),
  rooms: Number(process.env.SKYSCANNER_DEFAULT_ROOMS ?? "1"),
  nights: Number(process.env.SKYSCANNER_NIGHTS ?? "1"),
  checkinDaysAhead: Number(process.env.SKYSCANNER_CHECKIN_DAYS_AHEAD ?? "10"),
};

function parseSkyscannerMappings(): SkyscannerHotelMapping[] {
  const raw = process.env.SKYSCANNER_HOTEL_ENTITY_IDS;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const name = typeof record.name === "string" ? record.name.trim() : "";
        const entityId = typeof record.entityId === "string" ? record.entityId.trim() : "";
        const adults = typeof record.adults === "number" ? record.adults : null;
        const rooms = typeof record.rooms === "number" ? record.rooms : null;

        if (!name || !entityId) return null;

        return {
          name,
          entityId,
          ...(adults === null ? {} : { adults }),
          ...(rooms === null ? {} : { rooms }),
        };
      })
      .filter((item): item is SkyscannerHotelMapping => Boolean(item));
  } catch {
    return [];
  }
}
