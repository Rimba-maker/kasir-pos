use crate::db::models::Product;
use rusqlite::{params, Connection, Row};

const COLS: &str = "id, name, price, category_id, stock, barcode, image_path";

fn map(row: &Row) -> rusqlite::Result<Product> {
    Ok(Product {
        id: row.get(0)?,
        name: row.get(1)?,
        price: row.get(2)?,
        category_id: row.get(3)?,
        stock: row.get(4)?,
        barcode: row.get(5)?,
        image_path: row.get(6)?,
    })
}

pub fn list(conn: &Connection) -> rusqlite::Result<Vec<Product>> {
    let sql = format!("SELECT {COLS} FROM products ORDER BY name");
    let mut stmt = conn.prepare(&sql)?;
    let rows = stmt.query_map([], map)?;
    rows.collect()
}

pub fn get(conn: &Connection, id: &str) -> rusqlite::Result<Option<Product>> {
    let sql = format!("SELECT {COLS} FROM products WHERE id = ?1");
    let mut stmt = conn.prepare(&sql)?;
    let mut rows = stmt.query_map(params![id], map)?;
    match rows.next() {
        Some(r) => Ok(Some(r?)),
        None => Ok(None),
    }
}

pub fn upsert(conn: &Connection, p: &Product) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO products (id, name, price, category_id, stock, barcode, image_path)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
         ON CONFLICT(id) DO UPDATE SET
            name=?2, price=?3, category_id=?4, stock=?5, barcode=?6, image_path=?7",
        params![p.id, p.name, p.price, p.category_id, p.stock, p.barcode, p.image_path],
    )?;
    Ok(())
}

pub fn delete(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute("DELETE FROM products WHERE id = ?1", params![id])?;
    Ok(())
}
