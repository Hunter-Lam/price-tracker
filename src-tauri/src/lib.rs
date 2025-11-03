use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{State, Manager, AppHandle};
use std::env;
use std::path::PathBuf;

#[derive(Debug, Deserialize)]
struct DatabaseConfig {
    path: String,
}

#[derive(Debug, Deserialize)]
struct PluginsConfig {
    database: DatabaseConfig,
}

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
    pub db_path: Mutex<PathBuf>,
}

impl DatabaseState {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        println!("Database path: {:?}", db_path);

        // Ensure parent directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)
                .expect("Failed to create database directory");
        }

        let conn = Connection::open(&db_path)?;
        
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
            db_path: Mutex::new(db_path),
        })
    }

    pub fn get_default_db_path(app_handle: &AppHandle) -> PathBuf {
        // Try to read custom path from config first
        let config = app_handle.config();
        if let Ok(plugins_config) = serde_json::from_value::<PluginsConfig>(
            serde_json::to_value(&config.plugins).unwrap_or_default()
        ) {
            if !plugins_config.database.path.is_empty() {
                let custom_path = PathBuf::from(&plugins_config.database.path);
                println!("Using custom database path from config: {:?}", custom_path);
                return custom_path;
            }
        }

        // Try to use app data directory (recommended for production)
        if let Ok(app_data_dir) = app_handle.path().app_data_dir() {
            println!("Using app data directory: {:?}", app_data_dir);
            app_data_dir.join("products.db")
        } else {
            // Fallback to current working directory
            let cwd = env::current_dir()
                .expect("Failed to get current working directory")
                .join("products.db");
            println!("Using current working directory: {:?}", cwd);
            cwd
        }
    }

    pub fn reconnect(&self, new_db_path: PathBuf) -> Result<()> {
        println!("Reconnecting to database: {:?}", new_db_path);

        // Ensure parent directory exists
        if let Some(parent) = new_db_path.parent() {
            std::fs::create_dir_all(parent)
                .expect("Failed to create database directory");
        }

        let new_conn = Connection::open(&new_db_path)?;

        // Create table if it doesn't exist
        new_conn.execute(
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
        let _ = new_conn.execute("ALTER TABLE products ADD COLUMN original_price REAL", []);
        let _ = new_conn.execute("ALTER TABLE products ADD COLUMN discount TEXT", []);
        let _ = new_conn.execute("ALTER TABLE products ADD COLUMN quantity REAL", []);
        let _ = new_conn.execute("ALTER TABLE products ADD COLUMN unit TEXT", []);
        let _ = new_conn.execute("ALTER TABLE products ADD COLUMN unit_price REAL", []);
        let _ = new_conn.execute("ALTER TABLE products ADD COLUMN comparison_unit TEXT", []);
        let _ = new_conn.execute("ALTER TABLE products RENAME COLUMN url TO address", []);

        // Update both connection and path
        *self.conn.lock().unwrap() = new_conn;
        *self.db_path.lock().unwrap() = new_db_path;

        Ok(())
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
async fn get_database_path(state: State<'_, DatabaseState>) -> Result<String, String> {
    let db_path = state.db_path.lock().map_err(|e| e.to_string())?;
    Ok(db_path.to_string_lossy().to_string())
}

#[tauri::command]
async fn set_database_path(
    new_path: String,
    state: State<'_, DatabaseState>,
) -> Result<String, String> {
    let new_db_path = PathBuf::from(&new_path);

    state.reconnect(new_db_path.clone())
        .map_err(|e| format!("Failed to reconnect to database: {}", e))?;

    Ok(new_db_path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let db_path = DatabaseState::get_default_db_path(app.handle());
            let db_state = DatabaseState::new(db_path)
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
            get_database_path,
            set_database_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
