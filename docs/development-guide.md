# Development Guide - Price Tracker

> **Generated**: 2025-11-25
> **Project**: Price Tracker (Tauri Desktop App)
> **Tech Stack**: Tauri 2 + React 18 + TypeScript + Rust + SQLite

## Quick Start

### Prerequisites

1. **Node.js** (18+ recommended)
   ```bash
   node --version  # Should be v18.x or higher
   ```

2. **Yarn** package manager
   ```bash
   npm install -g yarn
   # or via Homebrew on macOS
   brew install yarn
   ```

3. **Rust** (for Tauri development)
   ```bash
   curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
   # Select option 1 for standard installation

   # After installation, add Cargo to PATH:
   source "$HOME/.cargo/env"

   # Verify installation:
   rustc --version
   cargo --version
   ```

### Installation

```bash
# Clone the repository
cd /path/to/price-tracker

# Install dependencies
yarn install

# This installs both:
# - Frontend dependencies (React, Ant Design, etc.)
# - Tauri CLI (@tauri-apps/cli)
```

### Environment Setup

**No `.env` file required** - all configuration is in `src-tauri/tauri.conf.json`

**Database Configuration** (optional):
Edit `src-tauri/tauri.conf.json`:
```json
{
  "plugins": {
    "database": {
      "path": "products.db"  // or absolute path like "/path/to/your/products.db"
    }
  }
}
```

Leave empty `""` for default location (platform-specific app data directory).

## Development Modes

### 1. Frontend-Only Development (Browser Mode)

**Best for**: UI development, component testing, quick iteration

```bash
yarn dev
```

**Features**:
- Runs Vite dev server on `http://localhost:1420`
- Hot module replacement (HMR) - instant updates
- Uses **localStorage** for data (no Tauri/SQLite)
- DevTools available in browser
- Faster startup than Tauri mode

**When to use**:
- Building new React components
- Styling with Ant Design/Tailwind
- Testing i18n translations
- Working on parser logic

---

### 2. Full Desktop App Development (Tauri Mode)

**Best for**: Backend integration, database testing, production-like testing

```bash
yarn tauri dev
```

**Features**:
- Runs complete Tauri desktop app
- Uses **SQLite** database via Rust backend
- Rust code compiled in debug mode
- Frontend served via Vite dev server
- DevTools enabled in window
- Auto-rebuild on Rust changes

**When to use**:
- Testing Tauri commands
- Database schema changes
- File system operations
- Testing platform-specific features

**Note**: First run may take 2-5 minutes to compile Rust dependencies. Subsequent runs are faster.

---

## Build Process

### Frontend Build

```bash
yarn build
```

**Output**: `dist/` folder
- Compiled TypeScript → JavaScript
- Minified bundles
- Optimized assets
- Production-ready HTML

**Process**:
1. TypeScript compilation (`tsc`)
2. Vite build (bundling, minification)
3. Asset optimization

---

### Desktop App Build

```bash
yarn tauri build
```

**Output**: `src-tauri/target/release/bundle/`
- Platform-specific installers
  - macOS: `.dmg` and `.app`
  - Windows: `.msi` and `.exe`
  - Linux: `.deb`, `.AppImage`

**Process**:
1. Frontend build (`yarn build`)
2. Rust compilation (release mode)
3. Bundle creation with platform tools

**Build time**: 5-15 minutes (first build), 2-5 minutes (subsequent)

---

## Testing

### Unit Tests

```bash
# Watch mode (recommended for development)
yarn test

# Run all tests once
yarn test:run

# Visual UI dashboard
yarn test:ui

# Generate coverage report
yarn test:coverage
```

**Test Framework**: Vitest + @testing-library/react + happy-dom

**Current Coverage**:
- ✅ Parsers: 54 tests (JD, Taobao, PlainText)
- ✅ Unit Conversion: 38 tests
- ⚠️ React Components: Not yet tested

**Writing New Tests**:
1. Create `*.test.ts` file in `src/tests/`
2. Import test subject and Vitest functions
3. Write descriptive test cases using `describe` and `it`
4. Run `yarn test` to verify

**Example Test**:
```typescript
import { describe, it, expect } from 'vitest';
import { convertUnit } from '../utils/unitConversion';

describe('Unit Conversion', () => {
  it('should convert grams to kilograms', () => {
    expect(convertUnit(1000, 'g', 'kg')).toBe(1);
  });
});
```

See [TESTING.md](../TESTING.md) for detailed testing documentation.

---

### Manual Testing

**Browser Mode**:
```bash
yarn dev
# Open http://localhost:1420
# Test UI/UX, component behavior
```

**Desktop App**:
```bash
yarn tauri dev
# Test database operations, file system, platform integration
```

---

## Code Organization

### Adding a New Component

1. Create component file: `src/components/MyComponent.tsx`
2. Implement component with TypeScript interface for props
3. Export from `src/components/index.ts`:
   ```typescript
   export { default as MyComponent } from './MyComponent';
   ```
