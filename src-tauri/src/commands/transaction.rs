use crate::db::models::Transaction;
use crate::db::repositories::transaction_repo;
use crate::AppState;
use tauri::State;

/// Persist a transaction. Status carried on the payload:
/// "paid" also decrements stock; "held" saves without touching stock.
#[tauri::command]
pub fn create_transaction(state: State<AppState>, tx: Transaction) -> Result<(), String> {
    let mut conn = state.db.lock().map_err(|e| e.to_string())?;
    transaction_repo::create(&mut conn, &tx).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_transactions(state: State<AppState>) -> Result<Vec<Transaction>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    transaction_repo::list(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_transaction(state: State<AppState>, id: String) -> Result<Option<Transaction>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    transaction_repo::get(&conn, &id).map_err(|e| e.to_string())
}
