# Component Inventory - Price Tracker

> **Generated**: 2025-11-25
> **Project**: Price Tracker (Tauri Desktop App)
> **Framework**: React 18 + TypeScript + Ant Design

## Overview

This document catalogs all UI components in the Price Tracker application, organized by functional category. Components follow a modular design pattern with clear separation of concerns.

## Component Categories

### 1. Core Application Components

#### **ProductForm** (`src/components/ProductForm.tsx`)
- **Purpose**: Main form for adding/editing product records
- **Key Features**:
  - Integrates all input sub-components
  - Handles form validation and submission
  - Manages discount calculation logic
  - Supports both add and edit modes
- **Dependencies**: DiscountSection, UnitPriceInput, SourceInput, JDSpecImporter
- **State**: Local form state with Ant Design Form
- **Reusability**: Domain-specific (product management)

#### **ProductTable** (`src/components/ProductTable.tsx`)
- **Purpose**: Display and manage list of tracked products
- **Key Features**:
  - Editable rows for inline updates
  - Delete actions with confirmation
  - URL opening functionality
  - Sortable columns
  - Column visibility control integration
- **Dependencies**: ColumnController
- **State**: Receives products from parent, manages edit state
- **Reusability**: Domain-specific

#### **PriceHistoryChart** (`src/components/PriceHistoryChart.tsx`)
- **Purpose**: Visualize price trends over time
- **Key Features**:
  - Line chart using Recharts
  - Date range filtering
  - Product filtering
  - Price comparison visualization
- **Dependencies**: Recharts, dayjs
- **State**: Filtered data based on props
- **Reusability**: Domain-specific

### 2. Input & Data Entry Components

#### **DiscountSection** (`src/components/DiscountSection.tsx`)
- **Purpose**: Manage discount items collection
- **Key Features**:
  - Add/remove discount items
  - Display discount list
  - Integrate DiscountParser for text input
- **Dependencies**: DiscountInput, DiscountParser
- **Reusability**: Medium (applicable to pricing features)

#### **DiscountInput** (`src/components/DiscountInput.tsx`)
- **Purpose**: Single discount item input
- **Key Features**:
  - Discount organizer selection (store/platform/government)
  - Discount type selection (percentage/fixed/coupon)
  - Discount value input
- **Dependencies**: Ant Design Form components
- **Reusability**: High (reusable for any discount entry)

#### **DiscountParser** (`src/components/DiscountParser.tsx`)
- **Purpose**: Parse discount text into structured data
- **Key Features**:
  - Text area for discount text input
  - Automatic parsing on blur/change
  - Pattern recognition for common discount formats
- **Dependencies**: DiscountItem type
- **Reusability**: Medium

#### **UnitPriceInput** (`src/components/UnitPriceInput.tsx`)
- **Purpose**: Calculate and display unit price
- **Key Features**:
  - Quantity input with unit selection
  - Auto-calculation of unit price
  - Comparison unit selection
  - Unit conversion support
- **Dependencies**: UnitSelect, unit conversion utilities
- **Reusability**: High (reusable for unit pricing features)

#### **UnitSelect** (`src/components/UnitSelect.tsx`)
- **Purpose**: Select measurement units
- **Key Features**:
  - Support for weight, volume, piece units
  - Categorized unit groups
  - i18n support for unit labels
- **Dependencies**: Constants (UnitType)
- **Reusability**: Very High (pure UI component)

#### **SourceInput** (`src/components/SourceInput.tsx`)
- **Purpose**: Input source type and URL/address
- **Key Features**:
  - Source type selection (JD, Taobao, Tmall, Other)
  - Address/URL input
  - URL validation and parsing
- **Dependencies**: URL parser utilities
- **Reusability**: Medium

#### **JDSpecImporter** (`src/components/JDSpecImporter.tsx`)
- **Purpose**: Import product specifications from JD.com JSON
- **Key Features**:
  - Text area for JSON input
  - Parse JD specification format
  - Auto-populate brand and specification fields
- **Dependencies**: JD spec parser utilities
- **Reusability**: Low (JD-specific)

#### **PasteParseModal** (`src/components/PasteParseModal.tsx`)
- **Purpose**: Parse product information from pasted text
- **Key Features**:
  - Modal dialog for text input
  - Multi-parser support (JD, Taobao, PlainText)
  - Auto-detect format and extract product data
  - Populate form with parsed data
- **Dependencies**: ParserManager, product parsers
- **Reusability**: Medium (parser-driven)

### 3. Layout & Utility Components

#### **ColumnController** (`src/components/ColumnController.tsx`)
- **Purpose**: Control table column visibility
- **Key Features**:
  - Checkbox group for column selection
  - Persist preferences to localStorage
  - Toggle all columns
- **Dependencies**: Ant Design Checkbox
- **Reusability**: Very High (generic utility)

#### **ThemeToggle** (`src/components/ThemeToggle.tsx`)
- **Purpose**: Toggle dark/light theme
- **Key Features**:
  - Theme switch button
  - Integrates with ThemeContext
  - Icon-based toggle
- **Dependencies**: ThemeContext
- **Reusability**: Very High (generic utility)

#### **LanguageToggle** (`src/components/LanguageToggle.tsx`)
- **Purpose**: Switch between languages (English/Chinese)
- **Key Features**:
  - Language selector dropdown
  - Integrates with LanguageContext
  - Updates i18next and Ant Design locale
- **Dependencies**: LanguageContext, i18next
- **Reusability**: Very High (generic utility)

#### **UnitPriceDisplay** (`src/components/UnitPriceDisplay.tsx`)
- **Purpose**: Display calculated unit price
- **Key Features**:
  - Format unit price with unit label
  - i18n support
  - Conditional rendering based on data availability
