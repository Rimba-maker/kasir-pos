use rusqlite::Connection;

/// Create tables if absent. Idempotent — safe to run on every startup.
pub fn init(conn: &Connection) -> rusqlite::Result<()> {
    conn.pragma_update(None, "foreign_keys", "ON")?;
    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS categories (
            id   TEXT PRIMARY KEY,
            name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS products (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            price       INTEGER NOT NULL,
            category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
            stock       INTEGER NOT NULL DEFAULT 0,
            barcode     TEXT,
            image_path  TEXT
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id             TEXT PRIMARY KEY,
            created_at     TEXT NOT NULL,
            cashier_id     TEXT,
            customer_id    TEXT,
            status         TEXT NOT NULL,
            discount_total INTEGER NOT NULL DEFAULT 0,
            tax_rate       REAL NOT NULL DEFAULT 0,
            subtotal       INTEGER NOT NULL,
            tax_total      INTEGER NOT NULL,
            total          INTEGER NOT NULL,
            payment_method TEXT,
            amount_paid    INTEGER,
            change         INTEGER
        );

        CREATE TABLE IF NOT EXISTS transaction_items (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
            product_id     TEXT NOT NULL,
            name           TEXT NOT NULL,
            unit_price     INTEGER NOT NULL,
            qty            INTEGER NOT NULL,
            discount       INTEGER NOT NULL DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
        CREATE INDEX IF NOT EXISTS idx_tx_created ON transactions(created_at);
        CREATE INDEX IF NOT EXISTS idx_tx_items_tx ON transaction_items(transaction_id);
        "#,
    )
}
