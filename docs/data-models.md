# Data Models - Price Tracker

> **Generated**: 2025-11-25
> **Project**: Price Tracker (Tauri Desktop App)
> **Database**: SQLite (via rusqlite 0.31)

## Overview

The Price Tracker application uses SQLite as its embedded database for persistent storage of product tracking records. The database schema is managed through Rust code using the `rusqlite` library with automatic schema migration support.

## Database Architecture

### Storage Strategy

**Dual Storage Mode**:
- **Tauri Environment** (`window.isTauri === true`): Uses SQLite via Rust commands
- **Browser Development** (`window.isTauri === false`): Falls back to localStorage

**Database Location**:
1. **Priority 1**: Custom path from `tauri.conf.json` → `plugins.database.path`
2. **Priority 2**: App data directory (platform-specific):
   - macOS: `~/Library/Application Support/com.md-react.app/products.db`
   - Windows: `%APPDATA%\\com.md-react.app\\products.db`
   - Linux: `~/.local/share/com.md-react.app/products.db`
3. **Fallback**: Current working directory `./products.db`

**Runtime Configuration**:
- Database path can be changed at runtime via `set_database_path` Tauri command
- Automatic reconnection to new database location
- Schema creation on new database initialization

## Core Data Model

### Product Entity

**Table**: `products`

#### Schema Definition

```sql
CREATE TABLE IF NOT EXISTS products (
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
)
```

#### Field Specifications

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | INTEGER | No | Auto-incrementing primary key |
| `address` | TEXT | No | Product URL or store address |
| `title` | TEXT | No | Product name/title |
| `brand` | TEXT | No | Product brand/manufacturer |
| `type` | TEXT | No | Product category (食品, 日用品, 電子產品, etc.) |
| `price` | REAL | No | Current/final price after discounts |
| `original_price` | REAL | Yes | Original price before discounts |
| `discount` | TEXT | Yes | JSON string of DiscountItem[] |
| `specification` | TEXT | Yes | Product specifications (size, weight, etc.) |
| `date` | TEXT | No | Purchase/tracking date (YYYY-MM-DD format) |
| `remark` | TEXT | Yes | User notes/comments |
| `quantity` | REAL | Yes | Product quantity |
| `unit` | TEXT | Yes | Quantity unit (g, kg, ml, L, 斤, 両, 件) |
| `unit_price` | REAL | Yes | Calculated price per unit |
| `comparison_unit` | TEXT | Yes | Unit for price comparison (e.g., "500g") |
| `created_at` | DATETIME | Yes | Record creation timestamp (auto-generated) |

#### Derived/Calculated Fields

**Unit Price Calculation**:
```
unit_price = price / quantity (converted to base unit)
```

**Discount Calculation**:
```
original_price = price + sum(all discounts)
```

### TypeScript Type Definitions

#### Product (Full Model)

```typescript
export interface Product {
  id?: number;
  address: string;
  title: string;
  brand: string;
  type: CategoryType;
  price: number;
  originalPrice?: number;
  discount?: string;  // JSON string
  specification?: string;
  date: string;
  remark?: string;
  quantity?: number;
  unit?: UnitType;
  unitPrice?: number;
  comparisonUnit?: UnitType;
  created_at?: string;
}
```

#### ProductInput (Create/Update DTO)

```typescript
export interface ProductInput {
  address: string;
  title: string;
  brand: string;
  type: CategoryType;
  price: number;
  originalPrice?: number;
  discount?: string;
  specification?: string;
  date: string;
  remark?: string;
  quantity?: number;
  unit?: UnitType;
  unitPrice?: number;
  comparisonUnit?: UnitType;
}
```

**Note**: `ProductInput` omits `id` and `created_at` (backend-generated)

#### DiscountItem (Nested Structure)

```typescript
export interface DiscountItem {
  discountOwner: DiscountOrganizerType;  // 'store' | 'platform' | 'government'
  discountType: DiscountMethodType;       // 'percentage' | 'fixed' | 'coupon'
  discountValue: string | number;
}
```

**Storage**: Array of DiscountItem serialized as JSON string in `discount` field

**Example JSON**:
```json
[
  {
    "discountOwner": "store",
    "discountType": "coupon",
    "discountValue": 50
  },
  {
    "discountOwner": "platform",
    "discountType": "percentage",
    "discountValue": "10%"
  }
]
```

