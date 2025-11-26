# API Contracts - Tauri Commands

> **Generated**: 2025-11-25
> **Project**: Price Tracker (Tauri Desktop App)
> **Communication**: Tauri IPC (Inter-Process Communication)

## Overview

This document describes the API surface between the React frontend and Rust backend via Tauri's IPC mechanism. All commands are invoked using `@tauri-apps/api/core` `invoke` function.

## Command Invocation Pattern

```typescript
import { invoke } from '@tauri-apps/api/core';

// Example
const result = await invoke<Product>('save_product', { product: productData });
```

## Product Management Commands

### 1. save_product

**Create a new product record**

#### Request

```typescript
invoke<Product>('save_product', { product: ProductInput })
```

**Parameters**:
- `product`: ProductInput object (see Data Models)

**Example**:
```typescript
const newProduct: ProductInput = {
  address: "https://item.jd.com/12345.html",
  title: "Example Product",
  brand: "BrandName",
  type: "食品",
  price: 99.99,
  originalPrice: 129.99,
  discount: JSON.stringify([{
    discountOwner: "platform",
    discountType: "coupon",
    discountValue: 30
  }]),
  specification: "500g",
  date: "2025-11-25",
  remark: "First purchase",
  quantity: 500,
  unit: "g",
  unitPrice: 0.2,
  comparisonUnit: "500g"
};

const product = await invoke<Product>('save_product', { product: newProduct });
```

#### Response

**Success**:
```typescript
{
  id: 123,
  address: "https://item.jd.com/12345.html",
  title: "Example Product",
  brand: "BrandName",
  type: "食品",
  price: 99.99,
  originalPrice: 129.99,
  discount: "[{\"discountOwner\":\"platform\",\"discountType\":\"coupon\",\"discountValue\":30}]",
  specification: "500g",
  date: "2025-11-25",
  remark: "First purchase",
  quantity: 500,
  unit: "g",
  unitPrice: 0.2,
  comparisonUnit: "500g",
  created_at: "2025-11-25 08:30:45"
}
```

**Error**:
```typescript
// Throws string error message
throw "Failed to save product: database locked"
```

---

### 2. get_products

**Retrieve all product records**

#### Request

```typescript
invoke<Product[]>('get_products')
```

**Parameters**: None

**Example**:
```typescript
const products = await invoke<Product[]>('get_products');
console.log(`Loaded ${products.length} products`);
```

#### Response

**Success**:
```typescript
[
  {
    id: 123,
    address: "https://item.jd.com/12345.html",
    title: "Example Product",
    // ... full Product object
  },
  {
    id: 122,
    address: "https://detail.tmall.com/item.htm?id=67890",
    title: "Another Product",
    // ... full Product object
  }
  // Ordered by created_at DESC (newest first)
]
```

**Error**:
```typescript
throw "Failed to get products: database connection error"
```

**Notes**:
- Returns empty array `[]` if no products exist
- Always sorted by `created_at DESC`
- Includes all fields including `id` and `created_at`

---

### 3. update_product

**Update an existing product record**

#### Request

```typescript
invoke<Product>('update_product', { id: number, product: ProductInput })
```

**Parameters**:
- `id`: Product ID to update
- `product`: Updated ProductInput data

**Example**:
```typescript
const updatedData: ProductInput = {
  address: "https://item.jd.com/12345.html",
  title: "Updated Product Title",
  brand: "BrandName",
  type: "食品",
  price: 89.99,  // Price changed
  originalPrice: 129.99,
  discount: JSON.stringify([{
    discountOwner: "platform",
    discountType: "coupon",
    discountValue: 40  // Discount increased
  }]),
  specification: "500g",
  date: "2025-11-25",
  remark: "Price dropped!",
  quantity: 500,
  unit: "g",
  unitPrice: 0.18,
  comparisonUnit: "500g"
};

const product = await invoke<Product>('update_product', {
  id: 123,
  product: updatedData
});
```

#### Response

**Success**:
```typescript
{
  id: 123,
  address: "https://item.jd.com/12345.html",
  title: "Updated Product Title",
  // ... updated fields
  created_at: "2025-11-25 08:30:45"  // Original creation time preserved
}
```

