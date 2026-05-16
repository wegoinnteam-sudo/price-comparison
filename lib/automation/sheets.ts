import { google } from "googleapis";
import { spreadsheetId } from "./config";

type SheetRow = Array<string | number>;

function getAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.");
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

export async function ensureSheet(sheetName: string, headers: string[]) {
  const sheets = await getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some((sheet) => sheet.properties?.title === sheetName);

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName } } }],
      },
    });
  }

  const headerRange = `${sheetName}!A1:${columnName(headers.length)}1`;
  const headerValues = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: headerRange,
  });

  if (!headerValues.data.values?.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: headerRange,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
  }
}

export async function appendUniqueRows(
  sheetName: string,
  headers: string[],
  rows: SheetRow[],
  keyColumns: number[],
) {
  if (!rows.length) return { appended: 0, skipped: 0 };

  await ensureSheet(sheetName, headers);
  const sheets = await getSheetsClient();
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A2:${columnName(headers.length)}`,
  });

  const existingKeys = new Set(
    (existing.data.values ?? []).map((row) => keyColumns.map((index) => row[index] ?? "").join("|")),
  );
  const uniqueRows = rows.filter((row) => {
    const key = keyColumns.map((index) => String(row[index] ?? "")).join("|");
    if (existingKeys.has(key)) return false;
    existingKeys.add(key);
    return true;
  });

  if (uniqueRows.length) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:${columnName(headers.length)}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: uniqueRows },
    });
  }

  return { appended: uniqueRows.length, skipped: rows.length - uniqueRows.length };
}

export async function readSheet(sheetName: string, headers: string[]) {
  await ensureSheet(sheetName, headers);
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A2:${columnName(headers.length)}`,
  });
  return response.data.values ?? [];
}

function columnName(index: number) {
  let column = "";
  let value = index;
  while (value > 0) {
    const remainder = (value - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    value = Math.floor((value - 1) / 26);
  }
  return column;
}
