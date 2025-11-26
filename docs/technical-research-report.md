# Technical Research Report: Price Tracking System

**Project:** Price Tracker (Tauri Desktop Application)
**Research Date:** 2025-11-26
**Researcher:** Analyst Agent
**Scope:** Comprehensive technical evaluation for planned features

---

## Executive Summary

This research report covers 8 critical technical areas for implementing automated price tracking, web scraping, and review aggregation features for Chinese e-commerce platforms (JD.com, Taobao, Tmall).

**Key Findings:**
- ✅ Web scraping is technically feasible but requires anti-detection measures
- ⚠️ Taobao/Tmall have industry-leading anti-bot systems - API integration recommended
- ✅ SQLite can scale to 100,000+ products with proper optimization
- ✅ Tauri provides excellent native notification support
- ⚠️ Legal considerations: Official APIs preferred for production use

---

## 1. Web Scraping at Scale

### Recommended Architecture

**Framework Selection:**
- **Scrapy** (Python): Best for structured, large-scale scraping
- **Playwright** (Node.js/Python/Rust): Best for JavaScript-heavy sites
- **Recommendation for Price Tracker**: Playwright via Rust bindings

### Key Architectural Patterns

1. **Distributed Architecture**
   - Master-worker pattern with task queues
   - Redis/RabbitMQ for job distribution
   - Horizontal scaling with Docker containers

2. **Rate Limiting**
   - Adaptive rate limiting (1-5 requests/second per domain)
   - Exponential backoff on errors (1s → 60s max)
   - Respect robots.txt

3. **Anti-Detection**
   - User-Agent rotation (pool of 20+ agents)
   - Header randomization
   - Cookie jar management
   - Residential proxy rotation
   - Request pattern variation (random 2-10s delays)

### Platform-Specific Challenges

**JD.com:**
- Sophisticated fingerprinting (TLS, HTTP/2)
- Rate limits: ~50 requests/hour per IP
- Recommendation: Simple HTTP requests work for basic data

**Taobao/Tmall:**
- Extreme anti-scraping (Alibaba Cloud Shield)
- Requires headless browsers + Chinese residential IPs
- Recommendation: Use official Taobao Open Platform API

### Performance Optimization

- **Concurrency**: 5-10 workers per domain
- **Connection pooling**: Reuse HTTP connections
- **Caching**: 24-hour TTL for product pages
- **Batch processing**: Group related lookups

---

## 2. Data Extraction Techniques

### Current Implementation Strengths
- ✅ JDProductParser handles JSON extraction
- ✅ TaobaoProductParser handles plain text
- ✅ PlainTextParser provides fallback

### Enhancement Opportunities

1. **Schema.org Extraction**
   - Many sites embed JSON-LD with product data
   - Standard schema: name, price, image, brand, review

2. **CSS Selector Strategies**
   - Cascading selectors: `div.product > span.price::text`
   - XPath for complex structures
   - Attribute selectors: `[data-price]`, `[itemprop="price"]`

3. **Headless Browser (Playwright)**
   - More reliable than regex for dynamic sites
   - Handles JavaScript rendering
   - Can wait for specific elements

### Platform-Specific Selectors

**JD.com:**
```css
.sku-name              /* Product title */
.p-price .price        /* Current price */
.p-price .del          /* Original price */
.stock-txt             /* Stock status */
.p-promotions-item     /* Promotions */
```

**Taobao/Tmall:**
```css
[class*="ItemHeader--"]      /* Title */
[class*="Price--priceText"]  /* Price (dynamic) */
[class*="SalesInfo--"]       /* Sales volume */
```

### Data Validation

**Price Extraction Patterns:**
```typescript
const patterns = {
  jd: /¥?(\d+\.?\d*)/,           // ¥199.00
  taobao: /(\d+\.?\d*)\s*元/,    // 199.00 元
  range: /(\d+\.?\d*)[-~](\d+\.?\d*)/, // 199-299
};
```

**Quality Checks:**
- Price sanity: `0 < price < 1,000,000`
- Brand validation against known database
- URL validation
- Encoding: GB2312 → UTF-8 conversion

---

## 3. Price Change Detection

### Detection Strategies

1. **Simple Threshold Detection**
   - Track any price change
   - SQL: Compare current vs previous prices

2. **Significant Change Detection**
   - Ignore <5% changes (noise)
   - Moderate: 10-20% change
   - Major: >20% change

