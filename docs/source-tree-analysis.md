# Source Tree Analysis - Price Tracker

> **Generated**: 2025-11-25
> **Project**: Price Tracker (Tauri Desktop App)
> **Repository Type**: Monolith

## Project Structure Overview

```
price-tracker/
├── 📦 Frontend (React + TypeScript)
│   ├── src/                    # React application source
│   ├── public/                 # Static assets
│   ├── index.html             # HTML entry point
│   └── vite.config.ts         # Vite build configuration
│
├── 🦀 Backend (Rust + Tauri)
│   ├── src-tauri/             # Tauri/Rust backend
│   │   ├── src/               # Rust source code
│   │   ├── Cargo.toml         # Rust dependencies
│   │   └── tauri.conf.json    # Tauri configuration
│   └── target/                # Rust build artifacts
│
├── 📄 Documentation
│   ├── README.md              # Project readme
│   ├── CLAUDE.md              # Claude Code guidance (comprehensive)
│   ├── TESTING.md             # Testing documentation
│   └── docs/                  # Generated BMM documentation
│
├── 🧪 Testing
│   ├── vitest.config.ts       # Vitest configuration
│   └── src/tests/             # Unit tests
│
├── ⚙️ Configuration
│   ├── package.json           # NPM dependencies & scripts
│   ├── tsconfig.json          # TypeScript configuration
│   └── .bmad/                 # BMad Method workflows
│
└── 📊 Data
    └── product_info/          # Sample product data
```

## Detailed Directory Structure

### Frontend Source (`src/`)

```
src/
├── 📱 Components (src/components/)
│   ├── ProductForm.tsx             # ⭐ Main form for product add/edit
│   ├── ProductTable.tsx            # ⭐ Product list with inline editing
│   ├── PriceHistoryChart.tsx      # 📊 Price trend visualization
│   ├── PasteParseModal.tsx        # 🔄 Parse product from pasted text
│   │
│   ├── Input Components
│   │   ├── DiscountSection.tsx    # Discount collection manager
│   │   ├── DiscountInput.tsx      # Single discount item input
│   │   ├── DiscountParser.tsx     # Parse discount text
│   │   ├── UnitPriceInput.tsx     # Quantity + unit price calculator
│   │   ├── UnitSelect.tsx         # Unit measurement selector
│   │   ├── SourceInput.tsx        # Product source/URL input
│   │   └── JDSpecImporter.tsx     # JD.com spec JSON importer
│   │
│   ├── Utility Components
│   │   ├── ColumnController.tsx   # Table column visibility
│   │   ├── ThemeToggle.tsx        # Dark/light mode toggle
│   │   ├── LanguageToggle.tsx     # Language switcher
│   │   ├── UnitPriceDisplay.tsx   # Display unit price
│   │   └── index.ts               # Component exports
│
├── 🧠 State Management (src/contexts/)
│   ├── ThemeContext.tsx           # Theme provider (dark/light)
│   └── LanguageContext.tsx        # Language provider (en/zh)
│
├── 🔧 Utilities (src/utils/)
│   ├── storage.ts                 # 🔑 Unified storage abstraction (Tauri/localStorage)
│   ├── csvExport.ts               # Export products to CSV
│   ├── csvImport.ts               # Import products from CSV/Excel
│   ├── urlParser.ts               # Parse JD/Taobao/Tmall URLs
│   ├── urlFormatter.ts            # Format URLs for display
│   ├── openUrl.ts                 # Open URLs in system browser
│   ├── unitConversion.ts          # Unit conversion utilities (✅ tested)
│   ├── productInfoParser.ts       # Orchestrate product parsers
│   ├── JDSpecParser.ts            # Parse JD specification JSON
│   │
│   └── parsers/                   # 🎯 Product info parser system (Strategy pattern)
│       ├── types.ts               # Parser interfaces
│       ├── ParserManager.ts       # Manage all parsers
│       ├── JDProductParser.ts     # Parse JD.com product data (✅ tested)
│       ├── TaobaoProductParser.ts # Parse Taobao/Tmall text (✅ tested)
│       └── PlainTextParser.ts     # Generic fallback parser (✅ tested)
│
├── 🌍 Internationalization (src/i18n/)
│   ├── index.ts                   # i18next setup
│   └── locales/
│       ├── en.json                # English translations
│       └── zh.json                # Chinese translations
│
├── 🧪 Tests (src/tests/)
│   ├── setup.ts                   # Test configuration
│   ├── parsers/
│   │   ├── JDProductParser.test.ts       # ✅ 17 tests
│   │   ├── TaobaoProductParser.test.ts   # ✅ 20 tests
│   │   └── PlainTextParser.test.ts       # ✅ 17 tests
│   └── utils/
│       └── unitConversion.test.ts        # ✅ 38 tests
│
├── 📐 Types (src/types/)
│   └── index.ts                   # TypeScript interfaces (Product, DiscountItem, etc.)
│
├── 📊 Constants (src/constants/)
│   └── index.ts                   # Enums and constants (CategoryType, UnitType, etc.)
│
├── 🎣 Hooks (src/hooks/)
│   └── useDocumentTitle.ts       # Dynamic document title
│
├── 🖼️ Assets (src/assets/)
│   └── (static resources)
│
├── App.tsx                        # ⭐ Root application component
├── main.tsx                       # 🚀 React entry point
└── vite-env.d.ts                 # Vite type definitions
```

