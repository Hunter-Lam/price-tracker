# PRD Guidance - Price Tracker Enhancement

**Document Type:** Planning guidance for PRD workflow
**Created:** 2025-11-26
**For:** PM Agent - PRD Workflow

---

## Context for PRD Creation

### Completed Work
1. ✅ **Project Documentation** (`docs/index.md` + 7 supporting docs)
   - Complete brownfield codebase analysis
   - 16 React components cataloged
   - Current architecture documented
   - Technology stack: Tauri 2 + React 18 + TypeScript + SQLite

2. ✅ **Technical Research** (`docs/technical-research-report.md`)
   - 8 technical areas researched
   - Implementation strategies defined
   - Cost estimates provided
   - Risk analysis completed

### Current State (What Exists)

**Implemented Features:**
- ✅ Manual product entry via ProductForm
- ✅ Product table with inline editing
- ✅ Price history visualization (charts)
- ✅ Automatic product info parsing (JD.com, Taobao paste text)
- ✅ Unit price calculation
- ✅ Discount calculation
- ✅ CSV import/export
- ✅ Multi-language (EN/中文)
- ✅ Dark/light theme
- ✅ SQLite database with configurable location

**Parsers (Working):**
- JDProductParser (17 tests, 100% pass)
- TaobaoProductParser (20 tests, 100% pass)
- PlainTextParser (17 tests, 100% pass)

### Planned Features (Not Yet Implemented)

From project overview and user context:

1. **Automatic Product Price Crawling**
   - Fetch prices from URLs automatically
   - Scheduled background updates
   - Multi-platform support (JD, Taobao, Tmall)

2. **Best Deal Calculation**
   - Compare prices across platforms
   - Calculate deal scores (price + discount + trust)
   - Recommend best purchase option

3. **Product Order Records**
   - Track actual purchases
   - Compare expected vs actual prices
   - Purchase history analysis

4. **User Product Requirements Settings**
   - Define product criteria
   - Requirement templates
   - Auto-match products to requirements

5. **Product Inspection Standards**
   - Quality checklists
   - QA criteria
   - Pass/fail indicators

6. **Actual User Reviews Integration**
   - Aggregate reviews from platforms
   - Sentiment analysis
   - Review summary visualization

---

## Technical Research Findings Summary

### Key Constraints & Decisions

**Web Scraping:**
- JD.com: Medium difficulty, HTTP requests work
- Taobao/Tmall: Extremely difficult, API strongly recommended
- **Decision:** Hybrid approach (scrape JD, API for Taobao)

**Anti-Bot Measures:**
- Residential proxies needed ($50-200/month for production)
- Rate limiting essential (1-5 req/sec per domain)
- CAPTCHA solving ($5-10 per 1000 for Taobao)

**APIs Available:**
- JD Union API (limited, affiliate only)
- Taobao Open Platform (requires business registration, FREE)
- **Recommendation:** Register for Taobao API

**Database Optimization:**
- Current SQLite works for <10K products
- Needs indexes for scale (10-100x speedup)
- Schema normalization recommended
- Can scale to 100K+ with optimizations

**Notifications:**
- Tauri native support ✅
- Desktop notifications ready
- System tray integration possible
- Background scheduling with Tokio

### Phased Implementation (From Research)

**Phase 1: Enhanced Manual + Optimizations** (Cost: $0)
- Database indexes
- Basic price alerts
- Improved parsers
- **Timeline:** Quick wins

**Phase 2: Semi-Automated** (Cost: $0-10/month)
- URL-based fetching (user pastes URL)
- Simple HTTP scraping
- Desktop notifications
- **Timeline:** Low complexity

**Phase 3: Scheduled Updates** (Cost: $20-50/month)
- Background price checks (daily)
- Taobao API integration
- Review aggregation (JD first)
- Schema normalization
- **Timeline:** Moderate complexity

**Phase 4: Production-Grade** (Cost: $100-300/month)
- Headless browser (Playwright)
- Proxy rotation
- Advanced ML sentiment analysis
- Email notifications
- **Timeline:** High complexity

---

## Recommended PRD Scope

### MVP Scope (Phase 1 + Phase 2)

**Core Features to Include in PRD:**

1. **Automated URL Fetching**
   - User pastes product URL
   - App fetches and parses automatically
   - Support JD, Taobao, Tmall URLs
   - Fallback to manual if fetch fails

2. **Database Optimization**
   - Add indexes (brand, type, date, created_at)
   - Enable WAL mode
   - Implement prepared statements
   - Add full-text search

3. **Price Alert System**
   - Configure alert thresholds per product
   - Desktop notifications
   - Alert types: threshold, percentage drop, historical low
   - Cooldown periods (avoid spam)

