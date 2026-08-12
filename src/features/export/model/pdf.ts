import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRupiah } from "@/shared/lib/currency";
import type { ProductStat, SalesSummary } from "@/features/dashboard";

/** A sales report PDF: summary metrics + top products. */
export function exportSalesReportPdf(summary: SalesSummary, top: ProductStat[], periodLabel: string): void {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Laporan Penjualan", 14, 18);
  doc.setFontSize(10);
  doc.text(`Periode: ${periodLabel}`, 14, 25);

  autoTable(doc, {
    startY: 32,
    head: [["Metrik", "Nilai"]],
    body: [
      ["Omzet", formatRupiah(summary.omzet)],
      ["Laba kotor", formatRupiah(summary.grossProfit)],
      ["HPP", formatRupiah(summary.hpp)],
      ["Transaksi", String(summary.count)],
    ],
  });

  autoTable(doc, {
    head: [["Produk", "Qty", "Omzet"]],
    body: top.map((p) => [p.name, String(p.qty), formatRupiah(p.revenue)]),
  });

  doc.save("laporan-penjualan.pdf");
}
