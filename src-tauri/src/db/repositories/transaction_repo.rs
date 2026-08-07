use crate::db::models::{Payment, Transaction, TransactionItem};
use rusqlite::{params, Connection};

/// Insert a transaction with its items atomically. When status = "paid",
/// stock is decremented for each line in the same DB transaction.
pub fn create(conn: &mut Connection, tx: &Transaction) -> rusqlite::Result<()> {
    let db_tx = conn.transaction()?;

    let (method, amount_paid, change) = match &tx.payment {
        Some(p) => (Some(p.method.clone()), Some(p.amount_paid), Some(p.change)),
        None => (None, None, None),
    };

    db_tx.execute(
        "INSERT INTO transactions
            (id, created_at, cashier_id, customer_id, status, discount_total, tax_rate,
             subtotal, tax_total, total, payment_method, amount_paid, change)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)",
        params![
            tx.id, tx.created_at, tx.cashier_id, tx.customer_id, tx.status,
            tx.discount_total, tx.tax_rate, tx.subtotal, tx.tax_total, tx.total,
            method, amount_paid, change,
        ],
    )?;

    for item in &tx.items {
        db_tx.execute(
            "INSERT INTO transaction_items
                (transaction_id, product_id, name, unit_price, qty, discount)
             VALUES (?1,?2,?3,?4,?5,?6)",
            params![tx.id, item.product_id, item.name, item.unit_price, item.qty, item.discount],
        )?;
        if tx.status == "paid" {
            db_tx.execute(
                "UPDATE products SET stock = MAX(0, stock - ?2) WHERE id = ?1",
                params![item.product_id, item.qty],
            )?;
        }
    }

    db_tx.commit()
}

pub fn list(conn: &Connection) -> rusqlite::Result<Vec<Transaction>> {
    let mut stmt = conn.prepare(
        "SELECT id, created_at, cashier_id, customer_id, status, discount_total, tax_rate,
                subtotal, tax_total, total, payment_method, amount_paid, change
         FROM transactions ORDER BY created_at DESC",
    )?;
    let ids: Vec<Transaction> = stmt
        .query_map([], |row| build_transaction(row))?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    // Attach items per transaction.
    ids.into_iter()
        .map(|mut tx| {
            tx.items = load_items(conn, &tx.id)?;
            Ok(tx)
        })
        .collect()
}

pub fn get(conn: &Connection, id: &str) -> rusqlite::Result<Option<Transaction>> {
    let mut stmt = conn.prepare(
        "SELECT id, created_at, cashier_id, customer_id, status, discount_total, tax_rate,
                subtotal, tax_total, total, payment_method, amount_paid, change
         FROM transactions WHERE id = ?1",
    )?;
    let mut rows = stmt.query_map(params![id], |row| build_transaction(row))?;
    match rows.next() {
        Some(r) => {
            let mut tx = r?;
            tx.items = load_items(conn, &tx.id)?;
            Ok(Some(tx))
        }
        None => Ok(None),
    }
}

fn build_transaction(row: &rusqlite::Row) -> rusqlite::Result<Transaction> {
    let method: Option<String> = row.get(10)?;
    let amount_paid: Option<i64> = row.get(11)?;
    let change: Option<i64> = row.get(12)?;
    let payment = match (method, amount_paid, change) {
        (Some(method), Some(amount_paid), Some(change)) => Some(Payment {
            method,
            amount_paid,
            change,
        }),
        _ => None,
    };
    Ok(Transaction {
        id: row.get(0)?,
        created_at: row.get(1)?,
        cashier_id: row.get(2)?,
        customer_id: row.get(3)?,
        status: row.get(4)?,
        discount_total: row.get(5)?,
        tax_rate: row.get(6)?,
        subtotal: row.get(7)?,
        tax_total: row.get(8)?,
        total: row.get(9)?,
        items: Vec::new(),
        payment,
    })
}

fn load_items(conn: &Connection, tx_id: &str) -> rusqlite::Result<Vec<TransactionItem>> {
    let mut stmt = conn.prepare(
        "SELECT product_id, name, unit_price, qty, discount
         FROM transaction_items WHERE transaction_id = ?1 ORDER BY id",
    )?;
    let rows = stmt.query_map(params![tx_id], |row| {
        Ok(TransactionItem {
            product_id: row.get(0)?,
            name: row.get(1)?,
            unit_price: row.get(2)?,
            qty: row.get(3)?,
            discount: row.get(4)?,
        })
    })?;
    rows.collect()
}