**Error**:
```typescript
throw "Failed to update product: product with id 123 not found"
throw "Failed to update product: database locked"
```

**Notes**:
- `created_at` is NOT updated (preserves original creation time)
- All fields except `id` and `created_at` can be updated
- Returns the updated Product object

---

### 4. delete_product

**Delete a product record**

#### Request

```typescript
invoke<void>('delete_product', { id: number })
```

**Parameters**:
- `id`: Product ID to delete

**Example**:
```typescript
await invoke('delete_product', { id: 123 });
console.log('Product deleted successfully');
```

#### Response

**Success**:
```typescript
// Returns void (no data)
undefined
```

**Error**:
```typescript
throw "Failed to delete product: database error"
```

**Notes**:
- No error if product ID doesn't exist (SQL DELETE succeeds with 0 rows affected)
- Permanent deletion (no soft delete)
- No cascade relationships (single table)

---

## Database Management Commands

### 5. get_database_path

**Get the current database file path**

#### Request

```typescript
invoke<string>('get_database_path')
```

**Parameters**: None

**Example**:
```typescript
const dbPath = await invoke<string>('get_database_path');
console.log('Database location:', dbPath);
```

#### Response

**Success**:
```typescript
"/Users/username/Library/Application Support/com.md-react.app/products.db"
```

**Error**:
```typescript
throw "Failed to get database path: state lock error"
```

**Use Cases**:
- Display current database location to user
- Verify database path after configuration change
- Debugging and support

---

### 6. set_database_path

**Change the database file location**

#### Request

```typescript
invoke<string>('set_database_path', { newPath: string })
```

**Parameters**:
- `newPath`: Absolute path to new database file

**Example**:
```typescript
const newPath = "/Users/username/Documents/my-products.db";
const confirmedPath = await invoke<string>('set_database_path', {
  newPath
});
console.log('Database moved to:', confirmedPath);
```

#### Response

**Success**:
```typescript
"/Users/username/Documents/my-products.db"
```

**Error**:
```typescript
throw "Failed to reconnect to database: permission denied"
throw "Failed to reconnect to database: invalid path"
```

**Behavior**:
1. Creates parent directories if they don't exist
2. Opens/creates database at new location
3. Creates schema if new database
4. Replaces current connection
5. Returns confirmed new path

**Notes**:
- Existing data at old location is NOT moved
- New database starts empty (or uses existing data at new path)
- Frontend should reload products after path change

---

## Legacy/Demo Command

### greet

**Demo command (not used in production)**

#### Request

```typescript
invoke<string>('greet', { name: string })
```

**Parameters**:
- `name`: Name to greet

**Example**:
```typescript
const greeting = await invoke<string>('greet', { name: 'Hunter' });
console.log(greeting); // "Hello, Hunter! You've been greeted from Rust!"
```

#### Response

**Success**:
```typescript
"Hello, Hunter! You've been greeted from Rust!"
```

**Notes**:
- Part of Tauri template
- Can be removed in production
- Useful for testing IPC connectivity

---

## Error Handling

### Error Format

All Tauri commands return errors as **string messages**:

```typescript
try {
  const product = await invoke<Product>('save_product', { product });
} catch (error) {
  // error is a string
  console.error('Command failed:', error);
  // Example: "Failed to save product: database locked"
}
```

### Common Error Scenarios

| Error Message Pattern | Cause | Resolution |
|----------------------|-------|------------|
| `"database locked"` | Concurrent write operations | Retry with backoff |
| `"database connection error"` | Database file unavailable | Check file permissions |
| `"product with id X not found"` | Update/delete non-existent product | Refresh product list |
| `"permission denied"` | File system access issue | Check directory permissions |
| `"invalid path"` | Malformed database path | Validate path format |

---

## Frontend Integration Patterns

### 1. **Loading Products on App Mount**

```typescript
useEffect(() => {
  const loadProducts = async () => {
    try {
      const products = await invoke<Product[]>('get_products');
      setProducts(products);
    } catch (error) {
      message.error(`Failed to load products: ${error}`);
    }
  };

  if (window.isTauri) {
    loadProducts();
  } else {
    // Use localStorage fallback
    setProducts(getProductsFromLocalStorage());
  }
}, []);
```