3. **Trend Detection (Moving Average)**
   - 7-day vs 30-day moving average
   - Detect upward/downward trends
   - Predict future price movements

### Best Deal Calculation

**Multi-Factor Scoring:**
```typescript
dealScore =
  (priceRank * 0.4) +           // 40% weight on price
  (discountDepth * 0.3) +       // 30% weight on discount
  (platformReliability * 0.3);  // 30% weight on trust
```

**Platform Reliability Scores:**
- JD: 95 (official, trusted)
- Tmall: 85 (official brands)
- Taobao: 70 (varies by seller)

### Alert System

**Smart Alert Conditions:**
- Price drops below threshold
- Price drops by percentage
- Reaches historical low
- Beats competitor by margin

**Cooldown System:**
- Avoid alert spam
- Configurable hours between alerts per product

### Database Schema Enhancements

```sql
-- Price history (separate table)
CREATE TABLE price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_date (product_id, recorded_at)
);

-- Price alerts
CREATE TABLE price_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    alert_type TEXT NOT NULL,
    threshold_value REAL,
    is_active BOOLEAN DEFAULT 1,
    last_triggered_at DATETIME
);
```

---

## 4. Review Aggregation

### Data Sources

**JD.com:**
- API: `/club/discussion.action?productId={id}`
- Format: JSON with pagination
- Volume: 100-10,000+ reviews per product

**Taobao/Tmall:**
- API: `/mtop.alibaba.review.list/` (GraphQL-like)
- Requires authentication + anti-tampering signature
- Rate limit: ~20 reviews/minute

### Sentiment Analysis

**Approach 1: Rule-Based (Chinese)**
```typescript
positiveKeywords = ['好', '很好', '满意', '推荐', '性价比高']
negativeKeywords = ['差', '不好', '失望', '退货', '假货']
```

**Approach 2: ML-Based (Recommended)**
- Model: SnowNLP (Chinese sentiment library)
- Accuracy: ~85% for e-commerce reviews
- Training: Pre-trained on Chinese product reviews

### Review Summary

**Statistical Aggregation:**
- Total reviews count
- Average rating (1-5 stars)
- Rating distribution
- Sentiment breakdown (positive/neutral/negative %)
- Verified purchase ratio
- Top keywords (positive/negative)
- Recommendation score (0-100)

### Quality Filtering

**Detect Low-Quality Reviews:**
- Too short (<10 characters)
- Generic templates ("好评", "不错")
- Suspicious patterns (paid reviews)
- Duplicate detection (Levenshtein distance)

### Database Schema

