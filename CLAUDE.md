# Price Tracker - Project Overview

A desktop application built with Tauri, React, and TypeScript for tracking product prices across different e-commerce platforms. The app allows users to monitor price history, manage product information, and analyze discount trends.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Ant Design (antd)** - UI component library
- **Vite** - Build tool and dev server
- **Recharts** - Data visualization for price history charts
- **i18next** - Internationalization (supports English and Chinese)
- **dayjs** - Date manipulation
- **Tailwind CSS** - Styling

### Backend
- **Tauri 2** - Desktop app framework
- **Rust** - Backend logic
- **SQLite (rusqlite)** - Local database for data persistence

## Project Structure

```
price-tracker/
├── src/                          # Frontend React source
│   ├── components/               # React components
│   │   ├── ProductForm.tsx       # Add/Edit product form
│   │   ├── ProductTable.tsx      # Product listing table
│   │   ├── PriceHistoryChart.tsx # Price history visualization
│   │   ├── ColumnController.tsx  # Table column visibility control
│   │   ├── DiscountParser.tsx    # Discount calculation logic
│   │   ├── DiscountInput.tsx     # Discount input fields
│   │   ├── DiscountSection.tsx   # Discount display section
│   │   ├── SourceInput.tsx       # Product source (URL/store) input
│   │   ├── ThemeToggle.tsx       # Dark/light mode toggle
│   │   └── LanguageToggle.tsx    # Language switcher
│   ├── contexts/                 # React contexts
│   │   ├── ThemeContext.tsx      # Theme management
│   │   └── LanguageContext.tsx   # Language management
│   ├── hooks/                    # Custom React hooks
│   │   └── useDocumentTitle.ts   # Dynamic document title
│   ├── utils/                    # Utility functions
│   │   ├── storage.ts            # Database abstraction layer
│   │   ├── urlParser.ts          # URL parsing for e-commerce sites
│   │   ├── urlFormatter.ts       # URL formatting
│   │   ├── csvExport.ts          # Export to CSV
│   │   ├── csvImport.ts          # Import from CSV/Excel
│   │   └── openUrl.ts            # Open URLs in browser
│   ├── types/                    # TypeScript type definitions
│   ├── constants/                # Application constants
│   ├── i18n/                     # Internationalization configs
│   └── App.tsx                   # Main application component
├── src-tauri/                    # Tauri/Rust backend
│   ├── src/
│   │   ├── lib.rs                # Database operations and Tauri commands
│   │   └── main.rs               # Application entry point
│   ├── Cargo.toml                # Rust dependencies
│   └── products.db               # SQLite database (generated at runtime)
└── package.json                  # Node dependencies
```

## Core Features

### 1. Product Management
- Add/edit/delete products with detailed information
- Fields: title, brand, type, price, original price, discount details, specification, date, remarks
- Support for both URL sources (e-commerce links) and physical store addresses
- Edit existing records or insert as new entries

### 2. Price Tracking
- Visual price history chart using Recharts
- Track price changes over time
- Display percentage paid vs original price
- Reference lines for affordable price targets

### 3. Discount Management
- Complex discount calculation system
- Support for multiple discount types:
  - Percentage discounts
  - Fixed amount reductions
  - Coupon codes
  - Store promotions
- Discount parser for automatic calculation

### 4. Data Import/Export
- CSV export functionality
- Excel import support (with encoding handling for UTF-8)
- Bulk product import

### 5. Customization
- Column visibility controller for the product table
- Dark/light theme toggle
- Bilingual support (English/Chinese)
- Responsive layout

## Database Schema

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL,           -- URL or store address
    title TEXT NOT NULL,              -- Product name
    brand TEXT NOT NULL,              -- Brand name
    type TEXT NOT NULL,               -- Product category
    price REAL NOT NULL,              -- Current price
    original_price REAL,              -- Original price
    discount TEXT,                    -- JSON string of discount details
    specification TEXT,               -- Product specs
    date TEXT NOT NULL,               -- Price snapshot date
    remark TEXT,                      -- Additional notes
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Key Components

### App.tsx
Main application component that orchestrates all functionality:
- Product state management
- Form handling for add/edit operations
- Column visibility configuration
- Integration with storage layer

### storage.ts
Unified storage abstraction that works in both browser and Tauri environments:
- Tauri environment: SQLite database via Rust commands
- Browser environment: localStorage fallback
- Operations: save, update, delete, get, import products

### lib.rs (Tauri Backend)
Rust-based backend with Tauri commands:
- `save_product` - Insert new product
- `update_product` - Update existing product
- `delete_product` - Remove product
- `get_products` - Fetch all products
- `get_database_path` - Get database location

## Development Workflow

### Running in Development
```bash
npm run dev              # Start Vite dev server
npm run tauri dev        # Start Tauri app with hot reload
```

### Building for Production
```bash
npm run build            # Build frontend
npm run tauri build      # Build Tauri desktop app
```

### Type Checking
```bash
npm run build            # Includes TypeScript compilation (tsc)
```

## Environment Detection

The app automatically detects whether it's running in:
- **Tauri environment**: Uses SQLite database via Rust backend
- **Browser environment**: Uses localStorage for data persistence

Check via: `storage.isTauriEnvironment()`

## Data Formats

### Product Type
```typescript
interface Product {
  id?: number;
  address: string;
  title: string;
  brand: string;
  type: CategoryType;
  price: number;
  originalPrice?: number;
  discount?: string;          // JSON string
  specification?: string;
  date: string;              // YYYY-MM-DD format
  remark?: string;
  created_at?: string;
}
```

### Discount Item
```typescript
interface DiscountItem {
  discountOwner: DiscountOrganizerType;   // Store, platform, etc.
  discountType: DiscountMethodType;       // Percentage, fixed, etc.
  discountValue: string | number;
}
```

## Supported E-commerce Platforms

The URL parser supports extracting product IDs from:
- JD.com (京东)
- Taobao (淘宝)
- Tmall (天猫)
- Generic URLs

## Known Issues & TODOs

See [README.md](README.md) for the current TODO list, which includes:
- Dark mode improvements
- Page width optimization
- Enhanced discount parsing
- Additional e-commerce platform support

## Installation Prerequisites

### Rust
Required for Tauri development:
```bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
# Select option 1 for standard installation
```

After installation, add Cargo to PATH:
```bash
. "$HOME/.cargo/env"
```

### Node.js
Required for frontend development (use a recent LTS version)

## Important Files

- [package.json](package.json) - Node dependencies and scripts
- [src-tauri/Cargo.toml](src-tauri/Cargo.toml) - Rust dependencies
- [src/App.tsx](src/App.tsx) - Main React component
- [src-tauri/src/lib.rs](src-tauri/src/lib.rs) - Rust backend logic
- [src/utils/storage.ts](src/utils/storage.ts) - Data persistence layer

## Git Workflow

Current branch: `main`
Database file (`src-tauri/products.db`) is tracked in git but may contain local data.

## Architecture Notes

### Storage Strategy
The application uses a dual-storage strategy:
1. **Production (Tauri)**: SQLite database managed by Rust backend
2. **Development (Browser)**: localStorage fallback for quick testing

### State Management
- React Context API for theme and language
- Local component state for form and product data
- No external state management library (Redux, MobX, etc.)

### Styling Approach
- Ant Design components for UI consistency
- Tailwind CSS for custom styling
- Theme support via Ant Design's ConfigProvider

### Internationalization
- i18next for translation management
- Separate translation files for English and Chinese
- Dynamic locale switching for Ant Design components
