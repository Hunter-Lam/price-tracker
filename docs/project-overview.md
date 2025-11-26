# Project Overview - Price Tracker

> **Generated**: 2025-11-25
> **Type**: Desktop Application (Tauri 2)
> **Status**: Active Development

## Project Summary

**Price Tracker** is a cross-platform desktop application designed to help users track product prices from Chinese e-commerce platforms (JD.com, Taobao, Tmall). The application combines automatic product information parsing, price history visualization, discount calculation, and intelligent price comparison features.

### Vision

Beyond simple price tracking, Price Tracker aims to become a comprehensive **product evaluation and purchasing decision support system** that helps users make informed buying decisions through:
- Automated price tracking and trend analysis
- Best deal calculation across multiple platforms
- Product order history and records
- User-defined product requirements and inspection standards
- Integration with actual user reviews

---

## Current Features

### ✅ Implemented

**1. Product Management**
- Add, edit, and delete product records
- Track multiple products across different platforms
- Organize products by category (食品, 日用品, 電子產品, etc.)
- Support for JD.com, Taobao, Tmall, and generic sources

**2. Automatic Product Information Parsing**
- **JD.com Parser**: Extract product data from JD JSON format
- **Taobao Parser**: Parse Taobao/Tmall plain text product info
- **Generic Parser**: Fallback for other formats
- Auto-populate form fields from pasted text

**3. Price Tracking & Analysis**
- Record historical prices with dates
- Original price vs. final price comparison
- Discount breakdown by source (store/platform/government)
- Discount types: Percentage, fixed amount, coupons

**4. Unit Price Calculation**
- Automatic unit price calculation (e.g., ¥/500g)
- Support for weight units (g, kg, 斤, 両)
- Support for volume units (ml, L)
- Support for piece units (件, 個)
- Unit conversion for price comparison

**5. Price History Visualization**
- Interactive line charts (Recharts)
- Filter by product (title + brand)
- Filter by date range
- Compare original vs. final prices
- Trend analysis

**6. Data Management**
- **CSV Export**: Export all products to CSV
- **CSV Import**: Import products from CSV/Excel
- **Database Management**: Configurable SQLite database location
- **Dual Storage**: SQLite (Tauri) or localStorage (browser dev)

**7. User Experience**
- **Multi-language**: English and Chinese (i18next)
- **Theme Support**: Dark and light modes
- **Column Control**: Toggle table column visibility
- **Responsive Layout**: Desktop-optimized UI
- **Keyboard Shortcuts**: Efficient data entry

**8. Testing**
- 92 unit tests (parsers, utilities)
- 100% pass rate
- Vitest + Testing Library

---

### 🔄 Planned Features (Not Yet Implemented)

**1. User Product Requirements Settings**
- Define product criteria and preferences
- Save requirement templates
- Auto-match products to requirements

**2. Product Inspection Standards**
- Create inspection checklists
- QA criteria for product evaluation
- Pass/fail compliance indicators

**3. Actual User Reviews Integration**
- Aggregate reviews from JD, Taobao, etc.
- Review summary and sentiment analysis
- Rating visualization

**4. Advanced Analytics**
- Best deal finder across products
- Price drop alerts
- Seasonal trend analysis
- Brand comparison

---

## Technology Summary

### Core Technologies

| Category | Technology | Role |
|----------|-----------|------|
| **Framework** | Tauri 2 | Cross-platform desktop app |
| **Frontend** | React 18 + TypeScript | UI components and logic |
| **Backend** | Rust | Native backend, database operations |
| **UI Library** | Ant Design 5 | Enterprise React components |
| **Database** | SQLite | Local embedded database |
| **Charts** | Recharts | Price history visualization |
| **i18n** | i18next | Multi-language support |
| **Build** | Vite 6 | Fast frontend builds |
| **Testing** | Vitest 4 | Unit test framework |

### Architecture Type

**Pattern**: **Component-Based Desktop Application with IPC Bridge**

- **Frontend**: React component hierarchy with Context API for state
- **Backend**: Rust command handlers with SQLite persistence
- **Communication**: Tauri IPC (invoke/command pattern)
- **Data Flow**: Unidirectional (UI → Commands → Database)

---

## Repository Structure

```
price-tracker/
├── src/                    # React frontend
│   ├── components/         # 16 React components
│   ├── utils/              # Utilities and parsers
│   ├── contexts/           # Theme and language contexts
│   ├── tests/              # 92 unit tests
│   └── types/              # TypeScript definitions
│
├── src-tauri/              # Rust backend
│   ├── src/lib.rs          # 7 Tauri commands + DB management
│   └── Cargo.toml          # Rust dependencies
│
├── docs/                   # Generated documentation
│   ├── architecture.md
│   ├── component-inventory.md
│   ├── data-models.md
│   ├── api-contracts.md
│   └── ...
│
├── README.md               # Project readme
├── CLAUDE.md               # Claude Code guidance
├── TESTING.md              # Testing documentation
└── package.json            # NPM dependencies
```

---

## Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root application component |
| `src/main.tsx` | React entry point |
| `src/utils/storage.ts` | Unified storage abstraction (Tauri/localStorage) |
| `src/utils/parsers/ParserManager.ts` | Product info parser orchestrator |
| `src-tauri/src/lib.rs` | Tauri commands and database logic |
| `src-tauri/tauri.conf.json` | Tauri configuration |
| `package.json` | Frontend dependencies and scripts |

### Development Commands

```bash
# Install dependencies
yarn install

# Frontend development (browser mode)
yarn dev

# Full desktop app development
yarn tauri dev

# Run tests
yarn test

# Build production app
yarn tauri build
```

