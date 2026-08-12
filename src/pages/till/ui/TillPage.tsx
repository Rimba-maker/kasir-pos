import { useEffect, useState } from "react";
import { Banknote, PauseCircle, Printer, QrCode, ShoppingCart } from "lucide-react";
import { formatRupiah } from "@/shared/lib/currency";
import { useCatalogStore } from "@/entities/product";
import { recordStockMovement } from "@/entities/stock-ledger";
import { consumeBatchesFefo } from "@/entities/batch";
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
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";

type PayStep = null | "choose" | "cash" | "qris";

export function TillPage() {
  const [step, setStep] = useState<PayStep>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [cartOpen, setCartOpen] = useState(false); // mobile cart drawer

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
  const taxInclusive = useCartStore((s) => s.taxInclusive);
  const setTaxRate = useCartStore((s) => s.setTaxRate);
  const setTaxInclusive = useCartStore((s) => s.setTaxInclusive);
  const { total } = cartTotals({ lines, discountTotal, taxRate, taxInclusive });
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);

  // Keep the cart's tax rate + mode in sync with settings.
  useEffect(() => {
    setTaxRate(settings.taxEnabled ? settings.taxRate : 0);
    setTaxInclusive(settings.taxEnabled && settings.taxInclusive);
  }, [settings.taxEnabled, settings.taxRate, settings.taxInclusive, setTaxRate, setTaxInclusive]);

  async function onPaymentConfirmed(payment: Payment) {
    const cart = useCartStore.getState();
    const tx = buildTransaction({
      lines: cart.lines,
      discountTotal: cart.discountTotal,
      taxRate: cart.taxRate,
      taxInclusive: cart.taxInclusive,
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
    const products = useCatalogStore.getState().products;
    tx.items.forEach((i) => {
      const prod = products.find((p) => p.id === i.productId);
      if (prod?.isKit) {
        // A kit has no stock of its own — consume its components.
        for (const c of prod.components ?? [])
          recordStockMovement({ productId: c.productId, type: "sale", qty: -(c.qty * i.qty), refType: "transaction", refId: tx.id });
        return;
      }
      recordStockMovement({ productId: i.productId, type: "sale", qty: -i.qty, refType: "transaction", refId: tx.id });
      if (prod?.trackBatch) consumeBatchesFefo(i.productId, i.qty);
    });
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
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold leading-tight text-fg">{settings.name || "Kasir"}</h1>
          <p className="text-xs text-muted">Transaksi kasir</p>
        </div>
        <Button variant="outline" size="sm" onClick={onHold} disabled={lines.length === 0}>
          <PauseCircle className="h-4 w-4" />
          Tahan
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:grid lg:grid-cols-[1fr_384px]">
        <div className="flex min-h-0 flex-col gap-3">
          <BarcodeSearch />
          <div className="min-h-0 flex-1">
            <ProductGrid />
          </div>
        </div>
        {/* Desktop: cart alongside. Mobile: hidden, reachable via bottom bar. */}
        <div className="hidden min-h-0 lg:block">
          <CartPanel onCheckout={() => setStep("choose")} />
        </div>
      </div>

      {/* Mobile cart summary bar — sits above the shell's bottom nav */}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        disabled={itemCount === 0}
        className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-surface px-4 py-3 text-left transition-colors disabled:opacity-60 lg:hidden"
      >
        <span className="flex items-center gap-2 font-medium text-fg">
          <span className="relative">
            <ShoppingCart className="h-5 w-5 text-primary" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-on-accent">
                {itemCount}
              </span>
            )}
          </span>
          {itemCount === 0 ? "Keranjang kosong" : "Lihat keranjang"}
        </span>
        <span className="tabular-nums text-base font-bold text-fg">{formatRupiah(total)}</span>
      </button>

      {/* Mobile cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end lg:hidden">
          <div
            className="animate-fade-in absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <div className="animate-pop-in relative h-[82dvh]">
            <CartPanel
              onCheckout={() => {
                setCartOpen(false);
                setStep("choose");
              }}
            />
          </div>
        </div>
      )}

      {/* Choose payment method */}
      <Modal open={step === "choose"} title="Metode Pembayaran" onClose={() => setStep(null)}>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStep("cash")}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-border py-6 font-medium text-fg transition-colors hover:border-primary hover:bg-surface-2"
          >
            <Banknote className="h-7 w-7 text-primary" strokeWidth={1.75} />
            Tunai
          </button>
          <button
            type="button"
            onClick={() => setStep("qris")}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-border py-6 font-medium text-fg transition-colors hover:border-primary hover:bg-surface-2"
          >
            <QrCode className="h-7 w-7 text-primary" strokeWidth={1.75} />
            QRIS
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
              <Button variant="outline" size="lg" onClick={() => setReceipt(null)} className="flex-1">
                Selesai
              </Button>
              <Button variant="primary" size="lg" onClick={onPrint} className="flex-1">
                <Printer className="h-4 w-4" />
                Cetak Struk
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
