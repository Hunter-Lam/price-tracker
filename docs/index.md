# Price Tracker - Documentation Index

> **Project**: Price Tracker (Tauri Desktop Application)
> **Generated**: 2025-11-25
> **Type**: Monolith (Desktop App)
> **Status**: Active Development

---

## 🎯 Quick Start

**New to this project?** Start here:
1. [Project Overview](./project-overview.md) - High-level summary
2. [Architecture](./architecture.md) - System design and patterns
3. [Development Guide](./development-guide.md) - How to build and contribute

**For AI-Assisted Development** (Brownfield PRD):
👉 **Use this index as your primary reference** when creating PRDs for new features!

---

## 📊 Project At-a-Glance

| Property | Value |
|----------|-------|
| **Type** | Desktop Application (Tauri 2) |
| **Primary Language** | TypeScript + Rust |
| **Architecture** | Component-Based with IPC Bridge |
| **Framework** | React 18 + Tauri 2 |
| **Database** | SQLite (embedded) |
| **UI Library** | Ant Design 5 |
| **Testing** | Vitest (92 tests, 100% pass) |
| **Platforms** | macOS, Windows, Linux |

---

## 📚 Documentation Structure

### Core Documentation

#### 1. [Project Overview](./project-overview.md)
**Purpose**: High-level project summary

**Contents**:
- Project vision and goals
- Current vs. planned features
- Technology stack summary
- Quick reference guide
- Getting started

**When to read**: First time exploring the project, or to get refreshed on what the project does.

---

#### 2. [Architecture](./architecture.md)
**Purpose**: System design and architectural decisions

**Contents**:
- High-level architecture diagram
- Architectural patterns (Component-Based, Strategy, IPC Bridge, etc.)
- Data architecture and schema
- Component architecture
- Parser system architecture
- Testing architecture
- Deployment architecture
- Security considerations
- Performance characteristics
- Extension points
- Decision log (why Tauri, SQLite, Ant Design, etc.)

**When to read**: Planning new features, understanding system design, architectural decisions.

---

#### 3. [Component Inventory](./component-inventory.md)
**Purpose**: Catalog of all React UI components

**Contents**:
- 16 components organized by category
  - Core: ProductForm, ProductTable, PriceHistoryChart
  - Input: DiscountSection, UnitPriceInput, SourceInput, etc.
  - Utility: ThemeToggle, LanguageToggle, ColumnController
- Component hierarchy diagram
- State management (Contexts)
- Design patterns used
- Reusability matrix
- Testing coverage
- Integration points
- Future component opportunities

**When to read**: Building UI features, reusing components, understanding component relationships.

---

#### 4. [Data Models](./data-models.md)
**Purpose**: Database schema and data structures

**Contents**:
- Database architecture and storage strategy
- Product entity (SQLite schema)
- TypeScript type definitions (Product, ProductInput, DiscountItem)
- Rust data structures
- CRUD operations (Tauri commands)
- Schema evolution and migration history
- Data integrity and constraints
- Query patterns and examples
- Performance considerations
- Future data model extensions

**When to read**: Working with data, adding database fields, understanding data flow.

---

#### 5. [API Contracts](./api-contracts.md)
**Purpose**: Tauri IPC command reference

**Contents**:
- 7 Tauri commands with full documentation:
  - `save_product` - Create product
  - `get_products` - Fetch all products
  - `update_product` - Update product
  - `delete_product` - Remove product
  - `get_database_path` - Get DB location
  - `set_database_path` - Change DB location
  - `greet` - Demo command
- Request/response formats
- Error handling patterns
- TypeScript → Rust type mapping
- Integration patterns
- Performance characteristics
- Future API extensions

**When to read**: Adding backend functionality, integrating frontend with backend, debugging IPC.

---

#### 6. [Source Tree Analysis](./source-tree-analysis.md)
**Purpose**: Complete code organization reference

**Contents**:
- Detailed directory structure (frontend + backend)
- Critical entry points
- Integration points (Frontend ↔ Backend, Parser system)
- Build artifacts and output
- File organization patterns
- Code conventions
- Testing structure
- Configuration hierarchy
- Architectural boundaries
- Data flow patterns
- Future extension points

**When to read**: Navigating codebase, adding new files, understanding project structure.

---

#### 7. [Development Guide](./development-guide.md)
**Purpose**: How to build, test, and contribute

**Contents**:
- Prerequisites (Node, Yarn, Rust)
- Installation steps
- Development modes (browser vs. Tauri)
- Build process (frontend, desktop)
- Testing (unit tests, manual testing)
- Code organization guidelines
- Common development tasks (add category, unit, parser, etc.)
- Debugging (frontend, backend, database)
- Performance optimization
- Troubleshooting
- IDE setup
- Deployment
- Contributing guidelines