### Tauri Commands (IPC API)

| Command | Purpose |
|---------|---------|
| `save_product` | Create new product |
| `get_products` | Fetch all products |
| `update_product` | Update existing product |
| `delete_product` | Remove product |
| `get_database_path` | Get current database location |
| `set_database_path` | Change database location |

---

## Database Schema

### Products Table

**Primary Entity**: Product tracking records

**Key Fields**:
- Identity: `id` (auto-increment)
- Product: `title`, `brand`, `type`, `specification`
- Pricing: `price`, `original_price`, `discount` (JSON)
- Quantity: `quantity`, `unit`, `unit_price`, `comparison_unit`
- Metadata: `address`, `date`, `remark`, `created_at`

**Total Fields**: 15

**Design**: Single-table with JSON for flexible discount structure

---

## Component Inventory

### Core Components (3)

1. **ProductForm** - Main form for add/edit operations
2. **ProductTable** - Product list with inline editing
3. **PriceHistoryChart** - Price trend visualization

### Input Components (7)

- DiscountSection, DiscountInput, DiscountParser
- UnitPriceInput, UnitSelect
- SourceInput, JDSpecImporter

### Utility Components (6)

- PasteParseModal, ColumnController
- ThemeToggle, LanguageToggle
- UnitPriceDisplay

**Total**: 16 components

**Reusability**: 60% high/very high reusability

---

## Parser System

### Supported Platforms

1. **JD.com (京东)**
   - Format: JSON
   - Parser: JDProductParser
   - Tests: 17 unit tests

2. **Taobao/Tmall (淘宝/天猫)**
   - Format: Plain text
   - Parser: TaobaoProductParser
   - Tests: 20 unit tests

3. **Generic**
   - Format: Any text
   - Parser: PlainTextParser (fallback)
   - Tests: 17 unit tests

**Total**: 3 parsers, 54 tests

**Extensibility**: Easy to add new parsers via Strategy pattern

---

## Testing Coverage

### Unit Tests

**Total**: 92 tests, 100% pass rate

**Coverage by Module**:
- Parsers: 54 tests
  - JDProductParser: 17 tests
  - TaobaoProductParser: 20 tests
  - PlainTextParser: 17 tests
- Utils: 38 tests
  - unitConversion: 38 tests

**Framework**: Vitest + @testing-library/react + happy-dom

**Gaps**: React component tests not yet implemented

---

## Getting Started

### Prerequisites

1. Node.js 18+ (for frontend)
2. Yarn (package manager)
3. Rust (for Tauri backend)

### Installation

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Or run full Tauri app
yarn tauri dev
```

### First Steps

1. **Add a product manually** via ProductForm
2. **Paste product info** from JD or Taobao (use PasteParseModal)
3. **View price history** in chart
4. **Export to CSV** for backup

See [development-guide.md](./development-guide.md) for detailed instructions.

---

## AI-Assisted Development Guide

### Using This Documentation for Brownfield PRD

This project is **fully documented** for AI-assisted brownfield feature development. When planning new features:

**1. Review Architecture**:
- [architecture.md](./architecture.md) - System design and patterns
- [component-inventory.md](./component-inventory.md) - Reusable components
- [data-models.md](./data-models.md) - Database schema

**2. Understand Integration Points**:
- [api-contracts.md](./api-contracts.md) - Tauri IPC commands
- [source-tree-analysis.md](./source-tree-analysis.md) - Code organization

**3. Reference Development Practices**:
- [development-guide.md](./development-guide.md) - How to build and test
- [TESTING.md](../TESTING.md) - Testing strategy
- [CLAUDE.md](../CLAUDE.md) - Claude Code guidance

### Recommended Workflow

For new features (using BMad Method):

1. **Run** `document-project` workflow (already done!)
2. **Create PRD** using `prd` workflow with this documentation as context
3. **Design UX** using `create-ux-design` workflow (if UI changes)
4. **Create Architecture** using `create-architecture` workflow
5. **Break into epics/stories** using `create-epics-and-stories` workflow
6. **Implement stories** using `dev-story` workflow

---

## Project Metrics

### Codebase Stats

- **Total Source Files**: 40+ files
- **Lines of Code**: ~6,400 (frontend: 6,000, backend: 400)
- **Components**: 16 React components
- **Tauri Commands**: 7 IPC endpoints
- **Database Tables**: 1 (products)
- **Unit Tests**: 92 tests
- **Test Pass Rate**: 100%

### Dependencies

- **Frontend**: 27 dependencies
- **Backend**: 4 Rust crates
- **Dev Dependencies**: 14

### Supported Platforms

- macOS (primary development platform)
- Windows (via Tauri build)
- Linux (via Tauri build)

---

## Contributing

This project uses:
- **TypeScript** for frontend (strict mode)
- **Rust** for backend
- **Functional React** components with hooks
- **Vitest** for testing
- **Yarn** for package management

See [development-guide.md](./development-guide.md) for contribution guidelines.

---

## Links

### Documentation

- [Architecture](./architecture.md) - System design
- [Component Inventory](./component-inventory.md) - UI components
- [Data Models](./data-models.md) - Database schema
- [API Contracts](./api-contracts.md) - Tauri commands
- [Source Tree Analysis](./source-tree-analysis.md) - Code structure
- [Development Guide](./development-guide.md) - How to develop

### External Resources

- [Tauri v2 Docs](https://v2.tauri.app/)
- [React Docs](https://react.dev/)
- [Ant Design](https://ant.design/)

---

**Last Updated**: 2025-11-25
**Version**: 0.1.0
**Maintained By**: Development Team
