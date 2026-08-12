import * as XLSX from "xlsx";
import type { Row } from "./mappers";

/** Write rows to a downloaded .xlsx file. */
export function exportRowsXlsx(rows: Row[], sheetName: string, filename: string): void {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

/** Read the first sheet of an .xlsx file into rows. */
export async function importRowsXlsx(file: File): Promise<Row[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return ws ? (XLSX.utils.sheet_to_json(ws) as Row[]) : [];
}
