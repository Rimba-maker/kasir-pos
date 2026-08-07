use serde::{Deserialize, Serialize};

// Field names serialize as camelCase to match the TypeScript entity types.

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Category {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Product {
    pub id: String,
    pub name: String,
    pub price: i64,
    pub category_id: Option<String>,
    pub stock: i64,
    pub barcode: Option<String>,
    pub image_path: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TransactionItem {
    pub product_id: String,
    pub name: String,
    pub unit_price: i64,
    pub qty: i64,
    pub discount: i64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Payment {
    pub method: String,
    pub amount_paid: i64,
    pub change: i64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Transaction {
    pub id: String,
    pub created_at: String,
    pub cashier_id: Option<String>,
    pub customer_id: Option<String>,
    pub status: String,
    pub items: Vec<TransactionItem>,
    pub discount_total: i64,
    pub tax_rate: f64,
    pub subtotal: i64,
    pub tax_total: i64,
    pub total: i64,
    pub payment: Option<Payment>,
}
