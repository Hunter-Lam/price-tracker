# Price Tracker - Product Requirements Document

**Author:** Hunter
**Date:** 2025-11-26
**Version:** 1.0

---

## Executive Summary

Price Tracker transforms tedious manual price monitoring into effortless automated tracking for Chinese e-commerce platforms (JD.com, Taobao, Tmall). Users currently waste hours manually checking prices and miss critical price drops. This PRD defines enhancements that automate price crawling, deliver real-time alerts, and identify best deals across platforms—all while keeping data local and private on the user's device.

### What Makes This Special

**Easy to Use** - No complex setup. Paste a product URL, click track, done.
**Local Storage** - Your price data stays on your device. No cloud, no privacy concerns, no subscriptions.
**Automation** - Set price thresholds and forget. Desktop notifications alert you when prices drop.
**Cross-Platform** - Native desktop app for macOS, Windows, and Linux via Tauri.
**Chinese E-commerce Focus** - Purpose-built parsers for JD, Taobao, and Tmall where Western tools fail.

---

## Project Classification

**Technical Type:** Desktop Application
**Domain:** E-commerce / Consumer Tools
**Complexity:** Medium

This is a **cross-platform desktop application** built with Tauri 2 (Rust + React + TypeScript). The app targets individual consumers tracking Chinese e-commerce prices for personal purchasing decisions. Complexity stems from web scraping anti-bot measures, multi-platform support, and background automation—not domain regulations.

---

## Success Criteria

Success means users **stop manually checking prices** and **never miss a deal**. Specifically:

**For Personal Use (Current):**
- Track 50-100+ products without manual effort
- Receive desktop notifications within 5 minutes of price drops
- Identify best deals across JD/Taobao/Tmall at a glance
- Zero data loss or missed price changes during background monitoring

**For Public Release (Future):**
- Users set up automated tracking in under 2 minutes
- 90%+ success rate fetching prices from product URLs
- Users report saving money by catching price drops they'd have missed
- Positive feedback on "easy to use" and "privacy-respecting"

