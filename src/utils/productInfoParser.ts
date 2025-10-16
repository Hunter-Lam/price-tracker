/**
 * Product Info Parser - Main Entry Point
 *
 * This module uses the Strategy Pattern to parse different product info formats.
 * See ./parsers/index.ts for architecture details and how to add new parsers.
 */

import { ParserManager } from './parsers';
import type { ParseResult } from './parsers';

// Create singleton instance of ParserManager
const parserManager = new ParserManager();

/**
 * Main parser function that automatically detects and parses product information
 *
 * Supported formats:
 * - JD.com product info JSON
 * - Plain text from e-commerce sites
 *
 * @param text Raw text to parse
 * @returns ParseResult with success status, data, warnings, or error
 *
 * @example
 * ```typescript
 * const result = parseProductInfo(pastedText);
 * if (result.success) {
 *   form.setFieldsValue(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function parseProductInfo(text: string): ParseResult {
  return parserManager.parse(text);
}

/**
 * Get the parser manager instance for advanced usage
 * (e.g., registering custom parsers)
 */
export function getParserManager(): ParserManager {
  return parserManager;
}

// Re-export types for convenience
export type { ParseResult, IProductInfoParser } from './parsers';
