import "dotenv/config";
import { sheetNames } from "../lib/automation/config";
import { appendUniqueRows } from "../lib/automation/sheets";
import { scrapeAgodaPrices } from "./scrape-agoda";
import { scrapeSkyscannerPrices } from "./scrape-skyscanner";
import { generateAiInsights } from "./generate-ai-insights";

const tourismHeaders = ["date", "source", "market", "keyword", "score", "note"];
const newsHeaders = ["date", "category", "title", "source", "impact", "summary"];
const skyscannerHeaders = [
  "captured_date",
  "competitor",
  "entity_id",
  "checkin",
  "checkout",
  "adults",
  "rooms",
  "lowest_price",
  "source_url",
  "status",
  "note",
];

async function main() {
  const pricingRows = await scrapeAgodaPrices();
  await appendUniqueRows(
    sheetNames.pricingHistory,
    ["date", "competitor", "room_type", "ota_platform", "day_type", "price", "source_url"],
    pricingRows.map((row) => [
      row.date,
      row.competitor,
      row.roomType,
      row.platform,
      row.dayType,
      row.price,
      row.sourceUrl,
    ]),
    [0, 1, 2, 3, 4],
  );

  const skyscannerRows = await scrapeSkyscannerPrices();
  await appendUniqueRows(
    sheetNames.skyscannerPrices,
    skyscannerHeaders,
    skyscannerRows.map((row) => [
      row.capturedDate,
      row.competitor,
      row.entityId,
      row.checkin,
      row.checkout,
      row.adults,
      row.rooms,
      row.lowestPrice,
      row.sourceUrl,
      row.status,
      row.note,
    ]),
    [1, 2, 3, 4, 5, 6],
  );

  await appendUniqueRows(
    sheetNames.tourismTrends,
    tourismHeaders,
    buildTourismTrendRows(),
    [0, 1, 2, 3],
  );

  await appendUniqueRows(
    sheetNames.newsEvents,
    newsHeaders,
    buildNewsRows(),
    [0, 1, 2],
  );

  await generateAiInsights();
}

function buildTourismTrendRows() {
  const date = new Date().toISOString().slice(0, 10);
  return [
    [date, "manual-lightweight", "Japan", "Seoul hotel", 82, "Replace with SerpAPI/Trends source if desired."],
    [date, "manual-lightweight", "United States", "Korea travel", 71, "Daily placeholder keeps sheet schema warm."],
    [date, "manual-lightweight", "China", "Seoul travel", 76, "Use a paid trends API only if the owner needs it."],
  ];
}

function buildNewsRows() {
  const date = new Date().toISOString().slice(0, 10);
  return [
    [
      date,
      "events",
      "Daily Seoul event monitor",
      "manual-lightweight",
      "medium",
      "Add event/news API source later; AI analysis can already consume this tab.",
    ],
  ];
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