### Rust Data Structures

#### Product (Rust)

```rust
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
```

**Serde Attributes**:
- `#[serde(rename = "...")]`: Converts snake_case (Rust) ↔ camelCase (TypeScript/JSON)
- `r#type`: Escapes `type` keyword in Rust

## Database Operations

### CRUD Operations (Tauri Commands)

#### 1. **Create Product**

**Command**: `save_product`

```rust
#[tauri::command]
async fn save_product(
    product: ProductInput,
    state: State<'_, DatabaseState>,
) -> Result<Product, String>
```

**SQL**:
```sql
INSERT INTO products (
    address, title, brand, type, price, original_price,
    discount, specification, date, remark, quantity,
    unit, unit_price, comparison_unit
) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
```

**Returns**: Newly created Product with `id` and `created_at`

#### 2. **Read Products**

**Command**: `get_products`

```rust
#[tauri::command]
async fn get_products(
    state: State<'_, DatabaseState>
) -> Result<Vec<Product>, String>
```

**SQL**:
```sql
SELECT id, address, title, brand, type, price, original_price,
       discount, specification, date, remark, quantity, unit,
       unit_price, comparison_unit, created_at
FROM products
ORDER BY created_at DESC
```

**Returns**: Array of all products, newest first

#### 3. **Update Product**

**Command**: `update_product`

```rust
#[tauri::command]
async fn update_product(
    id: i64,
    product: ProductInput,
    state: State<'_, DatabaseState>,
) -> Result<Product, String>
```

**SQL**:
```sql
UPDATE products SET
    address = ?1, title = ?2, brand = ?3, type = ?4,
    price = ?5, original_price = ?6, discount = ?7,
    specification = ?8, date = ?9, remark = ?10,
    quantity = ?11, unit = ?12, unit_price = ?13,
    comparison_unit = ?14
WHERE id = ?15
```

**Returns**: Updated Product

#### 4. **Delete Product**

**Command**: `delete_product`

```rust
#[tauri::command]
async fn delete_product(
    id: i64,
    state: State<'_, DatabaseState>
) -> Result<(), String>
```

**SQL**:
```sql
DELETE FROM products WHERE id = ?1
```

**Returns**: Success (empty) or error

### Database Management Commands

#### 5. **Get Database Path**

**Command**: `get_database_path`

```rust
#[tauri::command]
async fn get_database_path(
    state: State<'_, DatabaseState>
) -> Result<String, String>
```

**Returns**: Absolute path to current database file

#### 6. **Set Database Path**

**Command**: `set_database_path`

```rust
#[tauri::command]
async fn set_database_path(
    new_path: String,
    state: State<'_, DatabaseState>,
) -> Result<String, String>
```

**Actions**:
1. Validates new path
2. Creates parent directories if needed
3. Opens new database connection
4. Creates schema if new database
5. Updates DatabaseState with new connection
6. Returns new database path

**Returns**: Confirmed new database path

## Schema Evolution & Migration

### Migration Strategy

**Approach**: Additive schema migrations using `ALTER TABLE`

**Implementation**:
```rust
// Add new columns to existing table if they don't exist
let _ = conn.execute("ALTER TABLE products ADD COLUMN original_price REAL", []);
let _ = conn.execute("ALTER TABLE products ADD COLUMN discount TEXT", []);
let _ = conn.execute("ALTER TABLE products ADD COLUMN quantity REAL", []);
let _ = conn.execute("ALTER TABLE products ADD COLUMN unit TEXT", []);
let _ = conn.execute("ALTER TABLE products ADD COLUMN unit_price REAL", []);
let _ = conn.execute("ALTER TABLE products ADD COLUMN comparison_unit TEXT", []);
```

**Error Handling**: Silently ignores errors (column already exists)

### Schema Version History

| Version | Changes | Notes |
|---------|---------|-------|
| **v1.0** | Initial schema | Basic product tracking (id, url, title, brand, type, price, date, remark) |
| **v1.1** | + `original_price`, `discount` | Discount tracking feature |
| **v1.2** | + `quantity`, `unit`, `unit_price`, `comparison_unit` | Unit price calculation feature |
| **v1.3** | Rename `url` → `address` | Support non-URL sources |

### Column Rename Migration

**Legacy Support**:
```rust
// Rename url column to address if it exists
let _ = conn.execute("ALTER TABLE products RENAME COLUMN url TO address", []);
```

