use crate::db::models::Category;
use crate::db::repositories::category_repo;
use crate::AppState;
use tauri::State;

#[tauri::command]
pub fn list_categories(state: State<AppState>) -> Result<Vec<Category>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    category_repo::list(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_category(state: State<AppState>, category: Category) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    category_repo::upsert(&conn, &category).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_category(state: State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    category_repo::delete(&conn, &id).map_err(|e| e.to_string())
}