**When to read**: Setting up dev environment, building features, debugging issues.

---

### Existing Documentation

These documents were created by the development team before BMM documentation:

#### [README.md](../README.md)
- Project readme with basic overview
- Quick start instructions
- Feature highlights

#### [CLAUDE.md](../CLAUDE.md)
- **Comprehensive Claude Code guidance** (very detailed!)
- Tech stack documentation
- Common commands
- Architecture details
- Dual storage strategy
- Product parser system
- Database schema
- Component organization
- Internationalization
- Prerequisites
- Database location configuration
- Testing guide
- CI/CD setup

**Note**: CLAUDE.md has significant overlap with generated BMM docs. Consider it the "developer-maintained" version.

#### [TESTING.md](../TESTING.md)
- Testing documentation
- Test coverage summary
- Test file locations
- Writing tests guide
- Manual testing
- CI/CD examples

---

## 🔍 Finding What You Need

### By Task

| Task | Recommended Docs |
|------|------------------|
| **Understand the project** | [Project Overview](./project-overview.md) |
| **Plan a new feature** | [Architecture](./architecture.md), [Component Inventory](./component-inventory.md), [Data Models](./data-models.md) |
| **Build UI components** | [Component Inventory](./component-inventory.md), [Development Guide](./development-guide.md) |
| **Add database fields** | [Data Models](./data-models.md), [API Contracts](./api-contracts.md) |
| **Create Tauri commands** | [API Contracts](./api-contracts.md), [Development Guide](./development-guide.md) |
| **Navigate codebase** | [Source Tree Analysis](./source-tree-analysis.md) |
| **Set up dev environment** | [Development Guide](./development-guide.md) |
| **Write tests** | [TESTING.md](../TESTING.md), [Development Guide](./development-guide.md) |
| **Debug issues** | [Development Guide](./development-guide.md), [Architecture](./architecture.md) |
| **Deploy the app** | [Development Guide](./development-guide.md) |

---

### By Component

| Component Type | Documentation |
|---------------|---------------|
| **React Components** | [Component Inventory](./component-inventory.md) |
| **Parsers** | [Architecture](./architecture.md) (Parser System), [Source Tree Analysis](./source-tree-analysis.md) |
| **Utilities** | [Source Tree Analysis](./source-tree-analysis.md) |
| **Contexts** | [Component Inventory](./component-inventory.md) (State Management) |
| **Tauri Commands** | [API Contracts](./api-contracts.md) |
| **Database** | [Data Models](./data-models.md) |

---

### By Feature Area

| Feature | Relevant Docs |
|---------|---------------|
| **Product Management** | [Component Inventory](./component-inventory.md) (ProductForm, ProductTable), [Data Models](./data-models.md), [API Contracts](./api-contracts.md) |
| **Price Tracking** | [Component Inventory](./component-inventory.md) (PriceHistoryChart), [Data Models](./data-models.md) (price fields) |
| **Product Parsing** | [Architecture](./architecture.md) (Parser System), [Source Tree Analysis](./source-tree-analysis.md) (parsers/) |
| **Discount Calculation** | [Component Inventory](./component-inventory.md) (DiscountSection), [Data Models](./data-models.md) (discount field) |
| **Unit Price Calculation** | [Component Inventory](./component-inventory.md) (UnitPriceInput), [Source Tree Analysis](./source-tree-analysis.md) (unitConversion.ts) |
| **Import/Export** | [Source Tree Analysis](./source-tree-analysis.md) (csvExport.ts, csvImport.ts) |
| **Internationalization** | [Architecture](./architecture.md), [Source Tree Analysis](./source-tree-analysis.md) (i18n/) |
| **Theming** | [Component Inventory](./component-inventory.md) (ThemeContext, ThemeToggle) |

---

## 🚀 For AI-Assisted Development

### Creating a Brownfield PRD

When using AI to plan new features for this project, provide these documents as context:

**Essential Context**:
1. [Architecture](./architecture.md) - System design, patterns, extension points
2. [Component Inventory](./component-inventory.md) - Reusable components
3. [Data Models](./data-models.md) - Database schema, future extensions

**Additional Context** (as needed):
- [API Contracts](./api-contracts.md) - If adding backend functionality
- [Source Tree Analysis](./source-tree-analysis.md) - If navigating code
- [Development Guide](./development-guide.md) - For implementation guidelines

### Example AI Prompt

```
I want to add [FEATURE NAME] to the Price Tracker application.

Please review:
- Architecture: docs/architecture.md
- Component Inventory: docs/component-inventory.md
- Data Models: docs/data-models.md

Then create a PRD that:
1. Identifies reusable components from component inventory
2. Proposes database schema changes if needed
3. Lists required new Tauri commands
4. Follows existing architectural patterns
5. Considers the "Future Extension Points" noted in architecture.md
```