**Behavior**: Existing databases with `url` column get migrated to `address`

## Data Integrity & Constraints

### Business Rules

1. **Required Fields**: `address`, `title`, `brand`, `type`, `price`, `date`
2. **Numeric Ranges**:
   - `price` > 0
   - `original_price` ≥ `price` (if set)
   - `quantity` > 0 (if set)
3. **Date Format**: `YYYY-MM-DD` (enforced by frontend, stored as TEXT)
4. **Discount JSON**: Must be valid JSON array of DiscountItem

### Referential Integrity

**No Foreign Keys**: Current schema is a single-table design

**Future Normalization Opportunities**:
- Brands table (many products → one brand)
- Categories table (many products → one category)
- Sources/Stores table (many products → one source)
- User Requirements table (for planned feature)
- Inspection Standards table (for planned feature)

## Query Patterns

### Common Queries

#### 1. **Find Products by Brand**
```sql
SELECT * FROM products
WHERE brand = ?1
ORDER BY created_at DESC
```

#### 2. **Find Products by Type/Category**
```sql
SELECT * FROM products
WHERE type = ?1
ORDER BY created_at DESC
```

#### 3. **Price History for Product**
```sql
SELECT date, price, original_price
FROM products
WHERE title = ?1 AND brand = ?2
ORDER BY date ASC
```

#### 4. **Best Deals (Highest Discount)**
```sql
SELECT *,
       (original_price - price) AS discount_amount,
       ((original_price - price) / original_price * 100) AS discount_percentage
FROM products
WHERE original_price IS NOT NULL
ORDER BY discount_percentage DESC
```

#### 5. **Lowest Unit Price by Category**
```sql
SELECT brand, title, unit_price, comparison_unit
FROM products
WHERE type = ?1 AND unit_price IS NOT NULL
ORDER BY unit_price ASC
LIMIT 10
```

## Data Access Layer

### Frontend Data Flow

```
React Component
    ↓ invoke('save_product', { product })
Tauri IPC Bridge
    ↓
Rust Command Handler
    ↓
DatabaseState (Mutex<Connection>)
    ↓
SQLite Database File
```

### Error Handling

**Error Propagation**:
```rust
.map_err(|e| e.to_string())?
```

**Frontend Error Handling**:
```typescript
try {
  const product = await invoke<Product>('save_product', { product });
  // Success handling
} catch (error) {
  // Error is string from Rust
  console.error('Failed to save product:', error);
}
```

## Performance Considerations

### Indexing Opportunities

**Recommended Indexes** (not yet implemented):
```sql
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_date ON products(date);
CREATE INDEX idx_products_created_at ON products(created_at);
```

### Query Optimization

- **Current**: `ORDER BY created_at DESC` on all reads (sequential scan)
- **Recommended**: Add index on `created_at` for faster sorting
- **Consideration**: SQLite performs well for small-to-medium datasets (<100K rows)

### Concurrency Model

**Rust Side**: `Mutex<Connection>` ensures single-threaded access
**SQLite Mode**: Default (no WAL mode configured)
**Implication**: One write at a time, blocking reads during writes

**Optimization Opportunity**:
```rust
// Enable WAL mode for better concurrency
conn.execute("PRAGMA journal_mode=WAL", [])?;
```

## Future Data Model Extensions

### Planned Features (from User Context)

#### 1. **User Requirements Settings**
```sql
CREATE TABLE user_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    criteria TEXT NOT NULL,  -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### 2. **Inspection Standards**
```sql
CREATE TABLE inspection_standards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    standard_name TEXT NOT NULL,
    criteria TEXT NOT NULL,  -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### 3. **User Reviews Integration**
```sql
CREATE TABLE product_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    source TEXT NOT NULL,  -- 'jd', 'taobao', 'manual'
    rating REAL,
    review_text TEXT,
    review_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)
```

## Testing & Validation

### Current Test Coverage
- ⚠️ **No automated database tests**
- ✅ Manual testing via Tauri app
- ✅ Schema validation on initialization

### Recommended Testing Strategy

1. **Unit Tests**: Rust database operations
2. **Integration Tests**: Tauri command → database flow
3. **Migration Tests**: Schema upgrade scenarios
4. **Performance Tests**: Large dataset queries

---

**Last Updated**: 2025-11-25
**Database Version**: Schema v1.3
**Maintained By**: Development Team
