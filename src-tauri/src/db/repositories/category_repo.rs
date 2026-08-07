use crate::db::models::Category;
use rusqlite::{params, Connection};

pub fn list(conn: &Connection) -> rusqlite::Result<Vec<Category>> {
    let mut stmt = conn.prepare("SELECT id, name FROM categories ORDER BY name")?;
    let rows = stmt.query_map([], |row| {
        Ok(Category {
            id: row.get(0)?,
            name: row.get(1)?,
        })
    })?;
    rows.collect()
}

pub fn upsert(conn: &Connection, c: &Category) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO categories (id, name) VALUES (?1, ?2)
         ON CONFLICT(id) DO UPDATE SET name = ?2",
        params![c.id, c.name],
    )?;
    Ok(())
}

pub fn delete(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute("DELETE FROM categories WHERE id = ?1", params![id])?;
    Ok(())
}