### Backend Source (`src-tauri/`)

```
src-tauri/
├── src/
│   ├── lib.rs                    # ⭐ Main Tauri library
│   │                              # - DatabaseState management
│   │                              # - 7 Tauri commands (CRUD + DB management)
│   │                              # - SQLite schema creation & migration
│   │
│   └── main.rs                   # Tauri app entry point
│
├── Cargo.toml                    # 🦀 Rust dependencies
│   │                              # - tauri v2
│   │                              # - rusqlite 0.31 (bundled SQLite)
│   │                              # - serde + serde_json
│   │                              # - tokio (async runtime)
│
├── tauri.conf.json              # ⚙️ Tauri configuration
│   │                              # - App metadata
│   │                              # - Build settings
│   │                              # - Database path config
│   │                              # - Window configuration
│
├── build.rs                      # Tauri build script (auto-generated)
├── Cargo.lock                    # Dependency lock file
├── icons/                        # App icons
└── target/                       # Rust build output
```

### Configuration Files (Root)

```
/
├── package.json                  # 📦 NPM dependencies & scripts
│                                  # - Frontend: React, Ant Design, Recharts, i18next
│                                  # - Testing: Vitest, Testing Library
│                                  # - Build: Vite, TypeScript, Tauri CLI
│
├── tsconfig.json                # TypeScript compiler config
├── tsconfig.node.json           # TypeScript config for Node.js files
├── vite.config.ts               # ⚡ Vite build configuration
├── vitest.config.ts             # 🧪 Vitest test configuration
│
├── yarn.lock                     # Yarn dependency lock
└── .gitignore                    # Git ignore rules
```

### Documentation (`docs/`)

```
docs/
├── bmm-workflow-status.yaml      # 🎯 BMM workflow tracking
├── project-scan-report.json      # 📊 Documentation generation state
│
├── component-inventory.md        # 📱 React components catalog
├── data-models.md                # 💾 Database schema & types
├── api-contracts.md              # 🔌 Tauri IPC command reference
├── source-tree-analysis.md       # 📂 This file
│
└── (additional docs to be generated)
```

### Sample Data (`product_info/`)

```
product_info/
└── (Sample product JSON/text files for testing parsers)
```

## Critical Entry Points

### 1. **Frontend Entry Point**
**File**: `src/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n'  // Initialize i18next

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Purpose**: Initializes React app and i18n, mounts `<App />` to DOM

---

### 2. **Root Application Component**
**File**: `src/App.tsx`

**Responsibilities**:
- Provide ThemeContext and LanguageContext
- Load products from Tauri backend or localStorage
- Manage product CRUD operations
- Render main UI layout with all components

**Key State**:
- `products: Product[]` - All tracked products
- `editingId: number | null` - Currently editing product

---

### 3. **Backend Entry Point**
**File**: `src-tauri/src/main.rs`

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn main() {
    md_react_lib::run();
}
```

**Delegates to**: `src-tauri/src/lib.rs` `run()` function

---

### 4. **Tauri Application Runtime**
**File**: `src-tauri/src/lib.rs` (`run()` function)

