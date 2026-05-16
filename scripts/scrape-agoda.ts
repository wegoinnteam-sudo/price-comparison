import "dotenv/config";
import { chromium } from "playwright";
import { competitors, sheetNames, trackedRoomTypes } from "../lib/automation/config";
import { appendUniqueRows } from "../lib/automation/sheets";

const headers = ["date", "competitor", "room_type", "ota_platform", "day_type", "price", "source_url"];

export type ScrapedPrice = {
  date: string;
  competitor: string;
  roomType: string;
  platform: string;
  dayType: string;
  price: number;
  sourceUrl: string;
};

export async function scrapeAgodaPrices(): Promise<ScrapedPrice[]> {
  const browser = await chromium.launch({ headless: true });
  const rows: ScrapedPrice[] = [];
  const dates = getTargetDates();

  try {
    for (const competitor of competitors) {
      if (!competitor.agodaUrl) continue;

      for (const date of dates) {
        const page = await browser.newPage({ locale: "en-US" });
        const url = withAgodaDates(competitor.agodaUrl, date.date);
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForTimeout(2500);

        const text = await page.locator("body").innerText({ timeout: 15000 });
        const prices = extractKrwPrices(text);
        const roomMatches = trackedRoomTypes.filter((roomType) =>
          text.toLowerCase().includes(roomType.toLowerCase()),
        );
        const roomTypes = roomMatches.length ? roomMatches : trackedRoomTypes.slice(0, Math.min(prices.length, 3));

        roomTypes.forEach((roomType, index) => {
          const price = prices[index] ?? prices[0];
          if (!price) return;
          rows.push({
            date: date.date,
            competitor: competitor.name,
            roomType,
            platform: competitor.platform,
            dayType: date.dayType,
            price,
            sourceUrl: url,
          });
        });

        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  return rows;
}

async function main() {
  const rows = await scrapeAgodaPrices();
  const result = await appendUniqueRows(
    sheetNames.pricingHistory,
    headers,
    rows.map((row) => [
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
  console.log(`Agoda scrape complete. Appended ${result.appended}, skipped ${result.skipped}.`);
}

function getTargetDates() {
  const today = new Date();
  const weekday = nextDate(today, 2);
  const weekend = nextDate(today, 6);
  return [
    { date: isoDate(weekday), dayType: "Weekday" },
    { date: isoDate(weekend), dayType: "Weekend" },
  ];
}

function nextDate(from: Date, targetDay: number) {
  const date = new Date(from);
  const diff = (targetDay + 7 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + diff);
  return date;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function withAgodaDates(url: string, checkIn: string) {
  const checkOutDate = new Date(`${checkIn}T00:00:00Z`);
  checkOutDate.setUTCDate(checkOutDate.getUTCDate() + 1);
  const parsed = new URL(url);
  parsed.searchParams.set("checkIn", checkIn);
  parsed.searchParams.set("los", "1");
  parsed.searchParams.set("rooms", "1");
  parsed.searchParams.set("adults", "2");
  parsed.searchParams.set("children", "0");
  parsed.searchParams.set("currencyCode", "KRW");
  parsed.searchParams.set("checkOut", isoDate(checkOutDate));
  return parsed.toString();
}

function extractKrwPrices(text: string) {
  const matches = text.match(/(?:₩|KRW)\s?[\d,]+/gi) ?? [];
  return [...new Set(matches)]
    .map((match) => Number(match.replace(/[^\d]/g, "")))
    .filter((price) => price >= 20000 && price <= 600000)
    .slice(0, 12);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
