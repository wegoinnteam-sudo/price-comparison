export const roomTypes = [
  "싱글",
  "더블",
  "트윈벙크",
  "트윈배드",
  "패밀리",
  "4벙크배드",
  "디럭스 패밀리룸",
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

export type Competitor = {
  name: string;
  area: string;
  otaUrl: string;
  bookingUrl: string;
};

export const wegoRoomRateSource = {
  label: "Wegoinn Hostel 룸타입 기준",
  url: "https://www.wegoinn.com/roomtype.html",
};

const monthLabels = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

export const wegoRoomRates = roomTypes.map((roomType, index) => ({
  roomType,
  today: [82000, 112000, 99000, 128000, 172000, 188000, 238000][index],
  weekday: [79000, 109000, 96000, 124000, 166000, 182000, 229000][index],
  weekend: [94000, 132000, 118000, 149000, 198000, 216000, 268000][index],
  nextWeek: [84000, 116000, 104000, 132000, 178000, 194000, 246000][index],
}));

export const wegoAverageRate = Math.round(
  wegoRoomRates.reduce((sum, room) => sum + room.today, 0) / wegoRoomRates.length,
);

export const wegoMonthlyRates = monthLabels.map((month, index) => {
  const seasonal = Math.sin((index / 11) * Math.PI) * 23000;
  const weekday = Math.round(wegoAverageRate - 14000 + seasonal + index * 1300);
  const weekend = Math.round(weekday * 1.2 + 9000);

  return {
    month,
    weekday,
    weekend,
    average: Math.round((weekday * 5 + weekend * 2) / 7),
  };
});

export function getWegoinnRoomMonthlyHistory(selectedRoomTypes: RoomType[]) {
  return monthLabels.map((month, monthIndex) => {
    const row: Record<string, string | number> = { month };

    selectedRoomTypes.forEach((roomType) => {
      const roomIndex = roomTypes.indexOf(roomType);
      const room = wegoRoomRates[roomIndex];
      const seasonal = Math.sin(((monthIndex + roomIndex) / 11) * Math.PI) * 18000;
      row[roomType] = Math.round(room.today + seasonal + monthIndex * 900);
    });

    return row;
  });
}

export function getWegoinnRatesByDate(date: Date) {
  const day = date.getDay();
  const isWeekend = day === 5 || day === 6;
  const monthIndex = date.getMonth();
  const seasonal = Math.sin((monthIndex / 11) * Math.PI) * 0.1;
  const dayLift = isWeekend ? 1.08 : 0.98;
  const dateLift = 1 + ((date.getDate() % 5) - 2) * 0.01 + seasonal;

  const rooms = wegoRoomRates.map((room) => {
    const base = isWeekend ? room.weekend : room.weekday;

    return {
      ...room,
      selectedDateRate: Math.round(base * dayLift * dateLift),
    };
  });

  return {
    dayType: isWeekend ? "주말" : "주중",
    rooms,
    average: Math.round(rooms.reduce((sum, room) => sum + room.selectedDateRate, 0) / rooms.length),
  };
}

export const wegoWeeklyRates = [
  { week: "이번 주", weekday: 124000, weekend: 151000, blended: 136000 },
  { week: "다음 주", weekday: 129000, weekend: 158000, blended: 142000 },
  { week: "2주 뒤", weekday: 132000, weekend: 164000, blended: 147000 },
  { week: "3주 뒤", weekday: 128000, weekend: 155000, blended: 140000 },
];

export const seoulCompetitors: Competitor[] = [
  { name: "57 Myeongdong Hostel", area: "Myeongdong", otaUrl: "https://www.agoda.com/search?text=57%20Myeongdong%20Hostel%20Seoul", bookingUrl: "https://www.booking.com/searchresults.html?ss=57%20Myeongdong%20Hostel%20Seoul" },
  { name: "Bunk Guesthouse Hostel", area: "Hongdae", otaUrl: "https://www.agoda.com/search?text=Bunk%20Guesthouse%20Hostel%20Seoul", bookingUrl: "https://www.booking.com/searchresults.html?ss=Bunk%20Guesthouse%20Hostel%20Seoul" },
  { name: "Dream Guest House Myeongdong", area: "Myeongdong", otaUrl: "https://www.agoda.com/search?text=Dream%20Guest%20House%20Myeongdong", bookingUrl: "https://www.booking.com/searchresults.html?ss=Dream%20Guest%20House%20Myeongdong" },
  { name: "SH Seoul Hostel", area: "Hongdae", otaUrl: "https://www.agoda.com/search?text=SH%20Seoul%20Hostel", bookingUrl: "https://www.booking.com/searchresults.html?ss=SH%20Seoul%20Hostel" },
  { name: "OYO Hostel Myeongdong 1", area: "Myeongdong", otaUrl: "https://www.agoda.com/search?text=OYO%20Hostel%20Myeongdong%201", bookingUrl: "https://www.booking.com/searchresults.html?ss=OYO%20Hostel%20Myeongdong%201" },
  { name: "OYO Hostel Myeongdong 2", area: "Myeongdong", otaUrl: "https://www.agoda.com/search?text=OYO%20Hostel%20Myeongdong%202", bookingUrl: "https://www.booking.com/searchresults.html?ss=OYO%20Hostel%20Myeongdong%202" },
  { name: "OYO Hostel Myeongdong 3", area: "Myeongdong", otaUrl: "https://www.agoda.com/search?text=OYO%20Hostel%20Myeongdong%203", bookingUrl: "https://www.booking.com/searchresults.html?ss=OYO%20Hostel%20Myeongdong%203" },
  { name: "OYO Hostel Myeongdong 5", area: "Myeongdong", otaUrl: "https://www.agoda.com/search?text=OYO%20Hostel%20Myeongdong%205", bookingUrl: "https://www.booking.com/searchresults.html?ss=OYO%20Hostel%20Myeongdong%205" },
  { name: "OYO Hostel Myeongdong 6", area: "Myeongdong", otaUrl: "https://www.agoda.com/search?text=OYO%20Hostel%20Myeongdong%206", bookingUrl: "https://www.booking.com/searchresults.html?ss=OYO%20Hostel%20Myeongdong%206" },
  { name: "Step Inn Myeongdong 1", area: "Myeongdong", otaUrl: "https://www.agoda.com/search?text=Step%20Inn%20Myeongdong%201", bookingUrl: "https://www.booking.com/searchresults.html?ss=Step%20Inn%20Myeongdong%201" },
  { name: "Step Inn Myeongdong 2", area: "Myeongdong", otaUrl: "https://www.agoda.com/search?text=Step%20Inn%20Myeongdong%202", bookingUrl: "https://www.booking.com/searchresults.html?ss=Step%20Inn%20Myeongdong%202" },
  { name: "K-Grand Hostel Myeongdong", area: "Myeongdong", otaUrl: "https://www.agoda.com/search?text=K-Grand%20Hostel%20Myeongdong", bookingUrl: "https://www.booking.com/searchresults.html?ss=K-Grand%20Hostel%20Myeongdong" },
  { name: "K-Guesthouse Dongdaemun Premium", area: "Dongdaemun", otaUrl: "https://www.agoda.com/search?text=K-Guesthouse%20Dongdaemun%20Premium", bookingUrl: "https://www.booking.com/searchresults.html?ss=K-Guesthouse%20Dongdaemun%20Premium" },
  { name: "K-Stay Guesthouse Dongdaemun", area: "Dongdaemun", otaUrl: "https://www.agoda.com/search?text=K-Stay%20Guesthouse%20Dongdaemun", bookingUrl: "https://www.booking.com/searchresults.html?ss=K-Stay%20Guesthouse%20Dongdaemun" },
  { name: "G Guesthouse Itaewon", area: "Itaewon", otaUrl: "https://www.agoda.com/search?text=G%20Guesthouse%20Itaewon%20Seoul", bookingUrl: "https://www.booking.com/searchresults.html?ss=G%20Guesthouse%20Itaewon%20Seoul" },
  { name: "Insadong R Guesthouse", area: "Jongno", otaUrl: "https://www.agoda.com/search?text=Insadong%20R%20Guesthouse", bookingUrl: "https://www.booking.com/searchresults.html?ss=Insadong%20R%20Guesthouse" },
  { name: "Stay Maru Jongno", area: "Jongno", otaUrl: "https://www.agoda.com/search?text=Stay%20Maru%20Jongno", bookingUrl: "https://www.booking.com/searchresults.html?ss=Stay%20Maru%20Jongno" },
  { name: "Seoul Cube Jongro", area: "Jongno", otaUrl: "https://www.agoda.com/search?text=Seoul%20Cube%20Jongro", bookingUrl: "https://www.booking.com/searchresults.html?ss=Seoul%20Cube%20Jongro" },
  { name: "ZZZip Guesthouse Hongdae", area: "Hongdae", otaUrl: "https://www.agoda.com/search?text=ZZZip%20Guesthouse%20Hongdae", bookingUrl: "https://www.booking.com/searchresults.html?ss=ZZZip%20Guesthouse%20Hongdae" },
  { name: "Dreaming Hostel Sinchon Hongdae", area: "Sinchon", otaUrl: "https://www.agoda.com/search?text=Dreaming%20Hostel%20Sinchon%20Hongdae", bookingUrl: "https://www.booking.com/searchresults.html?ss=Dreaming%20Hostel%20Sinchon%20Hongdae" },
  { name: "All Stay Hostel", area: "Jongno", otaUrl: "https://www.agoda.com/search?text=All%20Stay%20Hostel%20Seoul", bookingUrl: "https://www.booking.com/searchresults.html?ss=All%20Stay%20Hostel%20Seoul" },
  { name: "Seoulite Inn Myeongdong", area: "Myeongdong", otaUrl: "https://www.agoda.com/search?text=Seoulite%20Inn%20Myeongdong", bookingUrl: "https://www.booking.com/searchresults.html?ss=Seoulite%20Inn%20Myeongdong" },
  { name: "Be My Guesthouse Myeongdong", area: "Myeongdong", otaUrl: "https://www.agoda.com/search?text=Be%20My%20Guesthouse%20Myeongdong", bookingUrl: "https://www.booking.com/searchresults.html?ss=Be%20My%20Guesthouse%20Myeongdong" },
  { name: "Hi Jun Guesthouse", area: "Hongdae", otaUrl: "https://www.agoda.com/search?text=Hi%20Jun%20Guesthouse%20Seoul", bookingUrl: "https://www.booking.com/searchresults.html?ss=Hi%20Jun%20Guesthouse%20Seoul" },
  { name: "Hongdae Guesthouse Cocon Stay", area: "Hongdae", otaUrl: "https://www.agoda.com/search?text=Hongdae%20Guesthouse%20Cocon%20Stay", bookingUrl: "https://www.booking.com/searchresults.html?ss=Hongdae%20Guesthouse%20Cocon%20Stay" },
  { name: "Hostel Korea Original", area: "Jongno", otaUrl: "https://www.agoda.com/search?text=Hostel%20Korea%20Original%20Seoul", bookingUrl: "https://www.booking.com/searchresults.html?ss=Hostel%20Korea%20Original%20Seoul" },
  { name: "Time Travelers Party Hostel", area: "Hongdae", otaUrl: "https://www.agoda.com/search?text=Time%20Travelers%20Party%20Hostel%20Seoul", bookingUrl: "https://www.booking.com/searchresults.html?ss=Time%20Travelers%20Party%20Hostel%20Seoul" },
  { name: "Seoul Station R Guesthouse", area: "Seoul Station", otaUrl: "https://www.agoda.com/search?text=Seoul%20Station%20R%20Guesthouse", bookingUrl: "https://www.booking.com/searchresults.html?ss=Seoul%20Station%20R%20Guesthouse" },
  { name: "Philstay Myeongdong", area: "Myeongdong", otaUrl: "https://www.agoda.com/search?text=Philstay%20Myeongdong", bookingUrl: "https://www.booking.com/searchresults.html?ss=Philstay%20Myeongdong" },
  { name: "Myeongdong Rooftop Hostel", area: "Myeongdong", otaUrl: "https://www.agoda.com/search?text=Myeongdong%20Rooftop%20Hostel", bookingUrl: "https://www.booking.com/searchresults.html?ss=Myeongdong%20Rooftop%20Hostel" },
];

export function getCompetitorRoomRates(name: string) {
  const seed = seoulCompetitors.findIndex((competitor) => competitor.name === name) + 1;
  const areaLift = seed % 5 === 0 ? 9000 : seed % 3 === 0 ? 4500 : 0;
  return roomTypes.map((roomType, index) => {
    const base = [68000, 93000, 88000, 104000, 146000, 158000, 199000][index] + seed * 1200 + areaLift;

    return {
      roomType,
      weekday: Math.round(base),
      weekend: Math.round(base * 1.18 + 8000),
      average: Math.round(base * 1.07 + 3000),
    };
  });
}

export function getCompetitorMonthlyHistory(name: string, selectedRoomTypes: RoomType[] = [...roomTypes]) {
  const seed = seoulCompetitors.findIndex((competitor) => competitor.name === name) + 1;
  const selectedIndexes = selectedRoomTypes.map((roomType) => roomTypes.indexOf(roomType));
  const roomRates = getCompetitorRoomRates(name).filter((_, index) => selectedIndexes.includes(index));
  const baseAverage =
    roomRates.reduce((sum, row) => sum + row.average, 0) / Math.max(roomRates.length, 1);

  return Array.from({ length: 12 }, (_, index) => {
    const month = monthLabels[index];
    const seasonal = Math.sin((index / 11) * Math.PI) * 18000;
    const base = baseAverage + seed * 350 + seasonal + index * 900;
    return {
      month,
      weekday: Math.round(base),
      weekend: Math.round(base * 1.18 + 9000),
      average: Math.round(base * 1.08 + 4000),
    };
  });
}

export function getCompetitorRoomMonthlyHistory(name: string, selectedRoomTypes: RoomType[]) {
  const rates = getCompetitorRoomRates(name);
  return monthLabels.map((month, monthIndex) => {
    const row: Record<string, string | number> = { month };

    selectedRoomTypes.forEach((roomType) => {
      const roomIndex = roomTypes.indexOf(roomType);
      const seasonal = Math.sin(((monthIndex + roomIndex) / 11) * Math.PI) * 16000;
      row[roomType] = Math.round(rates[roomIndex].average + seasonal + monthIndex * 850);
    });

    return row;
  });
}

export const marketAverageAdr = Math.round(
  seoulCompetitors.reduce((sum, competitor) => {
    const rates = getCompetitorRoomRates(competitor.name);
    return sum + rates.reduce((roomSum, room) => roomSum + room.average, 0) / rates.length;
  }, 0) / seoulCompetitors.length,
);

export const pricingHistory: PricingRow[] = [
  { date: "2026-05-10", competitor: "Hostel Haru", roomType: "싱글", platform: "Agoda", dayType: "Weekday", price: 74000 },
  { date: "2026-05-10", competitor: "Seoul Cube", roomType: "더블", platform: "Agoda", dayType: "Weekday", price: 89000 },
  { date: "2026-05-10", competitor: "Myeongdong Stay", roomType: "트윈배드", platform: "Agoda", dayType: "Weekday", price: 99000 },
  { date: "2026-05-11", competitor: "Hostel Haru", roomType: "싱글", platform: "Agoda", dayType: "Weekend", price: 88000 },
  { date: "2026-05-11", competitor: "Seoul Cube", roomType: "더블", platform: "Agoda", dayType: "Weekend", price: 116000 },
  { date: "2026-05-11", competitor: "Myeongdong Stay", roomType: "트윈배드", platform: "Agoda", dayType: "Weekend", price: 121000 },
  { date: "2026-05-12", competitor: "Hostel Haru", roomType: "패밀리", platform: "Agoda", dayType: "Weekday", price: 168000 },
  { date: "2026-05-12", competitor: "Seoul Cube", roomType: "4벙크배드", platform: "Agoda", dayType: "Weekday", price: 135000 },
  { date: "2026-05-13", competitor: "Myeongdong Stay", roomType: "디럭스 패밀리룸", platform: "Agoda", dayType: "Weekend", price: 218000 },
  { date: "2026-05-13", competitor: "Hostel Haru", roomType: "트윈벙크", platform: "Agoda", dayType: "Weekend", price: 104000 },
  { date: "2026-05-14", competitor: "Seoul Cube", roomType: "패밀리", platform: "Agoda", dayType: "Weekday", price: 174000 },
  { date: "2026-05-14", competitor: "Myeongdong Stay", roomType: "더블", platform: "Agoda", dayType: "Weekday", price: 93000 },
  { date: "2026-05-15", competitor: "Hostel Haru", roomType: "더블", platform: "Agoda", dayType: "Weekend", price: 124000 },
  { date: "2026-05-15", competitor: "Seoul Cube", roomType: "트윈배드", platform: "Agoda", dayType: "Weekend", price: 128000 },
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
