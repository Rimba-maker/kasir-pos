use crate::hardware::escpos::{self, ReceiptData};

/// Build ESC/POS bytes for the receipt and send them to the target printer.
/// `printer` is a device/share path from settings; empty/None = not configured.
#[tauri::command]
pub fn print_receipt(data: ReceiptData, printer: Option<String>) -> Result<(), String> {
    let bytes = escpos::build(&data);
    match printer {
        Some(target) if !target.is_empty() => {
            escpos::send_to_device(&target, &bytes).map_err(|e| e.to_string())
        }
        _ => Err("Printer belum dikonfigurasi di Pengaturan.".into()),
    }
}
