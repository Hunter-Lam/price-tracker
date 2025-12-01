# Price Tracker UX Design Specification

_Created on 2025-11-26 by Hunter_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

Price Tracker's UX design focuses on making automated price monitoring feel **effortless and trustworthy**. The experience centers on "Paste → Track → Forget" - users add products once, set alert thresholds, and rely on desktop notifications to catch deals. The visual design maintains the existing professional Ant Design aesthetic while adding semantic color intelligence specifically for price alerts and background monitoring states.

**Design Philosophy:** Calm confidence through automation. Users should feel they have a tireless assistant watching prices 24/7.

---

## 1. Design System Foundation

### 1.1 Design System Choice

**Decision: Continue with Ant Design 5**

**Rationale:**
- Already integrated and working across 16 existing components
- Desktop-optimized with excellent data table (perfect for 50-100+ product tracking)
- Built-in notification system (critical for price drop alerts)
- Strong i18n support (English + Chinese Traditional)
- Comprehensive theming (dark/light mode already implemented)
- 80+ components covering all desktop UI patterns needed

**What Ant Design Provides:**
- ✅ Table with sorting, filtering, inline editing
- ✅ Notification component for price alerts
- ✅ Form validation for alert configuration
- ✅ Badge indicators for new price changes
- ✅ Progress states for bulk "Check Now" operations
- ✅ Popconfirm for destructive actions

**Customization Strategy:**
- Keep Ant Design as foundation
- Enhance with semantic price alert colors
- Use Tailwind CSS for spacing/layout utilities
- Custom components only when Ant Design doesn't fit (e.g., system tray integration)

---

## 2. Core User Experience

### 2.1 Defining Experience

**Core Experience: "Paste → Track → Forget"**

Users paste a product URL once, configure a price alert threshold, and forget about manual checking. The app monitors prices automatically in the background and delivers desktop notifications when deals appear.

**Primary User Actions:**
1. **Add product to track** - Paste URL → auto-fetch → set alert threshold → done (2 minutes)
2. **Review price drop notifications** - Click notification → see product details and price history
3. **Manage tracked products** - Scan table of 50-100+ products, identify best current deals

**Usage Pattern:**
- **System tray mode:** App runs minimized, monitoring in background
- **Notification-driven:** Alerts bring users back when prices drop
- **Dashboard for analysis:** Main window for reviewing price history and managing products

**Desired Emotion:**
**Calm confidence** - "I have a tireless assistant watching prices 24/7. I can stop worrying and trust I'll never miss a deal."

### 2.2 Novel UX Patterns

No novel patterns required. Price Tracker uses standard desktop application patterns:
- Data tables for product management
- Forms for data entry and alert configuration
- Charts for price history visualization
- Native notifications for alerts
- System tray for background operation

All patterns have established best practices that we'll follow.

---

## 3. Visual Foundation

### 3.1 Color System

**Base Theme: Ant Design 5 Default**

**Primary Colors:**
- Primary: `#1677ff` (Blue) - main actions, links
- Success: `#52c41a` (Green) - success states
- Warning: `#faad14` (Orange) - warnings
- Error: `#ff4d4f` (Red) - errors, destructive actions
- Info: `#1677ff` (Blue) - informational messages

**Semantic Price Alert Colors:**

Enhanced color semantics specifically for price tracking features:

```typescript
priceAlertTheme = {
  // Price change indicators
  priceDown: '#52c41a',      // Green - "Good news! Price dropped!"
  priceUp: '#faad14',        // Orange - "Caution - price increased"
  priceStable: '#8c8c8c',    // Gray - no significant change

  // Alert states
  alertTriggered: '#1677ff',  // Blue - "Your alert was triggered"
  alertActive: '#722ed1',     // Purple - "Monitoring in background"
  alertPaused: '#d9d9d9',     // Light gray - monitoring paused

  // Fetch operation states
  fetchSuccess: '#52c41a',    // Green - successful price update
  fetchError: '#ff4d4f',      // Red - failed to fetch (check URL)
  fetchLoading: '#1677ff',    // Blue - fetching in progress

  // Historical price analysis
  historicalLow: '#13c2c2',   // Cyan - "All-time low! Best deal ever!"
  historicalHigh: '#fa541c',  // Red-orange - "Historically expensive"
};
```

