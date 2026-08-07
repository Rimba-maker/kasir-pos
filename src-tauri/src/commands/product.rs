use crate::db::models::Product;
use crate::db::repositories::product_repo;
use crate::AppState;
use tauri::State;

#[tauri::command]
pub fn list_products(state: State<AppState>) -> Result<Vec<Product>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    product_repo::list(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_product(state: State<AppState>, id: String) -> Result<Option<Product>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    product_repo::get(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_product(state: State<AppState>, product: Product) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    product_repo::upsert(&conn, &product).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_product(state: State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    product_repo::delete(&conn, &id).map_err(|e| e.to_string())
}