4. Use in App.tsx or other components:
   ```typescript
   import { MyComponent } from './components';
   ```

---

### Adding a New Utility Function

1. Create utility file: `src/utils/myUtil.ts`
2. Implement pure function with TypeScript types
3. Export function
4. Create test file: `src/tests/utils/myUtil.test.ts`
5. Write unit tests
6. Import where needed:
   ```typescript
   import { myFunction } from './utils/myUtil';
   ```

---

### Adding a New Tauri Command

**Rust Side** (`src-tauri/src/lib.rs`):
```rust
#[tauri::command]
async fn my_command(
    param: String,
    state: State<'_, DatabaseState>,
) -> Result<MyType, String> {
    // Implementation
    Ok(result)
}

// Register in run() function:
.invoke_handler(tauri::generate_handler![
    // ... existing commands,
    my_command  // Add here
])
```

**TypeScript Side** (components or utilities):
```typescript
import { invoke } from '@tauri-apps/api/core';

const result = await invoke<MyType>('my_command', { param: 'value' });
```

---

### Adding a New Product Parser

1. Create parser class in `src/utils/parsers/MyParser.ts`:
   ```typescript
   export class MyParser implements IProductInfoParser {
     canParse(text: string): boolean {
       // Detection logic
     }

     parse(text: string): ParseResult {
       // Extraction logic
     }
   }
   ```

2. Register in `ParserManager` (`src/utils/parsers/ParserManager.ts`):
   ```typescript
   constructor() {
     this.parsers = [
       new JDProductParser(),
       new TaobaoProductParser(),
       new MyParser(),  // Add here (order matters)
       new PlainTextParser(),
     ];
   }
   ```

3. Write unit tests in `src/tests/parsers/MyParser.test.ts`

---

## Common Development Tasks

### 1. Add a New Product Category

**File**: `src/constants/index.ts`

```typescript
export const CATEGORIES: CategoryOption[] = [
  // ... existing categories,
  { value: 'new-category', label: '新分類' },
];
```

**Translation** (`src/i18n/locales/en.json` and `zh.json`):
```json
{
  "categories": {
    "new-category": "New Category"
  }
}
```

---

### 2. Add a New Measurement Unit

**File**: `src/constants/index.ts`

```typescript
export const UNITS: UnitOption[] = [
  // ... existing units,
  {
    label: 'Volume',
    options: [
      // ... existing,
      { value: 'gal', label: 'gallon' },
    ],
  },
];
```

**Unit Conversion** (`src/utils/unitConversion.ts`):
```typescript
const conversionFactors: Record<UnitType, number> = {
  // ... existing factors,
  'gal': 7.57,  // 1 gallon = 7.57 斤
};
```

**Add Tests** (`src/tests/utils/unitConversion.test.ts`):
```typescript
it('should convert gallons to liters', () => {
  expect(convertUnit(1, 'gal', 'L')).toBeCloseTo(3.785, 2);
});
```

---

### 3. Change Database Path

**Option A: Configuration File** (permanent)
Edit `src-tauri/tauri.conf.json`:
```json
{
  "plugins": {
    "database": {
      "path": "/new/path/to/products.db"
    }
  }
}
```

**Option B: Runtime API** (dynamic)
```typescript
import { invoke } from '@tauri-apps/api/core';

const newPath = '/new/path/to/products.db';
const confirmedPath = await invoke<string>('set_database_path', { newPath });
```

---

### 4. Add a New Discount Type

**File**: `src/constants/index.ts`

```typescript
export const DISCOUNT_METHOD: DiscountMethodOption[] = [
  // ... existing types,
  { value: 'points', label: 'points' },
];
```

**Type Definition** (`src/types/index.ts`):
```typescript
export type DiscountMethodType = 'percentage' | 'fixed' | 'coupon' | 'points';
```

**Translation** (`src/i18n/locales/en.json`):
```json
{
  "discount": {
    "points": "Points Redemption"
  }
}
```

---

### 5. Export Data to Different Format

**Current**: CSV export in `src/utils/csvExport.ts`

**Add JSON Export**:
```typescript
// src/utils/jsonExport.ts
export const exportToJSON = (products: Product[]): string => {
  return JSON.stringify(products, null, 2);
};

export const downloadJSON = (products: Product[], filename: string) => {
  const jsonStr = exportToJSON(products);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};
```

---

## Debugging

### Frontend Debugging

**Browser Mode** (`yarn dev`):
1. Open Chrome DevTools (F12)
2. Use React DevTools extension
3. Set breakpoints in Sources tab
4. Use `console.log()` for quick debugging

**Tauri Mode** (`yarn tauri dev`):
1. DevTools enabled in window by default
2. Right-click → Inspect to open DevTools
3. Same as browser debugging

**Logging**:
```typescript
console.log('Debug:', value);
console.error('Error:', error);
```

---

### Backend Debugging (Rust)

**Print Debugging**:
```rust
println!("Debug: {:?}", value);
eprintln!("Error: {:?}", error);
```

