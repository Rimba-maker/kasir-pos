//! Minimal ESC/POS receipt builder. No external crate — the commands a basic
//! thermal receipt needs are a handful of control bytes.
//!
//! ponytail: ASCII/UTF-8 passthrough, no code-page switching. Fine for typical
//! Indonesian item names; add a CP437/CP858 mapping if odd glyphs appear.

use serde::Deserialize;
use std::io::Write;

const WIDTH: usize = 32; // 58mm printer, Font A

const INIT: &[u8] = &[0x1B, 0x40]; // ESC @
const ALIGN_LEFT: &[u8] = &[0x1B, 0x61, 0x00];
const ALIGN_CENTER: &[u8] = &[0x1B, 0x61, 0x01];
const BOLD_ON: &[u8] = &[0x1B, 0x45, 0x01];
const BOLD_OFF: &[u8] = &[0x1B, 0x45, 0x00];
const FEED_AND_CUT: &[u8] = &[0x0A, 0x0A, 0x0A, 0x1D, 0x56, 0x00]; // feed 3 + full cut

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReceiptLine {
    pub name: String,
    pub qty: i64,
    pub line_total: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReceiptData {
    pub store_name: String,
    pub address: Option<String>,
    pub created_at: String,
    pub items: Vec<ReceiptLine>,
    pub subtotal: i64,
    pub discount_total: i64,
    pub tax_total: i64,
    pub total: i64,
    pub amount_paid: Option<i64>,
    pub change: Option<i64>,
    pub footer: Option<String>,
}

/// Format an integer Rupiah amount as "Rp10.000" (dot thousands separator).
fn rupiah(amount: i64) -> String {
    let digits = amount.abs().to_string();
    let mut grouped = String::new();
    for (i, c) in digits.chars().rev().enumerate() {
        if i > 0 && i % 3 == 0 {
            grouped.push('.');
        }
        grouped.push(c);
    }
    let grouped: String = grouped.chars().rev().collect();
    format!("{}Rp{}", if amount < 0 { "-" } else { "" }, grouped)
}

/// A "label........value" line padded to WIDTH.
fn pad(left: &str, right: &str) -> String {
    let space = WIDTH.saturating_sub(left.chars().count() + right.chars().count());
    format!("{}{}{}", left, " ".repeat(space.max(1)), right)
}

fn writeln(out: &mut Vec<u8>, s: &str) {
    out.extend_from_slice(s.as_bytes());
    out.push(0x0A);
}

/// Build the full ESC/POS byte stream for a receipt.
pub fn build(d: &ReceiptData) -> Vec<u8> {
    let mut o = Vec::new();
    o.extend_from_slice(INIT);

    o.extend_from_slice(ALIGN_CENTER);
    o.extend_from_slice(BOLD_ON);
    writeln(&mut o, &d.store_name);
    o.extend_from_slice(BOLD_OFF);
    if let Some(addr) = &d.address {
        writeln(&mut o, addr);
    }
    writeln(&mut o, &d.created_at);

    o.extend_from_slice(ALIGN_LEFT);
    writeln(&mut o, &"-".repeat(WIDTH));
    for it in &d.items {
        writeln(&mut o, &it.name);
        writeln(&mut o, &pad(&format!("  {} x", it.qty), &rupiah(it.line_total)));
    }
    writeln(&mut o, &"-".repeat(WIDTH));

    writeln(&mut o, &pad("Subtotal", &rupiah(d.subtotal)));
    if d.discount_total > 0 {
        writeln(&mut o, &pad("Diskon", &format!("-{}", rupiah(d.discount_total))));
    }
    if d.tax_total > 0 {
        writeln(&mut o, &pad("Pajak", &rupiah(d.tax_total)));
    }
    o.extend_from_slice(BOLD_ON);
    writeln(&mut o, &pad("TOTAL", &rupiah(d.total)));
    o.extend_from_slice(BOLD_OFF);

    if let Some(paid) = d.amount_paid {
        writeln(&mut o, &pad("Tunai", &rupiah(paid)));
    }
    if let Some(change) = d.change {
        writeln(&mut o, &pad("Kembalian", &rupiah(change)));
    }

    if let Some(footer) = &d.footer {
        writeln(&mut o, "");
        o.extend_from_slice(ALIGN_CENTER);
        writeln(&mut o, footer);
    }

    o.extend_from_slice(FEED_AND_CUT);
    o
}

/// Send raw bytes to a printer device/share (e.g. a COM port or Windows printer
/// share path). ponytail: raw file write — covers USB-as-serial and shared
/// printers; add a proper USB/Bluetooth backend if a target needs it.
pub fn send_to_device(target: &str, bytes: &[u8]) -> std::io::Result<()> {
    let mut f = std::fs::OpenOptions::new().write(true).open(target)?;
    f.write_all(bytes)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rupiah_groups_thousands() {
        assert_eq!(rupiah(10_000), "Rp10.000");
        assert_eq!(rupiah(1_500_000), "Rp1.500.000");
        assert_eq!(rupiah(0), "Rp0");
    }

    #[test]
    fn build_starts_with_init_and_contains_store() {
        let d = ReceiptData {
            store_name: "Toko Maju".into(),
            address: None,
            created_at: "2026-08-07 10:00".into(),
            items: vec![ReceiptLine { name: "Kopi".into(), qty: 2, line_total: 20_000 }],
            subtotal: 20_000,
            discount_total: 0,
            tax_total: 0,
            total: 20_000,
            amount_paid: Some(50_000),
            change: Some(30_000),
            footer: Some("Terima kasih".into()),
        };
        let bytes = build(&d);
        assert_eq!(&bytes[..2], INIT);
        assert!(bytes.windows(9).any(|w| w == b"Toko Maju"));
    }
}
