import "dotenv/config";
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import {
  skyscannerDefaults,
  skyscannerHotelMappings,
  type SkyscannerHotelMapping,
} from "../lib/automation/config";

export type SkyscannerPriceRow = {
  capturedDate: string;
  competitor: string;
  entityId: string;
  checkin: string;
  checkout: string;
  adults: number;
  rooms: number;
  lowestPrice: number | "";
  sourceUrl: string;
  status: "found" | "not_found" | "error";
  note: string;
};

export async function scrapeSkyscannerPrices(checkin = defaultCheckinDate()) {
  if (!skyscannerHotelMappings.length) {
    console.warn("SKYSCANNER_HOTEL_ENTITY_IDS is empty. Skipping Skyscanner scrape.");
    return [];
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: findChromiumExecutable(),
  });

  try {
    const page = await browser.newPage({
      locale: "ko-KR",
      timezoneId: "Asia/Seoul",
    });

    const rows: SkyscannerPriceRow[] = [];

    for (const mapping of skyscannerHotelMappings) {
      const adults = mapping.adults ?? skyscannerDefaults.adults;
      const rooms = mapping.rooms ?? skyscannerDefaults.rooms;
      const checkout = addDays(checkin, skyscannerDefaults.nights);
      const sourceUrl = buildSkyscannerHotelUrl(mapping, checkin, checkout, adults, rooms);

      try {
        await page.goto(sourceUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForTimeout(8000);

        const text = await page.locator("body").innerText({ timeout: 10000 }).catch(() => "");
        const prices = extractKrwPrices(text);
        const lowestPrice = prices.length ? Math.min(...prices) : "";

        rows.push({
          capturedDate: new Date().toISOString(),
          competitor: mapping.name,
          entityId: mapping.entityId,
          checkin,
          checkout,
          adults,
          rooms,
          lowestPrice,
          sourceUrl,
          status: lowestPrice ? "found" : "not_found",
          note: lowestPrice ? "Skyscanner search-result URL; user approved search-result URL." : "No KRW price found in rendered page text.",
        });
      } catch (error) {
        rows.push({
          capturedDate: new Date().toISOString(),
          competitor: mapping.name,
          entityId: mapping.entityId,
          checkin,
          checkout,
          adults,
          rooms,
          lowestPrice: "",
          sourceUrl,
          status: "error",
          note: error instanceof Error ? error.message : "Unknown Skyscanner scrape error.",
        });
      }
    }

    return rows;
  } finally {
    await browser.close();
  }
}

function buildSkyscannerHotelUrl(
  mapping: SkyscannerHotelMapping,
  checkin: string,
  checkout: string,
  adults: number,
  rooms: number,
) {
  const params = new URLSearchParams({
    entity_id: mapping.entityId,
    checkin,
    checkout,
    adults: String(adults),
    rooms: String(rooms),
  });

  return `https://www.skyscanner.co.kr/hotels/search?${params.toString()}`;
}

function extractKrwPrices(text: string) {
  const matches = text.match(/(?:₩|KRW|원)\s?[\d,]+|[\d,]+\s?원/g) ?? [];

  return matches
    .map((value) => Number(value.replace(/[^\d]/g, "")))
    .filter((price) => price >= 10000 && price <= 2000000);
}

function defaultCheckinDate() {
  const envDate = process.env.SKYSCANNER_CHECKIN_DATE;
  if (envDate) return envDate;

  const date = new Date();
  date.setDate(date.getDate() + skyscannerDefaults.checkinDaysAhead);
  return formatDate(date);
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function findChromiumExecutable() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    "/nix/store/lpdrfl6n16q5zdf8acp4bni7yczzcx3h-idx-builtins/bin/chromium",
    "/nix/store/lpdrfl6n16q5zdf8acp4bni7yczzcx3h-idx-builtins/bin/chromium-browser",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean) as string[];

  return candidates.find((path) => existsSync(path));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeSkyscannerPrices()
    .then((rows) => {
      console.table(rows);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