- **Dependencies**: i18next
- **Reusability**: High

## State Management Architecture

### Context Providers

#### **ThemeContext** (`src/contexts/ThemeContext.tsx`)
- **State**: `theme` (light | dark)
- **Actions**: `toggleTheme()`
- **Persistence**: localStorage (`theme` key)
- **Consumers**: ThemeToggle, App root

#### **LanguageContext** (`src/contexts/LanguageContext.tsx`)
- **State**: `language` (en | zh)
- **Actions**: `setLanguage(lang: string)`
- **Persistence**: i18next + localStorage
- **Consumers**: LanguageToggle, App root

### Local State Patterns

- **Product List**: Managed in `App.tsx`, loaded from Tauri backend
- **Form State**: Ant Design Form instance in ProductForm
- **Edit Mode**: Local state in ProductTable for inline editing
- **Column Visibility**: localStorage in ColumnController

## Component Hierarchy

```
App
├── ThemeProvider (ThemeContext)
├── LanguageProvider (LanguageContext)
├── ConfigProvider (Ant Design)
└── Main Layout
    ├── ThemeToggle
    ├── LanguageToggle
    ├── ProductForm
    │   ├── SourceInput
    │   ├── JDSpecImporter
    │   ├── DiscountSection
    │   │   ├── DiscountParser
    │   │   └── DiscountInput (multiple)
    │   └── UnitPriceInput
    │       └── UnitSelect
    ├── PasteParseModal
    ├── ProductTable
    │   └── ColumnController
    └── PriceHistoryChart
```

## Design Patterns

### 1. **Compound Components**
- `DiscountSection` + `DiscountInput`: Parent manages collection, children handle individual items
- `UnitPriceInput` + `UnitSelect`: Composite input with calculation logic

### 2. **Controlled Components**
- All form inputs are controlled by parent form state
- State flows down, change handlers flow up

### 3. **Presentation vs Container**
- **Container Components**: ProductForm, ProductTable (manage business logic)
- **Presentation Components**: DiscountInput, UnitSelect, UnitPriceDisplay (pure rendering)

### 4. **Parser Strategy Pattern**
- `PasteParseModal` delegates to `ParserManager`
- Multiple parser implementations (JD, Taobao, PlainText)
- Extensible for new e-commerce platforms

## Reusability Matrix

| Component | Reusability | Generalization Effort |
|-----------|-------------|----------------------|
| ColumnController | Very High | None (already generic) |
| ThemeToggle | Very High | None |
| LanguageToggle | Very High | None |
| UnitSelect | Very High | None |
| UnitPriceInput | High | Low (extract calculation logic) |
| UnitPriceDisplay | High | None |
| DiscountInput | High | Low (rename for generic discounts) |
| DiscountSection | Medium | Medium (extract domain types) |
| DiscountParser | Medium | Medium (generalize parsing rules) |
| SourceInput | Medium | Medium (extract platform concept) |
| PasteParseModal | Medium | High (separate parser system) |
| JDSpecImporter | Low | High (JD-specific logic) |
| ProductForm | Domain-specific | Very High |
| ProductTable | Domain-specific | High |
| PriceHistoryChart | Domain-specific | Medium |

## Component Export Strategy

All components are exported through a central index file:
- **File**: `src/components/index.ts`
- **Pattern**: Named exports for all components
- **Benefit**: Single import point for component library

## Testing Coverage

Components with unit tests (via Vitest):
- ✅ Parser utilities (underlying component logic)
- ✅ Unit conversion utilities
- ⚠️ **Note**: React component tests not yet implemented

**Recommended Testing Priorities**:
1. ProductForm (complex state and validation)
2. DiscountSection (collection management)
3. PasteParseModal (parser integration)
4. ProductTable (edit mode and actions)
5. UnitPriceInput (calculation logic)

## Integration Points

### Tauri IPC Commands
Components that invoke Tauri backend commands:
- **ProductForm**: `save_product`, `update_product`
- **ProductTable**: `delete_product`, `get_products`
- **App**: `get_products` (initial load)

### External Libraries
- **Ant Design**: Form, Table, Modal, Select, Input, Button, DatePicker, etc.
- **Recharts**: LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend
- **dayjs**: Date manipulation and formatting
- **i18next**: Translation keys via `useTranslation` hook

## Future Component Opportunities

Based on planned features mentioned by user:

### 1. **User Requirements Settings**
- `RequirementsForm`: Define product criteria
- `CriteriaInput`: Individual requirement fields
- `RequirementsList`: Display saved requirements

### 2. **Product Inspection Standards**
- `InspectionChecklist`: QA criteria checklist
- `StandardEditor`: Create/edit inspection standards
- `ComplianceIndicator`: Visual pass/fail status

### 3. **User Reviews Integration**
- `ReviewDisplay`: Show aggregated reviews
- `ReviewSummary`: Rating and highlights
- `ReviewSourceBadge`: Indicate review source (JD, Taobao, etc.)

## Best Practices

1. ✅ **TypeScript Strict Mode**: All components use TypeScript with strict typing
2. ✅ **Props Interfaces**: Clear interface definitions for all component props
3. ✅ **i18n Support**: Translation keys for all user-facing text
4. ✅ **Accessibility**: Ant Design provides baseline a11y, custom components follow ARIA patterns
5. ✅ **Code Organization**: Logical grouping by feature/functionality
6. ⚠️ **Component Documentation**: JSDoc comments recommended for complex components
7. ⚠️ **Storybook/Visual Testing**: Not yet implemented

---

**Last Updated**: 2025-11-25
**Maintained By**: Development Team
