mod commands;
mod db;

use rusqlite::Connection;
use std::sync::Mutex;
use tauri::Manager;

/// Shared app state. One SQLite connection behind a Mutex.
// ponytail: single global connection lock. Fine for standalone 1-device MVP;
// swap for r2d2 pool if a network/terminal mode ever needs concurrency.
pub struct AppState {
    pub db: Mutex<Connection>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let dir = app
                .path()
                .app_data_dir()
                .expect("resolve app data dir");
            std::fs::create_dir_all(&dir).ok();
            let conn = Connection::open(dir.join("pos.db")).expect("open sqlite");
            db::schema::init(&conn).expect("init schema");
            app.manage(AppState {
                db: Mutex::new(conn),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::product::list_products,
            commands::product::get_product,
            commands::product::save_product,
            commands::product::delete_product,
            commands::transaction::create_transaction,
            commands::transaction::list_transactions,
            commands::transaction::get_transaction,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
