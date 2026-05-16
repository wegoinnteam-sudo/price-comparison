export const roomTypes = [
  "Single Room",
  "Double Room",
  "Twin Bunk Room",
  "Twin Room",
  "Triple Room",
  "Family Room",
  "Deluxe Family Room",
] as const;

export type RoomType = (typeof roomTypes)[number];

export type PricingRow = {
  date: string;
  competitor: string;
  roomType: RoomType;
  platform: "Agoda" | "Booking" | "Direct";
  dayType: "Weekday" | "Weekend";
  price: number;
};

export const pricingHistory: PricingRow[] = [
  { date: "2026-05-10", competitor: "Hostel Haru", roomType: "Single Room", platform: "Agoda", dayType: "Weekday", price: 74000 },
  { date: "2026-05-10", competitor: "Seoul Cube", roomType: "Double Room", platform: "Agoda", dayType: "Weekday", price: 89000 },
  { date: "2026-05-10", competitor: "Myeongdong Stay", roomType: "Twin Room", platform: "Agoda", dayType: "Weekday", price: 99000 },
  { date: "2026-05-11", competitor: "Hostel Haru", roomType: "Single Room", platform: "Agoda", dayType: "Weekend", price: 88000 },
  { date: "2026-05-11", competitor: "Seoul Cube", roomType: "Double Room", platform: "Agoda", dayType: "Weekend", price: 116000 },
  { date: "2026-05-11", competitor: "Myeongdong Stay", roomType: "Twin Room", platform: "Agoda", dayType: "Weekend", price: 121000 },
  { date: "2026-05-12", competitor: "Hostel Haru", roomType: "Family Room", platform: "Agoda", dayType: "Weekday", price: 168000 },
  { date: "2026-05-12", competitor: "Seoul Cube", roomType: "Triple Room", platform: "Agoda", dayType: "Weekday", price: 135000 },
  { date: "2026-05-13", competitor: "Myeongdong Stay", roomType: "Deluxe Family Room", platform: "Agoda", dayType: "Weekend", price: 218000 },
  { date: "2026-05-13", competitor: "Hostel Haru", roomType: "Twin Bunk Room", platform: "Agoda", dayType: "Weekend", price: 104000 },
  { date: "2026-05-14", competitor: "Seoul Cube", roomType: "Family Room", platform: "Agoda", dayType: "Weekday", price: 174000 },
  { date: "2026-05-14", competitor: "Myeongdong Stay", roomType: "Double Room", platform: "Agoda", dayType: "Weekday", price: 93000 },
  { date: "2026-05-15", competitor: "Hostel Haru", roomType: "Double Room", platform: "Agoda", dayType: "Weekend", price: 124000 },
  { date: "2026-05-15", competitor: "Seoul Cube", roomType: "Twin Room", platform: "Agoda", dayType: "Weekend", price: 128000 },
];

export const priceTrend = [
  { date: "May 10", weekday: 87333, weekend: 108333, market: 97833 },
  { date: "May 11", weekday: 89000, weekend: 113667, market: 101333 },
  { date: "May 12", weekday: 101500, weekend: 119000, market: 110250 },
  { date: "May 13", weekday: 104000, weekend: 137000, market: 120500 },
  { date: "May 14", weekday: 108500, weekend: 142000, market: 125250 },
  { date: "May 15", weekday: 111000, weekend: 151000, market: 131000 },
];

export const roomComparison = roomTypes.map((roomType, index) => ({
  roomType,
  market: [76000, 104000, 96000, 119000, 141000, 174000, 224000][index],
  target: [79000, 109000, 99000, 124000, 149000, 182000, 235000][index],
}));

export const tourismTrend = [
  { week: "Apr 07", japan: 72, usa: 58, china: 65, europe: 49 },
  { week: "Apr 14", japan: 75, usa: 61, china: 63, europe: 52 },
  { week: "Apr 21", japan: 78, usa: 63, china: 66, europe: 55 },
  { week: "Apr 28", japan: 84, usa: 68, china: 70, europe: 58 },
  { week: "May 05", japan: 88, usa: 73, china: 74, europe: 61 },
  { week: "May 12", japan: 92, usa: 76, china: 79, europe: 64 },
];

export const demandHeatmap = [
  ["Mon", 62, 66, 71, 69],
  ["Tue", 58, 64, 68, 72],
  ["Wed", 61, 67, 73, 77],
  ["Thu", 74, 79, 82, 84],
  ["Fri", 86, 91, 94, 96],
  ["Sat", 92, 96, 98, 99],
  ["Sun", 76, 82, 86, 88],
] as const;

export const newsEvents = [
  {
    title: "Large K-pop concert weekend in Seoul",
    category: "Event",
    impact: "High",
    summary: "Short-stay demand likely rises for Friday and Saturday arrivals near central Seoul.",
    pricing: "Lift private rooms by 8-12% if pickup continues.",
  },
  {
    title: "Japan to Korea travel searches rising",
    category: "Demand",
    impact: "Medium",
    summary: "Japanese search interest is the strongest tracked inbound signal this week.",
    pricing: "Watch double and twin rooms for late-week underpricing.",
  },
  {
    title: "Airline capacity expansion into Incheon",
    category: "Airline",
    impact: "Medium",
    summary: "More seats can support steady occupancy beyond peak weekends.",
    pricing: "Use smaller weekday increases before weekend inventory sells down.",
  },
];

export const aiInsights = [
  {
    title: "Weekend demand increasing",
    detail: "Market weekend ADR is 15.2% above weekday ADR and has risen for three tracked updates.",
    action: "Raise Double Room and Twin Room weekend floors by KRW 8,000.",
    tone: "green" as const,
  },
  {
    title: "Family inventory has pricing room",
    detail: "Deluxe family market rates are widening against standard family rooms.",
    action: "Keep Deluxe Family Room at least KRW 45,000 above Family Room.",
    tone: "blue" as const,
  },
  {
    title: "Cheapest competitor detected",
    detail: "Hostel Haru is repeatedly cheapest on single and double rooms.",
    action: "Do not match unless occupancy is below forecast by more than 10%.",
    tone: "amber" as const,
  },
];

export const settingsRows = [
  ["Spreadsheet", "Google Sheets as database", "Connected by service account"],
  ["Pricing scrape", "Agoda daily competitor check", "GitHub Actions schedule"],
  ["AI analysis", "OpenAI daily summary", "Stored in ai_insights"],
  ["Room reference", "wegoinn.com/roomtype.html", "Seven tracked room types"],
];
