use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{State, Manager};
use std::env;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Product {
    pub id: Option<i64>,
    pub address: String,
    pub title: String,
    pub brand: String,
    pub r#type: String,
    pub price: f64,
    #[serde(rename = "originalPrice")]
    pub original_price: Option<f64>,
    pub discount: Option<String>,
    pub specification: Option<String>,
    pub date: String,
    pub remark: Option<String>,
    pub quantity: Option<f64>,
    pub unit: Option<String>,
    #[serde(rename = "unitPrice")]
    pub unit_price: Option<f64>,
    #[serde(rename = "comparisonUnit")]
    pub comparison_unit: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductInput {
    pub address: String,
    pub title: String,
    pub brand: String,
    pub r#type: String,
    pub price: f64,
    #[serde(rename = "originalPrice")]
    pub original_price: Option<f64>,
    pub discount: Option<String>,
    pub specification: Option<String>,
    pub date: String,
    pub remark: Option<String>,
    pub quantity: Option<f64>,
    pub unit: Option<String>,
    #[serde(rename = "unitPrice")]
    pub unit_price: Option<f64>,
    #[serde(rename = "comparisonUnit")]
    pub comparison_unit: Option<String>,
}

pub struct DatabaseState {
    pub conn: Mutex<Connection>,
}

impl DatabaseState {
    pub fn new() -> Result<Self> {
        // Get the current working directory
        let current_dir = env::current_dir()
            .expect("Failed to get current working directory");
        
        // Create the database path in the current working directory
        let db_path = current_dir.join("products.db");
        
        println!("Database path: {:?}", db_path);
        
        let conn = Connection::open(db_path)?;
        
        // Create table if it doesn't exist
        conn.execute(
            "CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                address TEXT NOT NULL,
                title TEXT NOT NULL,
                brand TEXT NOT NULL,
                type TEXT NOT NULL,
                price REAL NOT NULL,
                original_price REAL,
                discount TEXT,
                specification TEXT,
                date TEXT NOT NULL,
                remark TEXT,
                quantity REAL,
                unit TEXT,
                unit_price REAL,
                comparison_unit TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        // Add new columns to existing table if they don't exist
        let _ = conn.execute("ALTER TABLE products ADD COLUMN original_price REAL", []);
        let _ = conn.execute("ALTER TABLE products ADD COLUMN discount TEXT", []);
        let _ = conn.execute("ALTER TABLE products ADD COLUMN quantity REAL", []);
        let _ = conn.execute("ALTER TABLE products ADD COLUMN unit TEXT", []);
        let _ = conn.execute("ALTER TABLE products ADD COLUMN unit_price REAL", []);
        let _ = conn.execute("ALTER TABLE products ADD COLUMN comparison_unit TEXT", []);

        // Rename url column to address if it exists
        let _ = conn.execute("ALTER TABLE products RENAME COLUMN url TO address", []);

        Ok(DatabaseState {
            conn: Mutex::new(conn),
        })
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn save_product(
    product: ProductInput,
    state: State<'_, DatabaseState>,
) -> Result<Product, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare(
            "INSERT INTO products (address, title, brand, type, price, original_price, discount, specification, date, remark, quantity, unit, unit_price, comparison_unit)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)"
        )
        .map_err(|e| e.to_string())?;

    let id = stmt
        .insert((
            &product.address,
            &product.title,
            &product.brand,
            &product.r#type,
            product.price,
            product.original_price,
            &product.discount,
            &product.specification,
            &product.date,
            &product.remark,
            product.quantity,
            &product.unit,
            product.unit_price,
            &product.comparison_unit,
        ))
        .map_err(|e| e.to_string())?;

    // Get the created product
    let mut stmt = conn
        .prepare("SELECT id, address, title, brand, type, price, original_price, discount, specification, date, remark, quantity, unit, unit_price, comparison_unit, created_at FROM products WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    let product_row = stmt
        .query_row([id], |row| {
            Ok(Product {
                id: Some(row.get(0)?),
                address: row.get(1)?,
                title: row.get(2)?,
                brand: row.get(3)?,
                r#type: row.get(4)?,
                price: row.get(5)?,
                original_price: row.get(6)?,
                discount: row.get(7)?,
                specification: row.get(8)?,
                date: row.get(9)?,
                remark: row.get(10)?,
                quantity: row.get(11)?,
                unit: row.get(12)?,
                unit_price: row.get(13)?,
                comparison_unit: row.get(14)?,
                created_at: row.get(15)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(product_row)
}

#[tauri::command]
async fn get_products(state: State<'_, DatabaseState>) -> Result<Vec<Product>, String> {
    println!("Rust: Getting products from database...");
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, address, title, brand, type, price, original_price, discount, specification, date, remark, quantity, unit, unit_price, comparison_unit, created_at FROM products ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let product_iter = stmt
        .query_map([], |row| {
            Ok(Product {
                id: Some(row.get(0)?),
                address: row.get(1)?,
                title: row.get(2)?,
                brand: row.get(3)?,
                r#type: row.get(4)?,
                price: row.get(5)?,
                original_price: row.get(6)?,
                discount: row.get(7)?,
                specification: row.get(8)?,
                date: row.get(9)?,
                remark: row.get(10)?,
                quantity: row.get(11)?,
                unit: row.get(12)?,
                unit_price: row.get(13)?,
                comparison_unit: row.get(14)?,
                created_at: row.get(15)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut products = Vec::new();
    for product in product_iter {
        products.push(product.map_err(|e| e.to_string())?);
    }

    Ok(products)
}

#[tauri::command]
async fn update_product(
    id: i64,
    product: ProductInput,
    state: State<'_, DatabaseState>,
) -> Result<Product, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE products SET address = ?1, title = ?2, brand = ?3, type = ?4, price = ?5,
         original_price = ?6, discount = ?7, specification = ?8, date = ?9, remark = ?10,
         quantity = ?11, unit = ?12, unit_price = ?13, comparison_unit = ?14
         WHERE id = ?15",
        (
            &product.address,
            &product.title,
            &product.brand,
            &product.r#type,
            product.price,
            product.original_price,
            &product.discount,
            &product.specification,
            &product.date,
            &product.remark,
            product.quantity,
            &product.unit,
            product.unit_price,
            &product.comparison_unit,
            id,
        ),
    )
    .map_err(|e| e.to_string())?;

    // Get the updated product
    let mut stmt = conn
        .prepare("SELECT id, address, title, brand, type, price, original_price, discount, specification, date, remark, quantity, unit, unit_price, comparison_unit, created_at FROM products WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    let product_row = stmt
        .query_row([id], |row| {
            Ok(Product {
                id: Some(row.get(0)?),
                address: row.get(1)?,
                title: row.get(2)?,
                brand: row.get(3)?,
                r#type: row.get(4)?,
                price: row.get(5)?,
                original_price: row.get(6)?,
                discount: row.get(7)?,
                specification: row.get(8)?,
                date: row.get(9)?,
                remark: row.get(10)?,
                quantity: row.get(11)?,
                unit: row.get(12)?,
                unit_price: row.get(13)?,
                comparison_unit: row.get(14)?,
                created_at: row.get(15)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(product_row)
}

#[tauri::command]
async fn delete_product(id: i64, state: State<'_, DatabaseState>) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM products WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn get_database_path() -> Result<String, String> {
    let current_dir = env::current_dir()
        .map_err(|e| e.to_string())?;
    
    let db_path = current_dir.join("products.db");
    Ok(db_path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let db_state = DatabaseState::new()
                .expect("Failed to initialize database");
            app.manage(db_state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            save_product,
            update_product,
            get_products,
            delete_product,
            get_database_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
