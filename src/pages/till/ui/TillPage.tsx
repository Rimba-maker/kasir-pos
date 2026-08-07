import { useEffect, useState } from "react";
import { useCatalogStore } from "@/entities/product";
import { useSettingsStore } from "@/entities/store-settings";
import { buildTransaction, cartTotals, useCartStore, useSalesStore, type Payment } from "@/entities/transaction";
import { BarcodeSearch } from "@/features/add-to-cart";
import { holdSale } from "@/features/hold-resume-sale";
import { CashPaymentPad } from "@/features/pay-cash";
import { QrisStaticPanel } from "@/features/pay-qris-static";
import { buildReceiptData, printReceipt, type ReceiptData, type StoreInfo } from "@/features/print-receipt";
import { ProductGrid } from "@/widgets/product-grid";
import { CartPanel } from "@/widgets/cart-panel";
import { ReceiptPreview } from "@/widgets/receipt-preview";
import { transactionApi, isTauri } from "@/shared/api/pos";
import { Modal } from "@/shared/ui/Modal";

type PayStep = null | "choose" | "cash" | "qris";

export function TillPage() {
  const [step, setStep] = useState<PayStep>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const settings = useSettingsStore((s) => s.settings);
  const store: StoreInfo = {
    name: settings.name,
    address: settings.address || undefined,
    footer: settings.receiptFooter || undefined,
    printerTarget: settings.printerTarget || undefined,
  };

  const lines = useCartStore((s) => s.lines);
  const discountTotal = useCartStore((s) => s.discountTotal);
  const taxRate = useCartStore((s) => s.taxRate);
  const setTaxRate = useCartStore((s) => s.setTaxRate);
  const { total } = cartTotals({ lines, discountTotal, taxRate });

  // Keep the cart's tax rate in sync with settings.
  useEffect(() => {
    setTaxRate(settings.taxEnabled ? settings.taxRate : 0);
  }, [settings.taxEnabled, settings.taxRate, setTaxRate]);

  async function onPaymentConfirmed(payment: Payment) {
    const cart = useCartStore.getState();
    const tx = buildTransaction({
      lines: cart.lines,
      discountTotal: cart.discountTotal,
      taxRate: cart.taxRate,
      status: "paid",
      payment,
      customerId: cart.customerId,
    });
    try {
      if (isTauri()) await transactionApi.create(tx);
    } catch (e) {
      alert(`Gagal menyimpan transaksi: ${String(e)}`);
      return;
    }
    const dec = useCatalogStore.getState().decrementStock;
    tx.items.forEach((i) => dec(i.productId, i.qty));
    useSalesStore.getState().add(tx);
    cart.clear();
    setStep(null);
    setReceipt(buildReceiptData(tx, store));
  }

  async function onHold() {
    await holdSale();
  }

  async function onPrint() {
    if (!receipt) return;
    try {
      await printReceipt(receipt, store.printerTarget);
    } catch (e) {
      alert(String(e instanceof Error ? e.message : e));
    }
  }

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <h1 className="text-lg font-bold">Kasir POS</h1>
        <button
          type="button"
          onClick={onHold}
          disabled={lines.length === 0}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 disabled:opacity-40"
        >
          Tahan Transaksi
        </button>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-[1fr_380px]">
        <div className="flex min-h-0 flex-col gap-3">
          <BarcodeSearch />
          <div className="min-h-0 flex-1">
            <ProductGrid />
          </div>
        </div>
        <div className="min-h-0">
          <CartPanel onCheckout={() => setStep("choose")} />
        </div>
      </div>

      {/* Choose payment method */}
      <Modal open={step === "choose"} title="Metode Pembayaran" onClose={() => setStep(null)}>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStep("cash")}
            className="rounded-lg border border-neutral-300 py-6 font-medium hover:bg-neutral-50"
          >
            💵 Tunai
          </button>
          <button
            type="button"
            onClick={() => setStep("qris")}
            className="rounded-lg border border-neutral-300 py-6 font-medium hover:bg-neutral-50"
          >
            📱 QRIS
          </button>
        </div>
      </Modal>

      <Modal open={step === "cash"} title="Pembayaran Tunai" onClose={() => setStep(null)}>
        <CashPaymentPad total={total} onConfirm={onPaymentConfirmed} onCancel={() => setStep("choose")} />
      </Modal>

      <Modal open={step === "qris"} title="Pembayaran QRIS" onClose={() => setStep(null)}>
        <QrisStaticPanel
          total={total}
          qrImagePath={settings.qrisImagePath || undefined}
          onConfirm={onPaymentConfirmed}
          onCancel={() => setStep("choose")}
        />
      </Modal>

      {/* Receipt after a paid sale */}
      <Modal open={receipt !== null} title="Struk" onClose={() => setReceipt(null)}>
        {receipt && (
          <div className="space-y-4">
            <ReceiptPreview data={receipt} />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReceipt(null)}
                className="flex-1 rounded-md border border-neutral-300 py-2.5 font-medium hover:bg-neutral-100"
              >
                Selesai
              </button>
              <button
                type="button"
                onClick={onPrint}
                className="flex-1 rounded-md bg-neutral-900 py-2.5 font-medium text-white hover:bg-neutral-800"
              >
                Cetak Struk
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
