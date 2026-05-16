# Seoul Hostel Market Dashboard

Personal-use AI-powered market dashboard for a hostel operator in Seoul, South Korea.

The app is intentionally lightweight: Next.js for the dashboard, Google Sheets as the database, Playwright for daily Agoda snapshots, and OpenAI for daily market notes.

## Folder Structure

- `app/` - Next.js App Router pages and global styles
- `components/ui/` - shadcn-style primitives used by the dashboard
- `components/dashboard/` - Recharts visualization components
- `lib/market-data.ts` - typed sample data and room type model
- `lib/automation/` - Google Sheets config and helpers
- `scripts/scrape-agoda.ts` - Playwright Agoda scraping flow
- `scripts/generate-ai-insights.ts` - OpenAI market analysis flow
- `scripts/daily-update.ts` - single command run by GitHub Actions
- `.github/workflows/daily-market-update.yml` - daily automation

## Spreadsheet Tabs

The automation creates and updates these sheets:

- `pricing_history`
- `tourism_trends`
- `ai_insights`
- `news_events`

Rows are appended with duplicate protection. Pricing history uses this uniqueness key:
`date + competitor + room_type + ota_platform + day_type`.

## Environment

Copy `.env.example` to `.env.local` for local dashboard work or add the same values as GitHub Actions repository secrets.

Required automation secrets:

- `GOOGLE_SPREADSHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `OPENAI_API_KEY`
- `AGODA_COMPETITOR_HOSTEL_HARU_URL`
- `AGODA_COMPETITOR_SEOUL_CUBE_URL`
- `AGODA_COMPETITOR_MYEONGDONG_STAY_URL`

Share the Google Spreadsheet with the service account email as an editor.

## Commands

```bash
npm run dev
npm run build
npm run daily:update
```

## Notes

Agoda markup changes frequently, so the scraper intentionally uses a simple text extraction fallback. For more precise room mapping, add competitor-specific selectors once the final Agoda URLs are known.