```sql
CREATE TABLE product_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    sentiment_score REAL,
    sentiment_label TEXT,
    verified_purchase BOOLEAN DEFAULT 0,
    review_date DATE NOT NULL,
    INDEX idx_product_rating (product_id, rating)
);

CREATE TABLE review_summary (
    product_id INTEGER PRIMARY KEY,
    total_reviews INTEGER NOT NULL,
    average_rating REAL NOT NULL,
    positive_percent REAL,
    recommendation_score INTEGER,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Anti-Bot Countermeasures

### Chinese E-commerce Systems (2025)

**JD.com "风控系统":**
- TLS fingerprinting (JA3/JA4)
- HTTP/2 fingerprinting
- Browser fingerprinting
- Behavioral analysis
- IP reputation scoring

**Taobao "阿里云盾":**
- Industry-leading sophistication
- Dynamic token generation
- HMAC-SHA256 request signing
- Slide puzzle CAPTCHAs
- ML-based traffic analysis
- Real-time IP blacklisting

### Mitigation Strategies

1. **Residential Proxy Rotation**
   - Chinese residential IPs critical
   - Providers: Bright Data, Oxylabs, SmartProxy
   - Cost: $50-200/month for sufficient pool

2. **Browser Fingerprint Randomization**
   - Playwright with stealth plugin
   - Canvas fingerprint noise
   - WebGL randomization
   - Override navigator.webdriver

3. **Request Pattern Humanization**
   - Random delays (1-5 seconds)
   - Simulate mouse movements
   - Human-like scrolling
   - Curved path to clicks

4. **Session Management**
   - Warm up sessions with legitimate browsing
   - Cookie jar persistence
   - Rotate sessions periodically

### CAPTCHA Handling

**Solving Services:**
- 2Captcha: $0.50-1.00 per 1000 normal CAPTCHAs
- Slide CAPTCHAs: $2.00-3.00 per 1000
- Taobao Slide: $5.00-10.00 per 1000 (high difficulty)

### Rate Limiting

**Adaptive Strategy:**
- Start conservative: 1 request/5 seconds
- Monitor response codes (429, 403)
- Exponential backoff on errors
- Gradually speed up on success

### Legal & Ethical Notes

⚠️ **Important:**
- robots.txt compliance legally required
- JD/Taobao ToS prohibit automated scraping
- Personal data concerns (GDPR/PIPL)
- Excessive scraping = potential DDoS (legal risk)

**Recommendation:** Official API partnerships for production

---

## 6. API vs Scraping Decision

### Decision Matrix

| Factor | Official API | Web Scraping |
|--------|-------------|--------------|
| Legality | ✅ Allowed | ⚠️ Violates ToS |
| Reliability | ✅ Stable | ❌ UI changes break |
| Rate Limits | ✅ Clear | ⚠️ Unknown |
| Data Quality | ✅ Validated | ⚠️ Needs cleaning |
| Cost | ⚠️ Paid | ✅ Free (+ proxies) |
| Maintenance | ✅ Low | ❌ High |

### Platform Analysis

**JD.com:**
- Limited Union API (affiliate only)
- Scraping: Medium difficulty
- **Recommendation:** Hybrid (API basics, scrape details)

**Taobao/Tmall:**
- Taobao Open Platform available
- Scraping: Extremely difficult
- **Recommendation:** API (requires business registration)

### Phased Implementation

**Phase 1:** Manual paste (current) - $0 cost, zero risk

**Phase 2:** Semi-automated URL fetch
- User pastes URL
- App fetches and parses
- Cost: $0, Low risk

**Phase 3:** Scheduled background updates
- Daily product checks
- Simple HTTP requests
- Cost: $0-20/month, Medium risk

**Phase 4:** Production-grade
- Taobao Open API integration
- Headless browser for JD
- Proxy rotation + CAPTCHA solving
- Cost: $50-200/month, Low risk

---

## 7. Data Storage Optimization

### Current State
- SQLite single file
- Single products table (15 fields)
- No indexes beyond PRIMARY KEY
- Mutex (single-threaded)
- Works for <10,000 products

### Performance Estimates

| Product Count | Current | Optimized |
|---------------|---------|-----------|
| 100 | 10-20ms | <5ms |
| 1,000 | 50-100ms | <10ms |
| 10,000 | 500-1000ms | <20ms |
| 100,000 | 5-10s | <50ms |

### Optimization Levels

**Level 1: Index Optimization (Easy Win)**
```sql
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_date ON products(date);

-- Full-text search
CREATE VIRTUAL TABLE products_fts USING fts5(title, brand, specification);
```

**Impact:** 10-100x speedup

**Level 2: Schema Normalization**
- Separate price_history table
- Brands table (deduplication)
- Categories table
- Materialized views for current prices

**Level 3: SQLite Tuning**
```sql
PRAGMA journal_mode = WAL;      -- Better concurrency
PRAGMA cache_size = -64000;     -- 64MB cache
PRAGMA synchronous = NORMAL;    -- Speed over safety
PRAGMA mmap_size = 268435456;   -- 256MB memory-mapped
```

### Query Optimization

**Before:**
```sql
SELECT * FROM products ORDER BY created_at DESC;
```

**After:**
```sql
SELECT * FROM products
ORDER BY created_at DESC
LIMIT 100 OFFSET 0;  -- Pagination
```

### Caching Strategy

**Application-Level Cache:**
- In-memory HashMap in Rust
- TTL: 5-15 minutes
- Invalidate on create/update/delete
- 10-100x speedup for repeated queries

### Bulk Operations

**Batch Inserts:**
- Transaction-based batching
- 100x faster than individual inserts
- Essential for review aggregation

### Scalability Roadmap

| Products | Solution | Performance |
|----------|----------|-------------|
| <1K | Current + indexes | <100ms |
| 1K-10K | + WAL mode | <50ms |
| 10K-100K | + normalization + cache | <20ms |
| 100K+ | Consider PostgreSQL | <10ms |

---

## 8. Real-Time Notifications

### Desktop Notifications (Tauri)

**Native Support:**
```rust
app_handle.notification()
    .builder()
    .title("Price Drop Alert!")
    .body(format!("{} dropped {}%", product, discount))
    .icon("icons/price-drop.png")
    .sound("default")
    .show()
