# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Price Tracker - E-commerce Price Tracking Desktop App

A Tauri 2 + React + TypeScript desktop application for tracking product prices from Chinese e-commerce platforms (JD.com, Taobao, Tmall). Features automated product information parsing, price history visualization, and discount calculation.

## Tech Stack

- **Frontend**: React 18, TypeScript, Ant Design, Vite, Recharts, i18next, Tailwind CSS
- **Backend**: Tauri 2, Rust, SQLite (rusqlite)
- **Testing**: Vitest, @testing-library/react, @testing-library/jest-dom
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

### Testing
```bash
yarn test                # Run unit tests in watch mode (recommended for development)
yarn test:run            # Run all tests once (CI/CD mode)
yarn test:ui             # Open Vitest UI dashboard
yarn test:coverage       # Generate coverage report
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
  - Fully tested with 17 unit tests covering all parsing scenarios
  - Handles: brand extraction, quantity/unit parsing, discounts, government subsidies
- **TaobaoProductParser**: Parses Taobao/Tmall plain text format
  - Fully tested with 20 unit tests covering all parsing scenarios
  - Handles: VALUE-KEY and KEY-VALUE formats, discounts, specifications
- **PlainTextParser**: Generic fallback parser
  - Fully tested with 17 unit tests
  - Handles: brand extraction patterns, multi-line prices, discount parsing

**To add a new parser:**
1. Implement `IProductInfoParser` interface in `src/utils/parsers/types.ts`
2. Register in `ParserManager` constructor (order matters - specific before generic)
3. Write comprehensive unit tests (see [TESTING.md](./TESTING.md))

### Rust Backend Commands
Defined in `src-tauri/src/lib.rs`:
- `save_product` - Insert new product
- `update_product` - Update existing product
- `delete_product` - Remove product
- `get_products` - Fetch all products (ordered by created_at DESC)
- `get_database_path` - Get current SQLite database file location
- `set_database_path` - Set a new database path and reconnect

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
  - Fully tested with 38 unit tests covering all conversion scenarios
  - Base unit: 斤 (jin) for weight/volume conversions
  - Supports: g, kg, jin, liang, ml, L, piece

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

The database path is **fully configurable** through both configuration file and runtime commands.

### Configuration Methods

#### 1. Configuration File (Recommended for Permanent Setup)
Edit `src-tauri/tauri.conf.json`:
```json
{
  "plugins": {
    "database": {
      "path": "/path/to/your/products.db"
    }
  }
}
```
Leave the `path` empty (`""`) to use the default location.

#### 2. Runtime API (For Dynamic Changes)

**Get current database path:**
```typescript
import { invoke } from '@tauri-apps/api/core';
const dbPath = await invoke<string>('get_database_path');
```

**Set a new database path:**
```typescript
import { invoke } from '@tauri-apps/api/core';
const newPath = '/path/to/your/products.db';
await invoke<string>('set_database_path', { newPath });
// Database automatically reconnects to new location
```

### Default Locations (Priority Order)

1. **Custom path in config** (`plugins.database.path` in `tauri.conf.json`) - if set
2. **App data directory** (platform-specific, recommended for production):
   - macOS: `~/Library/Application Support/com.md-react.app/products.db`
   - Windows: `%APPDATA%\com.md-react.app\products.db`
   - Linux: `~/.local/share/com.md-react.app/products.db`
3. **Fallback**: Current working directory (`./products.db`) if app data dir is unavailable

### Features
- Automatically creates parent directories if they don't exist
- Reconnects to the new database location immediately (when using `set_database_path`)
- Creates necessary tables in the new database if they don't exist
- Preserves existing database structure and data at the configured location
- Config file path takes precedence over default locations

The database file is tracked in git but may contain local data.

## Adding New Product Parsers

1. Create new parser class in `src/utils/parsers/` implementing `IProductInfoParser`
2. Implement `canParse(text: string): boolean` - return true if text matches your format
3. Implement `parse(text: string): ParseResult` - extract product data
4. Register in `ParserManager` constructor (specific parsers before generic ones)
5. **Write unit tests** in `src/tests/parsers/YourParser.test.ts` (see [TESTING.md](./TESTING.md))
6. Run `yarn test` to verify all tests pass

## Testing

This project has comprehensive unit tests using **Vitest**. See [TESTING.md](./TESTING.md) for detailed documentation.

### Test Coverage

- **Parsers**: JDProductParser, TaobaoProductParser, PlainTextParser (54 tests)
- **Utilities**: Unit conversion functions (38 tests)
- **Total**: 96 tests, 100% pass rate

### Running Tests

```bash
# Watch mode (auto-rerun on file changes)
yarn test

# Run once (for CI/CD)
yarn test:run

# Visual UI dashboard
yarn test:ui

# With coverage report
yarn test:coverage
```

### Test Files Location

```
src/tests/
├── setup.ts                    # Global test setup
├── parsers/
│   ├── JDProductParser.test.ts
│   ├── TaobaoProductParser.test.ts
│   └── PlainTextParser.test.ts
└── utils/
    └── unitConversion.test.ts
```

### Writing Tests

When adding new parsers or utilities, add corresponding test files:

1. Create `*.test.ts` file in appropriate `src/tests/` subdirectory
2. Import the module to test and Vitest functions
3. Write descriptive test cases using `describe` and `it` blocks
4. Run `yarn test` to verify tests pass

See [TESTING.md](./TESTING.md) for test templates and best practices.

### Manual Testing

- Use `yarn dev` for quick frontend testing (uses localStorage, no Tauri needed)
- Use `yarn tauri dev` for full integration testing with SQLite

## Continuous Integration

The project is CI/CD ready with comprehensive unit tests. Example GitHub Actions workflow:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: yarn install
      - run: yarn test:run
      - run: yarn build
```

For coverage reporting, use `yarn test:coverage` to generate HTML/JSON reports that can be uploaded to coverage services like Codecov or Coveralls.

## Project Structure

```
price-tracker/
├── src/
│   ├── components/          # React components
│   ├── contexts/            # React contexts (Theme, Language)
│   ├── i18n/                # Internationalization files
│   ├── tests/               # Unit tests
│   │   ├── setup.ts         # Test configuration
│   │   ├── parsers/         # Parser tests
│   │   └── utils/           # Utility tests
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
│       ├── parsers/         # Product info parsers
│       └── *.ts             # Various utilities
├── src-tauri/               # Rust backend
│   └── src/
│       └── lib.rs           # Tauri commands
├── vitest.config.ts         # Vitest configuration
├── TESTING.md               # Testing documentation
├── CLAUDE.md                # This file
└── package.json             # Dependencies and scripts
```