**Initialization Sequence**:
1. Initialize Tauri builder
2. Register `tauri_plugin_opener` plugin
3. **Setup**: Determine database path → Create `DatabaseState` → Register with app state
4. Register invoke handlers for all commands
5. Start Tauri event loop

---

## Integration Points

### Frontend ↔ Backend Communication

```
React Component
    ↓
invoke('command_name', { params })
    ↓
Tauri IPC Bridge (JSON serialization)
    ↓
Rust #[tauri::command] Handler
    ↓
DatabaseState (Mutex<Connection>)
    ↓
SQLite Database File
    ↓
Response (Result<T, String>)
    ↓
Tauri IPC Bridge (JSON deserialization)
    ↓
Promise<T> resolves in React
```

**Key File**: `src/utils/storage.ts` - Detects environment and routes to Tauri or localStorage

---

### Parser System Integration

```
User Pastes Text
    ↓
PasteParseModal
    ↓
ParserManager.parse(text)
    ↓
Tries parsers in order:
  1. JDProductParser (if JD JSON detected)
  2. TaobaoProductParser (if Taobao keywords detected)
  3. PlainTextParser (fallback)
    ↓
Extracted ProductInfo
    ↓
Populate ProductForm fields
```

**Entry Point**: `src/components/PasteParseModal.tsx`
**Parser Registry**: `src/utils/parsers/ParserManager.ts`

---

## Build Artifacts & Output

### Development Build

**Frontend** (Vite dev server):
- Served on `http://localhost:1420`
- Hot module replacement (HMR) enabled
- Uses localStorage for data

**Backend** (Tauri dev):
- Rust compiled in debug mode
- SQLite database at configured path
- DevTools enabled in window

**Command**: `yarn tauri dev`

---

### Production Build

**Frontend**:
- Built by Vite → `dist/` folder
- Minified JavaScript bundles
- Optimized assets

**Backend**:
- Rust compiled in release mode (`target/release/`)
- Statically linked binary
- Bundled SQLite library

**Output**: Platform-specific installers in `src-tauri/target/release/bundle/`

**Command**: `yarn tauri build`

---

## File Organization Patterns

### 1. **Component Colocation**
- Components live in `src/components/`
- Exports centralized in `src/components/index.ts`
- No component-specific subdirectories (flat structure)

### 2. **Utility Modularity**
- Generic utilities in `src/utils/`
- Parser system in dedicated subfolder `src/utils/parsers/`
- Each parser is self-contained with types

### 3. **Test Mirror Structure**
- Tests in `src/tests/` mirror source structure
- `src/tests/parsers/` matches `src/utils/parsers/`
- `src/tests/utils/` matches `src/utils/`

### 4. **Type Centralization**
- All shared types in `src/types/index.ts`
- Constants in `src/constants/index.ts`
- Avoids circular dependencies

---

## Code Conventions

### Naming Conventions

**Files**:
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Tests: `*.test.ts` or `*.spec.ts`

**Exports**:
- Named exports for components
- Default export for App.tsx

**Variables**:
- React state: `camelCase` (e.g., `products`, `editingId`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `CATEGORIES`, `UNITS`)
- Types/Interfaces: `PascalCase` (e.g., `Product`, `DiscountItem`)

---

## Testing Structure

### Test Files Location

```
src/tests/
├── setup.ts                       # Global test setup (happy-dom)
├── parsers/
│   ├── JDProductParser.test.ts    # 17 tests
│   ├── TaobaoProductParser.test.ts# 20 tests
│   └── PlainTextParser.test.ts    # 17 tests
└── utils/
    └── unitConversion.test.ts     # 38 tests
```

**Total**: 92 unit tests (all passing ✅)

### Test Coverage

- ✅ **Parsers**: 100% of parser logic tested
- ✅ **Unit Conversion**: 100% of conversion functions tested
- ⚠️ **React Components**: Not yet tested
- ⚠️ **Rust Backend**: No tests

---

## Configuration Hierarchy

### 1. **TypeScript Configuration**

**Root**: `tsconfig.json` (app code)
**Node**: `tsconfig.node.json` (build scripts)

### 2. **Build Configuration**

**Frontend**: `vite.config.ts` (Vite + React plugin)
**Testing**: `vitest.config.ts` (Vitest + happy-dom)

### 3. **Tauri Configuration**

**App**: `src-tauri/tauri.conf.json`
**Rust**: `src-tauri/Cargo.toml`