**View Logs**:
- Tauri dev mode: Logs appear in terminal
- Production: Check OS-specific log locations

**Rust Debugging with Debugger**:
```bash
# Install LLDB (macOS) or GDB (Linux)
# Use VS Code with rust-analyzer extension
# Set breakpoints in .rs files
# Run "Tauri: Debug" from VS Code
```

---

### Database Debugging

**View Database**:
```bash
# Get database path
yarn tauri dev  # Check terminal output for path

# Open with SQLite CLI
sqlite3 /path/to/products.db

# Run queries
sqlite> SELECT * FROM products LIMIT 5;
sqlite> .schema products
sqlite> .exit
```

**GUI Tools**:
- **DB Browser for SQLite** (recommended)
- **TablePlus**
- **DBeaver**

---

## Performance Optimization

### Frontend Optimization

**1. Lazy Loading Components**:
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

**2. Memoization**:
```typescript
const memoizedValue = useMemo(() => expensiveCalculation(data), [data]);
```

**3. Virtualization for Large Lists**:
```typescript
// Use react-window or react-virtualized for 1000+ products
```

---

### Backend Optimization

**1. Database Indexing**:
```rust
// In DatabaseState::new()
conn.execute("CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at)", [])?;
```

**2. Enable WAL Mode**:
```rust
conn.execute("PRAGMA journal_mode=WAL", [])?;
```

**3. Batch Operations**:
```rust
// Use transactions for multiple inserts
let tx = conn.transaction()?;
// ... multiple operations
tx.commit()?;
```

---

## Troubleshooting

### Common Issues

#### 1. "Rust not found" error
**Solution**:
```bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
source "$HOME/.cargo/env"
```

#### 2. "Database locked" error
**Cause**: Multiple simultaneous writes
**Solution**: Ensure sequential database operations, enable WAL mode

#### 3. Tauri dev mode won't start
**Solution**:
```bash
# Clear Cargo cache
cd src-tauri
cargo clean

# Rebuild
cd ..
yarn tauri dev
```

#### 4. Frontend HMR not working
**Solution**:
```bash
# Kill dev server
# Restart
yarn dev
```

#### 5. TypeScript errors in IDE
**Solution**:
```bash
# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## IDE Recommended Setup

### Visual Studio Code

**Extensions**:
- **rust-analyzer** (Rust language support)
- **Tauri** (Tauri-specific features)
- **ESLint** (JavaScript/TypeScript linting)
- **Prettier** (code formatting)
- **vscode-icons** (file icons)
- **Error Lens** (inline errors)

**Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  }
}
```

---

### IntelliJ IDEA

**Plugins**:
- **Rust** (Rust language support)
- **Tauri** (if available)

**Already Configured**: `.idea/` folder present in project

---

## Deployment

### Local Distribution

```bash
yarn tauri build
```

**Output Locations**:
- macOS DMG: `src-tauri/target/release/bundle/dmg/`
- macOS App: `src-tauri/target/release/bundle/macos/`
- Windows MSI: `src-tauri/target/release/bundle/msi/`
- Windows EXE: `src-tauri/target/release/bundle/nsis/`

### Code Signing (macOS)

**Required for distribution outside App Store**:
```bash
# Sign the app
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" "path/to/app"

# Notarize with Apple
xcrun notarytool submit "path/to/dmg" --apple-id "your@email.com" --password "app-specific-password" --team-id "TEAM_ID"
```

### Auto-Updates

**Not yet implemented**. See [Tauri Updater Plugin](https://v2.tauri.app/plugin/updater/) for integration guide.

---

## Contributing Guidelines

### Code Style

**TypeScript/React**:
- Use functional components with hooks
- Prefer `const` over `let`
- Use TypeScript strict mode
- Descriptive variable names
- Extract magic numbers to constants

**Rust**:
- Follow Rust naming conventions (snake_case)
- Use `Result<T, E>` for error handling
- Document public functions with `///` comments

### Commit Conventions

```
feat: Add new product parser for Amazon
fix: Resolve database connection leak
docs: Update development guide
test: Add unit tests for discount calculator
refactor: Extract discount logic to utility
chore: Update dependencies
```

### Pull Request Process

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit
3. Write/update tests
4. Ensure all tests pass: `yarn test:run`
5. Build successfully: `yarn build`
6. Push and create PR

---

## Resources

### Documentation

- **Tauri v2**: https://v2.tauri.app/
- **React**: https://react.dev/
- **Ant Design**: https://ant.design/
- **Vitest**: https://vitest.dev/
- **i18next**: https://www.i18next.com/

### Project-Specific Docs

- [CLAUDE.md](../CLAUDE.md) - Claude Code guidance
- [TESTING.md](../TESTING.md) - Testing documentation
- [README.md](../README.md) - Project overview

### Community

- **Tauri Discord**: https://discord.com/invite/tauri
- **GitHub Issues**: Use for bug reports and feature requests

---

**Last Updated**: 2025-11-25
**Maintained By**: Development Team
