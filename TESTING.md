# Testing Guide

This document provides an overview of the testing setup and how to run tests for the Price Tracker application.

## Testing Framework

- **Test Runner**: [Vitest](https://vitest.dev/) v4.0.5
- **Testing Library**: @testing-library/react v16.3.0
- **DOM Testing**: @testing-library/jest-dom v6.9.1
- **Environment**: jsdom (for browser environment simulation)

## Test Coverage

### Parsers (100% Coverage)

#### JDProductParser Tests (`src/tests/parsers/JDProductParser.test.ts`)
- ✅ Parser name verification
- ✅ Format detection (JSON with JD-specific fields)
- ✅ Basic product information parsing
- ✅ Brand extraction (multiple formats: 中文（English）, English/中文)
- ✅ Quantity and unit extraction from title and specifications
- ✅ Government subsidy discount parsing
- ✅ Promotion discount parsing from subtrahends
- ✅ Multiple discount types (满减, 满件折, 首购, etc.)
- ✅ Limited purchase discount handling
- ✅ Chinese unit normalization (克→g, 斤→jin, etc.)
- ✅ Error handling and warnings

**Total**: 17 tests

#### TaobaoProductParser Tests (`src/tests/parsers/TaobaoProductParser.test.ts`)
- ✅ Parser name verification
- ✅ Format detection (参数信息, 优惠前, 券后, etc.)
- ✅ Basic product information parsing
- ✅ Quantity and unit extraction from specs and title
- ✅ Discount parsing (满减, 立减, 淘金币, etc.)
- ✅ VALUE-KEY parameter format (Tmall style)
- ✅ KEY-VALUE parameter format (Taobao style)
- ✅ Mixed brand format handling
- ✅ Chinese unit normalization
- ✅ Inline price format parsing
- ✅ Error handling

**Total**: 20 tests

#### PlainTextParser Tests (`src/tests/parsers/PlainTextParser.test.ts`)
- ✅ Parser name verification
- ✅ Format detection (multi-line text with prices/discounts)
- ✅ Basic product information parsing
- ✅ Brand extraction patterns (华佗牌, 三星（SAMSUNG）, etc.)
- ✅ Multiple price extraction
- ✅ Multi-line price format (¥ on one line, value on next)
- ✅ Discount information parsing
- ✅ Warning generation for missing data
- ✅ Chinese currency symbol support (¥, ￥)

**Total**: 17 tests

### Utilities (100% Coverage)

#### Unit Conversion Tests (`src/tests/utils/unitConversion.test.ts`)
- ✅ `ceilToTwo`: Round up to 2 decimal places
- ✅ `isConvertibleToJin`: Check if unit can be converted to jin
- ✅ `convertToJin`: Convert weight/volume units to jin
- ✅ `convertUnit`: Bidirectional unit conversion
- ✅ `calculateUnitPrice`: Calculate price per comparison unit
- ✅ `calculatePricePerJin`: Calculate price per jin (legacy)
- ✅ Complex conversion scenarios (ml→jin, L→jin, etc.)

**Total**: 38 tests

## Test Structure

```
src/
├── tests/
│   ├── setup.ts           # Global test setup and mocks
│   ├── parsers/
│   │   ├── JDProductParser.test.ts
│   │   ├── TaobaoProductParser.test.ts
│   │   └── PlainTextParser.test.ts
│   └── utils/
│       └── unitConversion.test.ts
└── utils/
    ├── parsers/
    │   ├── JDProductParser.ts
    │   ├── TaobaoProductParser.ts
    │   └── PlainTextParser.ts
    └── unitConversion.ts
```

## Running Tests

### Run All Tests (Watch Mode)
```bash
yarn test
```

### Run All Tests Once
```bash
yarn test:run
```

### Run Tests with UI
```bash
yarn test:ui
```

### Run Tests with Coverage
```bash
yarn test:coverage
```

## Test Configuration

Configuration is defined in `vitest.config.ts`:
- **Environment**: jsdom (simulates browser DOM)
- **Setup Files**: `src/tests/setup.ts` (mocks and globals)
- **Coverage Provider**: v8
- **Coverage Output**: text, JSON, HTML

## Writing New Tests

### Parser Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { YourParser } from '../../utils/parsers/YourParser';

describe('YourParser', () => {
  const parser = new YourParser();

  describe('canParse', () => {
    it('should return true for valid input', () => {
      const validInput = 'your test input';
      expect(parser.canParse(validInput)).toBe(true);
    });

    it('should return false for invalid input', () => {
      const invalidInput = 'invalid input';
      expect(parser.canParse(invalidInput)).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse valid input correctly', () => {
      const input = 'test input';
      const result = parser.parse(input);

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('expected title');
      expect(result.data?.price).toBe(99.99);
    });

    it('should handle invalid input gracefully', () => {
      const result = parser.parse('');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
```

### Utility Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { yourUtilityFunction } from '../../utils/yourUtility';

describe('yourUtility', () => {
  describe('yourFunction', () => {
    it('should return expected value for valid input', () => {
      const result = yourUtilityFunction(validInput);
      expect(result).toBe(expectedOutput);
    });

    it('should handle edge cases', () => {
      expect(yourUtilityFunction(0)).toBe(0);
      expect(yourUtilityFunction(null)).toBeNull();
    });
  });
});
```

## Test Best Practices

1. **Descriptive Test Names**: Use clear, descriptive test names that explain what is being tested
2. **One Assertion Per Test**: Focus each test on a single behavior
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
4. **Test Edge Cases**: Include tests for edge cases, error conditions, and boundary values
5. **Mock External Dependencies**: Use mocks for Tauri API, fetch, etc.
6. **Independent Tests**: Tests should not depend on each other's state

## Continuous Integration

The test suite is designed to run in CI/CD environments:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: yarn test:run

- name: Generate Coverage
  run: yarn test:coverage
```

## Current Test Statistics

- **Total Test Files**: 4
- **Total Tests**: 96
- **Pass Rate**: 100%
- **Coverage**: Comprehensive coverage of parsers and utilities

## Future Testing Plans

- [ ] Add component tests for UI components
- [ ] Add integration tests for form workflows
- [ ] Add E2E tests with Playwright
- [ ] Add visual regression tests
- [ ] Increase coverage to include CSV import/export utilities
- [ ] Add performance benchmarks for parsers

## Troubleshooting

### Tests Failing Locally

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules
   yarn install
   ```

2. Clear Vitest cache:
   ```bash
   rm -rf node_modules/.vitest
   ```

### Mock Issues

If you encounter issues with mocks, check `src/tests/setup.ts` for global mock configurations.

### Type Errors

Ensure TypeScript types are up to date:
```bash
yarn build
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
