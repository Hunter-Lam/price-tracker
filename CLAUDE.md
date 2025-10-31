# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Price Tracker - E-commerce Price Tracking Desktop App

A Tauri 2 + React + TypeScript desktop application for tracking product prices from Chinese e-commerce platforms (JD.com, Taobao, Tmall). Features automated product information parsing, price history visualization, and discount calculation.

## Tech Stack

- **Frontend**: React 18, TypeScript, Ant Design, Vite, Recharts, i18next, Tailwind CSS
- **Backend**: Tauri 2, Rust, SQLite (rusqlite)
- **Key Libraries**: dayjs (date handling), @tauri-apps/api (Tauri integration)

## Common Commands

**Note**: This project uses **yarn** as the recommended package manager.

### Development
```bash
yarn dev                 # Start Vite dev server (browser mode with localStorage)
yarn tauri dev           # Start Tauri desktop app (uses SQLite database)
```

### Building
```bash
yarn build               # Build frontend (includes TypeScript compilation)
yarn tauri build         # Build Tauri desktop app for production
```

### Testing Parsers
```bash
node test_parser.cjs           # Test JD product parser
node test_taobao_parser.cjs    # Test Taobao product parser
```

## Architecture

### Dual Storage Strategy
The app uses **storage.ts** as a unified abstraction layer:
- **Tauri environment** (`window.isTauri` === true): Uses SQLite via Rust commands
- **Browser environment**: Falls back to localStorage for development

All data operations (CRUD) go through `src/utils/storage.ts`, which automatically detects the environment and routes to the appropriate backend.

### Product Information Parsers (Strategy Pattern)
Located in `src/utils/parsers/`, this system parses product info from pasted text:

- **ParserManager**: Manages all parsers, tries them in sequence
- **JDProductParser**: Parses JD.com JSON product data (price, discounts, specifications)
- **TaobaoProductParser**: Parses Taobao/Tmall plain text format
- **PlainTextParser**: Generic fallback parser

**To add a new parser:**
1. Implement `IProductInfoParser` interface in `src/utils/parsers/types.ts`
2. Register in `ParserManager` constructor (order matters - specific before generic)

### Rust Backend Commands
Defined in `src-tauri/src/lib.rs`:
- `save_product` - Insert new product
- `update_product` - Update existing product
- `delete_product` - Remove product
- `get_products` - Fetch all products (ordered by created_at DESC)
- `get_database_path` - Get SQLite database file location

### Database Schema
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL,           -- URL or store address
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    type TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    discount TEXT,                   -- JSON string of DiscountItem[]
    specification TEXT,
    date TEXT NOT NULL,              -- YYYY-MM-DD format
    remark TEXT,
    quantity REAL,
    unit TEXT,
    unit_price REAL,
    comparison_unit TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### State Management
- **React Context**: Theme (dark/light) and language (en/zh) - see `src/contexts/`
- **Local state**: Product data, form state managed in `App.tsx`
- **Column visibility**: Persisted to localStorage separately from product data

### Key Data Flow
1. User pastes product info → `PasteParseModal` → `ParserManager.parse()`
2. Parser extracts data → Populates form fields in `ProductForm`
3. User submits → `App.tsx` → `storage.ts` → Tauri command or localStorage
4. Products loaded → `ProductTable` displays with `ColumnController` for visibility
5. Price history → `PriceHistoryChart` filters by product and date range

## Component Organization

### Main Components
- **App.tsx**: Root component, orchestrates all features, manages product state
- **ProductForm.tsx**: Add/edit product form with discount inputs, unit price calculations
- **ProductTable.tsx**: Product listing with editable rows, delete actions, URL opening
- **PriceHistoryChart.tsx**: Recharts-based price visualization with date filtering
- **ColumnController.tsx**: Toggle table column visibility (settings saved to localStorage)

### Feature Components
- **PasteParseModal.tsx**: Modal for pasting and parsing product info
- **JDSpecImporter.tsx**: Import JD product specifications
- **DiscountParser.tsx**: Parse discount text into structured DiscountItem[]
- **DiscountInput.tsx**: Input fields for individual discount items
- **UnitPriceInput.tsx**: Calculate unit price from quantity and price

### Utilities
- **urlParser.ts**: Extract product IDs from JD/Taobao/Tmall URLs
- **csvExport.ts**: Export products to CSV
- **csvImport.ts**: Import products from CSV/Excel (handles UTF-8 encoding)
- **unitConversion.ts**: Convert between different units (g, kg, ml, L, etc.)

## Supported E-commerce Platforms

### JD.com (京东)
- Parses JSON format from JD product pages
- Extracts: price, original price, discounts (coupons, promotions, government subsidies), brand, specifications
- URL format: `https://item.jd.com/{product_id}.html`

### Taobao/Tmall (淘宝/天猫)
- Parses plain text format
- Extracts: price, discounts, brand from parameter info section
- Identifies by keywords: "参数信息", "优惠前", "券后"

## Important Implementation Details

### Discount System
Discounts are stored as JSON string of `DiscountItem[]`:
```typescript
interface DiscountItem {
  discountOwner: DiscountOrganizerType;  // 'store' | 'platform' | 'government'
  discountType: DiscountMethodType;       // 'percentage' | 'fixed' | 'coupon'
  discountValue: string | number;
}
```

The `DiscountParser` component calculates `originalPrice` from `price` + discounts.

### Unit Price Calculation
Products can have quantity/unit (e.g., "500g") and a comparison unit (e.g., "500g"). The `unitPrice` is auto-calculated and displayed for price comparison.

### Internationalization
- i18next with English and Chinese translations in `src/i18n/`
- Ant Design locale switches automatically via `ConfigProvider`
- Document title updates via `useDocumentTitle` hook

### Theme Management
- Dark/light mode via `ThemeContext` and Ant Design's ConfigProvider
- Theme persisted to localStorage

## Prerequisites

### Node.js and Yarn
1. Install Node.js LTS version (18+ recommended) from [nodejs.org](https://nodejs.org/)
2. Install Yarn package manager:
```bash
npm install -g yarn
# or via Homebrew on macOS
brew install yarn
```

3. Install project dependencies:
```bash
yarn install
```

### Rust Installation
Required for Tauri development:
```bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
# Select option 1 for standard installation
```

After installation:
```bash
. "$HOME/.cargo/env"  # Add Cargo to PATH
```

## Database Location

- **Development**: Current working directory (`./products.db`)
- **Production**: Retrieved via `get_database_path` Tauri command

The database file is tracked in git but may contain local data.

## Adding New Product Parsers

1. Create new parser class in `src/utils/parsers/` implementing `IProductInfoParser`
2. Implement `canParse(text: string): boolean` - return true if text matches your format
3. Implement `parse(text: string): ParseResult` - extract product data
4. Register in `ParserManager` constructor (specific parsers before generic ones)
5. Test with a standalone script (see `test_parser.cjs` as example)

## Testing Notes

- Use `yarn dev` for quick frontend testing (uses localStorage, no Tauri needed)
- Use `yarn tauri dev` for full integration testing with SQLite
- Parser test scripts are CommonJS files for easy Node.js execution