**Non-Goals (What We're NOT Measuring):**
- Total user count (personal tool first, not viral growth)
- Revenue/monetization (no paid features planned)
- Social/sharing features (individual use case)

---

## Product Scope

### MVP - Minimum Viable Product

**Core Goal:** Eliminate manual price checking for tracked products.

**Phase 1 - Enhanced Manual (Cost: $0, Quick Wins):**
1. **Database Optimization** - Add indexes for 10-100x query speedup
2. **Basic Price Alerts** - Configure thresholds per product, desktop notifications
3. **Manual "Check Now"** - Button to refresh all tracked products on demand

**Phase 2 - Semi-Automated (Cost: $0-10/month):**
4. **URL-Based Fetching** - Paste product URL, app fetches and parses automatically
5. **Simple HTTP Scraping** - Fetch JD.com prices via HTTP (works without headless browser)
6. **Desktop Notifications** - Native OS notifications for price drops
7. **Scheduled Background Checks** - Configurable interval (hourly/daily) with rate limiting

**What's In Scope:**
- JD.com automated fetching (medium difficulty, HTTP works)
- Taobao/Tmall manual or paste-based entry (scraping too difficult for MVP)
- Local SQLite with performance optimizations
- Price drop detection and alerts
- Cross-platform desktop (macOS, Windows, Linux)

**What's NOT in MVP:**
- Review aggregation
- Best deal calculator across platforms
- Order records tracking
- Product requirements/inspection standards
- Headless browser scraping
- Proxy rotation or CAPTCHA solving

### Growth Features (Post-MVP)

**Phase 3 - Scheduled Updates (Cost: $20-50/month):**
1. **Taobao Open Platform API Integration** - Official API for Taobao/Tmall (requires business registration)
2. **Review Aggregation** - Scrape JD reviews, sentiment analysis
3. **Schema Normalization** - Separate price_history table, brands table
4. **Best Deal Calculator** - Multi-factor scoring: price + discount + platform trust

**Phase 4 - Production-Grade (Cost: $100-300/month):**
5. **Headless Browser** - Playwright integration for JavaScript-heavy sites
6. **Proxy Rotation** - Residential Chinese IPs for anti-bot evasion
7. **Advanced Sentiment Analysis** - ML-based review analysis (SnowNLP)
8. **Email Notifications** - Optional email alerts alongside desktop

### Vision (Future)

**Beyond Price Tracking:**
- **Product Requirements Settings** - Define criteria, auto-match products
- **Inspection Standards** - Quality checklists, pass/fail indicators
- **Order Records** - Track actual purchases, compare predicted vs actual prices
- **Seasonal Trend Analysis** - Predict best times to buy based on historical patterns
- **Brand Comparison** - Compare same product across brands with quality metrics
- **Multi-User Sync** - Optional cloud sync for users wanting cross-device access (privacy-preserving)

---

## Desktop App Specific Requirements

### Cross-Platform Support

**Target Platforms:**
- macOS (primary development platform - 11.0+)
- Windows (10+)
- Linux (major distributions via AppImage)

**Platform-Specific Behaviors:**
- Database location: Platform-specific app data directories (already implemented)
- System tray integration: Optional background mode
- Native notifications: Platform-native notification centers
- Auto-launch on startup: User-configurable

### System Integration

**File System:**
- Configurable database location (already implemented)
- CSV import/export (already implemented)
- Backup/restore functionality (planned)

**Background Processing:**
- Run as system tray app (minimize to tray)
- Background price checks without window open
- Wake from sleep to run scheduled checks
- Respect user's "Do Not Disturb" mode

### Auto-Update Strategy

**Update Mechanism:**
- Tauri updater plugin for silent background updates
- Check for updates on app launch
- User prompt before applying updates
- Rollback capability if update fails

**Distribution:**
- GitHub Releases for update manifests
- Platform-specific installers (.dmg, .msi, .AppImage)
- Code signing for macOS/Windows (post-MVP)

### Offline Capabilities

**What Works Offline:**
- View all tracked products and price history
- Manual product entry
- Edit existing products
- Export data to CSV

**What Requires Internet:**
- Fetch prices from URLs
- Scheduled background price updates
- Check for app updates

---

## Functional Requirements

### Product Data Management

**FR1:** Users can manually add products with title, brand, category, price, original price, discount details, quantity, unit, specification, source URL, date, and remarks

**FR2:** Users can edit existing product information including all fields

**FR3:** Users can delete products from tracking

**FR4:** Users can view all tracked products in a searchable, sortable table

**FR5:** Users can organize products by category (food, daily goods, electronics, etc.)

**FR6:** Users can toggle table column visibility to customize their view

**FR7:** Users can import products from CSV/Excel files

**FR8:** Users can export all products to CSV format

### Automated Price Fetching

**FR9:** Users can paste a product URL (JD.com, Taobao, Tmall) and have product information automatically fetched and parsed

**FR10:** System automatically extracts product title, brand, price, original price, discount information, and specifications from URLs

**FR11:** Users can manually trigger "Check Now" to refresh prices for all tracked products

**FR12:** System performs scheduled background price checks at user-configurable intervals (hourly, daily, custom)

**FR13:** System maintains a success/failure log for price fetch attempts

**FR14:** When automated fetch fails, system falls back to manual entry mode

### Price History & Analysis

**FR15:** System automatically records price changes over time for each product

**FR16:** Users can view price history as interactive line charts

**FR17:** Users can filter price history by product (title + brand)

**FR18:** Users can filter price history by date range

**FR19:** System compares original price vs final price (after discounts)

**FR20:** System calculates and displays unit prices for price-per-unit comparison

**FR21:** System converts between different units (g, kg, 斤, 両, ml, L, pieces) for comparison

### Price Alerts & Notifications

**FR22:** Users can configure price drop thresholds for individual products (absolute price or percentage)

**FR23:** Users can set alert conditions: price drops below X, price drops by Y%, reaches historical low

**FR24:** System sends desktop notifications when configured price alerts trigger

**FR25:** Users can configure quiet hours to suppress notifications during specific times

**FR26:** System implements alert cooldown periods to prevent notification spam

**FR27:** Users can view notification history and which alerts have been triggered

**FR28:** System detects "significant" price changes (>5% movement) and highlights them

### Discount Calculation

**FR29:** Users can record multiple discount sources (store, platform, government) per product

**FR30:** System supports discount types: percentage, fixed amount, coupons

**FR31:** System calculates final price from original price + all discount layers

**FR32:** Users can parse discount information from pasted text

### Data Persistence & Management

**FR33:** All product data is stored locally in SQLite database on user's device

**FR34:** Users can configure custom database file location

**FR35:** System creates automatic backups before schema migrations

**FR36:** Users can view current database file path and size

**FR37:** System maintains data integrity with foreign keys and constraints

### Background Processing

**FR38:** App can run in system tray (minimized) while performing background tasks

**FR39:** System performs scheduled price checks even when app window is closed (system tray mode)

**FR40:** System respects user's "Do Not Disturb" mode for notifications

**FR41:** System wakes from computer sleep to run scheduled price checks (optional)

**FR42:** Users can pause/resume background price monitoring

### User Experience

**FR43:** Users can switch between English and Chinese (Traditional) languages

**FR44:** Users can toggle between dark and light themes

**FR45:** System persists user preferences (language, theme, column visibility, alert settings) locally

**FR46:** Users can access keyboard shortcuts for efficient data entry

**FR47:** System provides clear error messages when price fetching fails

**FR48:** System shows progress indicators for long-running operations (bulk price checks)

### Platform Support

**FR49:** App runs natively on macOS, Windows, and Linux

**FR50:** App uses platform-specific app data directories for database storage

**FR51:** App integrates with platform-native notification centers

**FR52:** Users can configure app to launch on system startup (optional)

### Updates & Maintenance

**FR53:** App checks for updates on launch

**FR54:** Users are prompted before applying updates

**FR55:** System can roll back failed updates

**Total Functional Requirements: 55**

---

## Non-Functional Requirements

### Performance Requirements

**NFR1: Database Query Performance**
- Product list queries complete in <100ms for up to 1,000 products
- Price history queries complete in <50ms for 30-day range
- Full-text search returns results in <200ms
- Achieved via: Database indexes on brand, type, date, created_at columns

**NFR2: Price Fetch Performance**
- Single URL fetch completes in <5 seconds (with retry)
- Bulk "Check Now" for 100 products completes in <5 minutes
- Background scheduled checks don't block UI interactions
- Achieved via: Async Rust backend (Tokio), connection pooling, 5-10 concurrent workers

**NFR3: UI Responsiveness**
- App launches in <2 seconds
- Table sorting/filtering updates in <100ms
- Chart rendering completes in <500ms for 100 data points
- No UI freezes during background operations
- Achieved via: React virtualization for large lists, Web Workers for heavy computation

**NFR4: Resource Usage**
- Memory footprint <200MB for typical use (100 tracked products)
- CPU usage <5% when idle in system tray
- Disk space <50MB for app + 1000 products with price history
- Achieved via: Efficient SQLite queries, cleanup of old logs, image caching

### Security Requirements

**NFR5: Data Privacy**
- All product data stored locally on user's device
- No cloud sync, no external data transmission except price fetching
- No analytics or telemetry without explicit user consent
- Database file readable only by app (file permissions)

**NFR6: Network Security**
- All HTTP requests use HTTPS only
- SSL/TLS certificate validation enforced
- No credentials stored in database (URLs only)
- User-Agent rotation to avoid fingerprinting (anti-bot measure)

**NFR7: Input Validation**
- URL validation before fetching (prevent SSRF attacks)
- SQL injection prevention via parameterized queries (already enforced by rusqlite)
- XSS prevention in UI (React escaping + Content Security Policy)
- File path validation for database location (prevent directory traversal)

**NFR8: Update Security**
- App updates signed with code signing certificates (post-MVP)
- Update manifests served over HTTPS
- Checksum validation before applying updates
- Rollback capability if update verification fails

### Scalability Requirements

**NFR9: Data Volume**
- Support up to 10,000 tracked products without performance degradation
- Support 100,000+ price history records with acceptable query times (<100ms)
- Achieved via: Schema normalization (price_history table), indexes, prepared statements

**NFR10: Concurrent Operations**
- Handle 10 simultaneous price fetches without blocking
- Process background checks while UI remains responsive
- Achieved via: Tokio async runtime, connection pooling, rate limiting

**NFR11: Rate Limiting**
- Maximum 5 requests/second per domain (JD, Taobao, Tmall)
- Exponential backoff on errors (1s → 2s → 4s → 8s → max 60s)
- Configurable user-defined rate limits per platform
- Achieved via: AdaptiveRateLimiter in Rust backend

**NFR12: Storage Growth**
- Database file grows linearly with tracked products
- Estimated: 1KB per product, 500 bytes per price history entry
- Cleanup old price history beyond 1 year (user-configurable retention)
- Achieved via: PRAGMA auto_vacuum, periodic cleanup jobs

### Reliability Requirements

**NFR13: Data Integrity**
- Zero data loss during background updates or app crashes
- Database transactions ensure atomicity (all-or-nothing writes)
- Automatic backups before schema migrations
- Achieved via: SQLite WAL mode, transaction boundaries, backup protocol

**NFR14: Fault Tolerance**
- App recovers gracefully from network failures
- Retries failed price fetches with exponential backoff
- Falls back to manual entry if automated fetch fails repeatedly
- Continues functioning offline (view/edit data, no price updates)

**NFR15: Availability**
- App available 24/7 for local operations (view, edit, export)
- Background checks run even when app window closed (system tray)
- Recovers from sleep/hibernate and resumes scheduled checks

---

## Summary

### Requirements Summary

This PRD defines enhancements to transform Price Tracker from a manual data entry tool into an automated price monitoring system.

**Scope:**
- **55 Functional Requirements** across 9 capability areas
- **15 Non-Functional Requirements** covering performance, security, scalability, reliability
- **2-Phase MVP** (Phase 1: $0 cost, Phase 2: $0-10/month)
- **Post-MVP Growth** (Phase 3-4: $20-300/month depending on features)

**Key Capabilities Enabled:**
1. Automated price fetching from URLs (JD.com initially)
2. Scheduled background price monitoring
3. Desktop notifications for price drops
4. Database optimization for 10-100x performance improvement
5. Cross-platform support (macOS, Windows, Linux)

**Deferred to Post-MVP:**
- Review aggregation and sentiment analysis
- Best deal calculator across platforms
- Taobao API integration (requires business registration)
- Headless browser scraping with proxy rotation

### Product Value

**For Users:**
- **Save Time:** Eliminate manual price checking - automate tracking for 50-100+ products
- **Save Money:** Never miss price drops with real-time desktop notifications
- **Stay Private:** All data stays local on your device, no cloud, no subscriptions
- **Work Anywhere:** Cross-platform desktop app for macOS, Windows, Linux

**Technical Foundation:**
- Built on proven stack: Tauri 2 + React 18 + TypeScript + Rust + SQLite
- Existing working parsers (92 tests, 100% pass rate)
- Extensible architecture for future growth (reviews, best deals, APIs)

**Competitive Differentiation:**
- **Chinese E-commerce Focus:** Purpose-built for JD, Taobao, Tmall (Western tools fail here)
- **Local-First:** Privacy-respecting, no cloud dependency
- **Easy to Use:** Paste URL → Track → Get Notified (under 2 minutes setup)
- **Cross-Platform Desktop:** Native performance, system integration, offline capable

This PRD provides the complete capability contract for UX design, architecture, and epic breakdown workflows.