**Color Psychology & Hierarchy:**

1. **Price drops dominate** - Green is the most eye-catching color. Users scan the product table for green indicators = deals found
2. **Errors demand attention** - Red alerts are critical (fetch failures block monitoring)
3. **Background work is subtle** - Purple/gray indicators don't distract from primary content
4. **Historical context adds excitement** - Cyan "all-time low" badges create urgency to buy

**Dark/Light Mode:**

Existing implementation:
- Theme toggle in header
- Respects system preferences (prefers-color-scheme)
- Persisted to localStorage
- Ant Design ConfigProvider handles automatic color adjustments

**Typography System:**

Ant Design defaults (optimized for desktop readability):

- **Font Family:** System font stack
  - Latin: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
  - Chinese: 'Microsoft YaHei', 微软雅黑
- **Type Scale:**
  - h1: 38px (page titles)
  - h2: 30px (section headers)
  - h3: 24px (subsections)
  - h4: 20px (cards, panels)
  - h5: 16px (emphasized text)
  - Body: 14px (standard desktop readability)
  - Small: 12px (secondary info, timestamps)
- **Font Weights:**
  - Regular: 400 (body text)
  - Medium: 500 (emphasized text)
  - Bold: 600 (headings, CTAs)

**Spacing System:**

Ant Design 8px base unit:
- xs: 8px - compact spacing
- sm: 12px - comfortable spacing
- md: 16px - default component spacing
- lg: 24px - section spacing
- xl: 32px - major section breaks
- xxl: 48px - page-level spacing

**Visual Foundation Decision:**

✅ **Base Theme:** Ant Design 5 default (professional blue)
✅ **Dark/Light Mode:** Existing implementation (system preference + toggle)
✅ **Typography:** Ant Design system fonts, 14px body text
✅ **Spacing:** 8px base unit grid
✅ **Color Enhancements:** Semantic price alert colors for new automated features
✅ **Rationale:** Maintain consistency with existing 16 components, add intentional color semantics for price monitoring

**Interactive Visualizations:**

- Color Theme Explorer: [ux-color-themes.html](./ux-color-themes.html)

---

## 4. Design Direction

### 4.1 Chosen Design Approach

[To be selected]

**Interactive Mockups:**

- Design Direction Showcase: [ux-design-directions.html](./ux-design-directions.html)

---

## 5. User Journey Flows

### 5.1 Critical User Paths

[To be designed]

---

## 6. Component Library

### 6.1 Component Strategy

[To be defined]

---

## 7. UX Pattern Decisions

### 7.1 Consistency Rules

[To be established]

---

## 8. Responsive Design & Accessibility

### 8.1 Responsive Strategy

[To be planned]

---

## 9. Implementation Guidance

### 9.1 Completion Summary

[To be completed]

---

## Appendix

### Related Documents

- Product Requirements: `docs/prd.md`
- Architecture: `docs/architecture.md`
- Technical Research: `docs/technical-research-report.md`

### Core Interactive Deliverables

This UX Design Specification was created through visual collaboration:

- **Color Theme Visualizer**: docs/ux-color-themes.html
- **Design Direction Mockups**: docs/ux-design-directions.html

### Version History

| Date       | Version | Changes                         | Author |
| ---------- | ------- | ------------------------------- | ------ |
| 2025-11-26 | 1.0     | Initial UX Design Specification | Hunter |

---

_This UX Design Specification was created through collaborative design facilitation, not template generation. All decisions were made with user input and are documented with rationale._