### 4. **i18n Configuration**

**Setup**: `src/i18n/index.ts`
**Translations**: `src/i18n/locales/{en,zh}.json`

---

## Key Architectural Boundaries

### Separation of Concerns

**Presentation Layer** (React Components):
- `src/components/` - UI rendering only
- No direct database access
- State flows down via props

**Business Logic Layer** (Utilities):
- `src/utils/` - Pure functions and strategies
- Parser system encapsulates extraction logic
- Unit conversion encapsulates calculation logic

**Data Access Layer** (Storage):
- `src/utils/storage.ts` - Unified interface
- Tauri IPC or localStorage
- Environment detection

**Persistence Layer** (Rust + SQLite):
- `src-tauri/src/lib.rs` - Database operations
- Schema management and migrations
- Transaction safety via Mutex

---

## External Dependencies

### Frontend Dependencies (package.json)

**UI Framework**:
- `react` 18.3.1
- `react-dom` 18.3.1
- `antd` 5.26.0 (Ant Design)
- `@ant-design/icons` 6.0.0

**Utilities**:
- `dayjs` 1.11.13 (date handling)
- `recharts` 3.1.2 (charts)
- `i18next` + `react-i18next` (i18n)

**Tauri Integration**:
- `@tauri-apps/api` 2.x
- `@tauri-apps/plugin-opener` 2.x

**Build & Dev**:
- `vite` 6.0.3
- `typescript` 5.6.2
- `@vitejs/plugin-react` 4.3.4

**Testing**:
- `vitest` 4.0.5
- `@testing-library/react` 16.3.0
- `@testing-library/jest-dom` 6.9.1
- `happy-dom` 20.0.10

### Backend Dependencies (Cargo.toml)

**Tauri Core**:
- `tauri` 2.x
- `tauri-build` 2.x
- `tauri-plugin-opener` 2.x

**Database**:
- `rusqlite` 0.31 (with bundled SQLite)

**Serialization**:
- `serde` 1.x
- `serde_json` 1.x

**Async Runtime**:
- `tokio` 1.x (full features)

---

## Development Workflow Files

### Git Configuration
- `.gitignore` - Excludes node_modules, dist, target, .env

### IDE Configuration
- `.vscode/` - VS Code settings (if present)
- `.idea/` - IntelliJ IDEA settings (present)

### BMad Method Workflows
- `.bmad/` - Complete BMM workflow system
- Includes workflows for PRD, architecture, epics, stories, etc.

---

## Data Flow Patterns

### 1. **Product CRUD Flow**

```
User Action (Form Submit/Table Edit/Delete)
    ↓
Component Event Handler
    ↓
invoke Tauri Command
    ↓
Rust Command Handler
    ↓
SQLite INSERT/UPDATE/DELETE
    ↓
Return Result
    ↓
Update React State
    ↓
Re-render UI
```

### 2. **Price History Visualization Flow**

```
User Selects Product + Date Range
    ↓
Filter products by title/brand
    ↓
Filter by date range
    ↓
Extract price + date data points
    ↓
Pass to Recharts LineChart
    ↓
Render chart
```

### 3. **Import/Export Flow**

**Export**:
```
User Clicks Export
    ↓
csvExport.ts converts products to CSV
    ↓
Browser downloads file
```

**Import**:
```
User Uploads CSV/Excel
    ↓
csvImport.ts parses file
    ↓
Convert to Product[] array
    ↓
Batch save via Tauri commands
    ↓
Reload products
```

---

## Future Extension Points

Based on planned features:

### 1. **User Requirements Settings**
**Suggested Location**: `src/components/RequirementsManager.tsx`
**Storage**: New table in SQLite

### 2. **Product Inspection Standards**
**Suggested Location**: `src/components/InspectionStandards.tsx`
**Storage**: New table with criteria JSON

### 3. **User Reviews Integration**
**Suggested Location**: `src/components/ReviewDisplay.tsx`
**Storage**: New table with foreign key to products

### 4. **Multi-Database Support**
**Current**: Single database file
**Enhancement**: Workspace/profile system with multiple databases

---

**Last Updated**: 2025-11-25
**Total Files**: 40+ source files
**Total Lines of Code**: ~6,000+ (frontend) + ~400 (backend)
**Maintained By**: Development Team