```

### Notification Scheduling

**Background Task:**
```rust
// Tokio interval - check hourly
let mut interval = interval(Duration::from_secs(3600));

loop {
    interval.tick().await;
    check_all_products_for_price_changes().await;
}
```

### Notification Types

1. **Price Drop Alerts**
   - Threshold-based (drops below X)
   - Percentage-based (drops Y%)

2. **Historical Low Alerts**
   - All-time low detected

3. **Best Deal Alerts**
   - Lowest price across platforms

4. **Stock Alerts**
   - Out-of-stock → in-stock

### Delivery Methods

**Desktop (Primary):**
- Native OS notifications
- System notification center
- Requires app running/system tray

**In-App:**
- Ant Design notification component
- Persistent until dismissed
- Action buttons (View Product)

**Email (Future):**
- SMTP integration (lettre crate)
- Configurable per user

### Notification Management

**Deduplication:**
```rust
// Cooldown period (prevent spam)
if last_notification < 1.hour.ago {
    send_notification();
}
```

**User Preferences:**
```sql
CREATE TABLE notification_preferences (
    notification_type TEXT NOT NULL,
    enabled BOOLEAN DEFAULT 1,
    threshold REAL,
    delivery_method TEXT DEFAULT 'desktop',
    quiet_hours_start TIME,
    quiet_hours_end TIME
);
```

### System Tray Integration

**Keep Running in Background:**
- System tray icon
- Right-click menu: Show/Check Now/Quit
- Background price monitoring
- No interruption to user

### Analytics

**Track Effectiveness:**
```sql
CREATE TABLE notification_log (
    product_id INTEGER,
    notification_type TEXT,
    sent_at DATETIME,
    clicked BOOLEAN DEFAULT 0,
    action_taken TEXT  -- 'viewed', 'purchased', 'dismissed'
);
```

**Click-through rates:**
- Measure which alerts drive engagement
- Optimize notification strategy

---

## Recommendations Summary

### Immediate (Phase 1)
1. ✅ Keep manual paste workflow
2. ✅ Add database indexes (10x speedup)
3. ✅ Implement basic price alerts

### Short-term (Phase 2)
1. Add URL-based fetching (user pastes URL, app fetches)
2. Implement SQLite optimization (WAL mode, cache tuning)
3. Add desktop notifications for price drops

### Medium-term (Phase 3)
1. Register for Taobao Open Platform API
2. Implement scheduled background checks (daily)
3. Add review aggregation (JD.com first)
4. Normalize database schema

### Long-term (Phase 4)
1. Full headless browser integration (Playwright)
2. Proxy rotation system
3. Advanced sentiment analysis (ML-based)
4. Email notification support

### Cost Estimates

| Phase | Monthly Cost | Risk Level |
|-------|--------------|------------|
| Phase 1 | $0 | None |
| Phase 2 | $0-10 | Low |
| Phase 3 | $20-50 | Medium |
| Phase 4 | $100-300 | Low (API-based) |

---

## Technical Risks

### High Risk
- ⚠️ Taobao anti-scraping (mitigation: use API)
- ⚠️ Legal issues with aggressive scraping (mitigation: official APIs)
- ⚠️ IP bans from excessive requests (mitigation: rate limiting + proxies)

### Medium Risk
- ⚠️ Parser breakage from UI changes (mitigation: API fallback)
- ⚠️ CAPTCHA costs escalating (mitigation: reduce scraping frequency)

### Low Risk
- Database performance at scale (mitigation: straightforward optimization)
- Notification delivery (mitigation: native Tauri support)

---

## Conclusion

The planned features are **technically feasible** with the following approach:

1. **Start simple:** Manual workflow + basic optimizations
2. **Use APIs when available:** Taobao Open Platform is essential
3. **Scrape selectively:** JD.com for non-API data only
4. **Scale gradually:** Don't over-engineer for current scale
5. **Monitor costs:** Proxy + CAPTCHA costs can add up quickly

**Next Steps:**
1. Create PRD based on this research
2. Design architecture for phased implementation
3. Start with Phase 1 features (low-risk, high-value)

---

**Research completed:** 2025-11-26
**Total research areas covered:** 8/8
**Recommended track:** BMad Method → PRD → Architecture → Implementation