### 2. **Creating Product with Error Handling**

```typescript
const handleSubmit = async (values: ProductInput) => {
  try {
    const product = await invoke<Product>('save_product', { product: values });
    message.success('Product saved successfully');
    setProducts(prev => [product, ...prev]);
  } catch (error) {
    message.error(`Failed to save: ${error}`);
  }
};
```

### 3. **Updating Product with Optimistic UI**

```typescript
const handleUpdate = async (id: number, values: ProductInput) => {
  // Optimistic update
  const optimisticProduct = { ...values, id };
  setProducts(prev => prev.map(p => p.id === id ? optimisticProduct : p));

  try {
    const updated = await invoke<Product>('update_product', { id, product: values });
    // Replace optimistic with actual
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
    message.success('Product updated');
  } catch (error) {
    // Rollback on error
    const products = await invoke<Product[]>('get_products');
    setProducts(products);
    message.error(`Update failed: ${error}`);
  }
};
```

### 4. **Deleting with Confirmation**

```typescript
const handleDelete = (id: number) => {
  Modal.confirm({
    title: 'Delete Product?',
    content: 'This action cannot be undone.',
    async onOk() {
      try {
        await invoke('delete_product', { id });
        setProducts(prev => prev.filter(p => p.id !== id));
        message.success('Product deleted');
      } catch (error) {
        message.error(`Delete failed: ${error}`);
      }
    },
  });
};
```

---

## Type Safety

### TypeScript Definitions

All Tauri commands have corresponding TypeScript types:

```typescript
// src/types/index.ts
export interface Product { /* ... */ }
export interface ProductInput { /* ... */ }

// Usage with invoke
import { invoke } from '@tauri-apps/api/core';
import type { Product, ProductInput } from './types';

const product = await invoke<Product>('save_product', {
  product: productInput
});
// product is typed as Product
```

### Rust-TypeScript Mapping

| Rust Type | TypeScript Type | Notes |
|-----------|-----------------|-------|
| `i64` | `number` | Integer IDs |
| `f64` | `number` | Prices, quantities |
| `String` | `string` | Text fields |
| `Option<T>` | `T \| undefined` | Optional fields |
| `Vec<T>` | `T[]` | Arrays |
| `Result<T, String>` | `Promise<T>` | Async commands, throws on error |

### Serde Serialization

**Rust → JSON → TypeScript**:
- Field names converted: `snake_case` → `camelCase`
- `#[serde(rename = "...")]` enforces specific names
- JSON serialization handles nested structures (e.g., discount array)

---

## Performance Characteristics

| Command | Typical Duration | Blocking | Notes |
|---------|-----------------|----------|-------|
| `get_products` | 10-50ms | Yes | Linear with product count |
| `save_product` | 5-20ms | Yes | Single INSERT |
| `update_product` | 5-20ms | Yes | Single UPDATE |
| `delete_product` | 3-10ms | Yes | Single DELETE |
| `get_database_path` | <1ms | No | Memory read |
| `set_database_path` | 20-100ms | Yes | File I/O + schema creation |

**Optimization Notes**:
- All database commands are **blocking** (sequential)
- No batch operations supported
- Consider debouncing rapid updates
- Large product lists (>1000) may benefit from pagination

---

## Future API Extensions

### Planned Features

#### 1. **Search/Filter Products**
```typescript
invoke<Product[]>('search_products', {
  query: string,
  filters: { brand?: string, type?: string }
})
```

#### 2. **Get Price History**
```typescript
invoke<PricePoint[]>('get_price_history', {
  productId: number
})
```

#### 3. **Export Data**
```typescript
invoke<string>('export_to_csv', {
  products: number[]
})
```

#### 4. **Import Data**
```typescript
invoke<ImportResult>('import_from_csv', {
  filePath: string
})
```

---

**Last Updated**: 2025-11-25
**Tauri Version**: 2.x
**Maintained By**: Development Team