---

## 🔧 Development Workflow

### BMad Method Workflow (Brownfield)

**Current Phase**: Documentation Complete ✅

**Next Steps**:
1. ✅ **Document Project** - DONE (you're reading it!)
2. 🔄 **Research** (optional) - Analyze domain-specific needs
3. **PRD** - Define new feature requirements
4. **UX Design** (if UI changes) - Design user experience
5. **Architecture** - Technical design for feature
6. **Epics & Stories** - Break down into implementable work
7. **Sprint Planning** - Organize implementation
8. **Implementation** - Build features

**BMM Workflow Status**: See `docs/bmm-workflow-status.yaml`

---

## 📁 File Structure

```
docs/
├── index.md                      # THIS FILE - Start here!
├── project-overview.md           # High-level summary
├── architecture.md               # System design
├── component-inventory.md        # React components
├── data-models.md                # Database schema
├── api-contracts.md              # Tauri commands
├── source-tree-analysis.md       # Code organization
├── development-guide.md          # How to develop
├── bmm-workflow-status.yaml      # BMM workflow tracking
└── project-scan-report.json      # Documentation generation state
```

---

## 🎓 Getting Started Guide

### For New Developers

1. **Understand the Project**
   - Read [Project Overview](./project-overview.md)
   - Skim [Architecture](./architecture.md) to understand system design

2. **Set Up Development Environment**
   - Follow [Development Guide](./development-guide.md) → Prerequisites & Installation
   - Run `yarn dev` to see the app in browser mode

3. **Explore the Code**
   - Use [Source Tree Analysis](./source-tree-analysis.md) as a map
   - Look at [Component Inventory](./component-inventory.md) to understand UI

4. **Make Your First Change**
   - Follow [Development Guide](./development-guide.md) → Common Development Tasks
   - Try adding a new product category

5. **Write Tests**
   - Review [TESTING.md](../TESTING.md)
   - Add tests for your changes

---

### For AI Agents (Brownfield PRD Creation)

**You are here because a new feature needs to be planned!**

**Your mission**:
1. Load and understand these key documents:
   - [Architecture](./architecture.md)
   - [Component Inventory](./component-inventory.md)
   - [Data Models](./data-models.md)

2. Identify **reusable components** from component inventory

3. Determine **database changes** needed (if any) from data models

4. Follow **existing patterns** documented in architecture

5. Check **Future Extension Points** in architecture for guidance

6. Create a **comprehensive PRD** that:
   - Leverages existing components
   - Follows architectural patterns
   - Minimizes new code by reusing utilities
   - Proposes sensible database schema extensions

**Tip**: The "Planned Features" section in [Project Overview](./project-overview.md) lists features the user wants to add!

---

## ❓ FAQ

### Q: Which document should I read first?
**A**: [Project Overview](./project-overview.md) for a high-level understanding, then [Architecture](./architecture.md) for technical details.

### Q: How do I find a specific component?
**A**: Check [Component Inventory](./component-inventory.md) → organized by category with descriptions.

### Q: How do I add a new database field?
**A**: Read [Data Models](./data-models.md) → Schema Evolution section, then [Development Guide](./development-guide.md) for implementation steps.

### Q: What Tauri commands are available?
**A**: See [API Contracts](./api-contracts.md) → complete list with request/response formats.

### Q: How do I add a new e-commerce platform parser?
**A**: [Development Guide](./development-guide.md) → "Adding a New Product Parser" section.

### Q: Where is the test suite?
**A**: `src/tests/` directory. See [TESTING.md](../TESTING.md) for details.

### Q: How do I run the app?
**A**: [Development Guide](./development-guide.md) → "Development Modes" section. Short answer: `yarn dev` (browser) or `yarn tauri dev` (desktop).

---

## 🔗 External Resources

- **Tauri v2 Documentation**: https://v2.tauri.app/
- **React Documentation**: https://react.dev/
- **Ant Design**: https://ant.design/
- **TypeScript**: https://www.typescriptlang.org/
- **Rust**: https://www.rust-lang.org/
- **SQLite**: https://www.sqlite.org/

---

## 📝 Documentation Maintenance

### Last Generated

**Date**: 2025-11-25
**Mode**: initial_scan
**Scan Level**: exhaustive
**Workflow Version**: 1.2.0

### How to Update

To regenerate this documentation:

```bash
# Load analyst agent
# Run document-project workflow
/bmad:bmm:workflows:document-project
```

### State File

Documentation generation state: `docs/project-scan-report.json`

---

**👋 Welcome to Price Tracker!** If you have questions, check the relevant documentation above or refer to [CLAUDE.md](../CLAUDE.md) for additional guidance.

**Happy building! 🚀**