4. **Basic Scheduled Updates**
   - Manual "Check Now" button
   - Configurable check interval (hourly/daily)
   - Update tracked products in background
   - Rate limiting (5 req/min max)

5. **Enhanced Price History**
   - Separate price_history table
   - Track price changes over time
   - Visualize trends
   - Detect significant changes (>5%)

### Future Scope (Phase 3+)

**Defer to Later PRDs:**
- Review aggregation (complex, requires API)
- Best deal calculator (needs multi-platform data)
- Order records (separate feature)
- Inspection standards (separate feature)
- Requirements settings (separate feature)

**Rationale:** Keep MVP focused, validate approach, then expand

---

## Technical Considerations for PRD

### Architecture Changes Needed

1. **New Tauri Commands**
   - `fetch_product_from_url(url: String) -> Result<String>`
   - `create_price_alert(product_id, alert_type, threshold)`
   - `check_price_updates() -> Result<Vec<PriceChange>>`
   - `get_price_history(product_id, days) -> Result<Vec<PriceSnapshot>>`

2. **Database Schema Changes**
   - Add `price_history` table
   - Add `price_alerts` table
   - Add indexes to `products` table
   - Add `notification_log` table

3. **New Components**
   - `URLFetcher` - Paste URL, auto-fetch
   - `PriceAlertManager` - Configure alerts
   - `NotificationSettings` - User preferences
   - `PriceHistoryDetail` - Enhanced chart view

4. **Background Services**
   - Tokio task for scheduled checks
   - Notification manager
   - Rate limiter
   - Cache manager

### Non-Functional Requirements

**Performance:**
- Product list load: <100ms (with 1000 products)
- URL fetch: <5s (with retry)
- Price check all products: <5min (100 products)

**Reliability:**
- Handle network failures gracefully
- Retry with exponential backoff
- Cache stale data if fetch fails

**Security:**
- No credentials stored in database
- HTTPS only for fetches
- Validate all URLs before fetching

**Usability:**
- One-click URL fetch
- Clear error messages
- Progress indicators for long operations

---

## Success Metrics

**For MVP (Phase 1-2):**
- ✅ 90%+ URL fetch success rate (JD.com)
- ✅ <5s average URL fetch time
- ✅ Price alerts delivered within 5min of change
- ✅ Zero data loss during background updates
- ✅ Database queries <100ms with 1K products

**User Experience:**
- Reduce manual data entry by 80%
- Increase product tracking from 10s to 100s
- Daily active usage (check prices)

---

## Risks & Mitigations

### Technical Risks

**Risk 1: Taobao scraping fails**
- Mitigation: Use Taobao Open Platform API
- Fallback: Manual entry still works

**Risk 2: JD changes HTML structure**
- Mitigation: Maintain multiple selector strategies
- Fallback: Parser gracefully degrades to manual

**Risk 3: Database performance at scale**
- Mitigation: Implement indexes in Phase 1
- Monitoring: Log query times, alert if >100ms

**Risk 4: Notification spam**
- Mitigation: Cooldown periods, user preferences
- Solution: Aggregate daily digest option

### Business/Legal Risks

**Risk 1: Terms of Service violation**
- Mitigation: Use official APIs where available
- Legal: Personal use only, not commercial

**Risk 2: IP bans from platforms**
- Mitigation: Rate limiting, respectful scraping
- Fallback: Proxy rotation (Phase 3)

---

## Open Questions for PRD

1. **Taobao API Access:**
   - Does user have business license for Taobao API registration?
   - Timeline for API approval (1-2 weeks)?
   - Fallback if API not approved?

2. **Scope Priority:**
   - Start with Phase 1 only, or include Phase 2?
   - Which platform is highest priority (JD vs Taobao)?

3. **Review Integration:**
   - Include in MVP or defer to Phase 3?
   - If included, which platform first (JD easier)?

4. **User Preferences:**
   - Multi-user support needed? (Probably not for desktop app)
   - Export/import settings needed?

---

## Handoff to PM Agent

**PM Agent should use these documents:**
1. `docs/architecture.md` - Current architecture
2. `docs/component-inventory.md` - Existing components
3. `docs/data-models.md` - Current database schema
4. `docs/technical-research-report.md` - Implementation strategies
5. This document - Planning guidance

**PM Agent should create:**
- PRD document with clear requirements
- User stories for each feature
- Acceptance criteria
- Dependencies and constraints
- Phased rollout plan

**PRD should be saved to:**
- `docs/prd.md` (or sharded format if preferred)

---

**Guidance document complete - ready for PRD workflow**
