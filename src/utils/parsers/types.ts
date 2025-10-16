import type { FormData } from '../../types';

/**
 * Result returned by all parsers
 */
export interface ParseResult {
  success: boolean;
  data?: Partial<FormData>;
  warnings?: string[];
  error?: string;
}

/**
 * Base interface for all product info parsers
 */
export interface IProductInfoParser {
  /**
   * Check if this parser can handle the given text
   */
  canParse(text: string): boolean;

  /**
   * Parse the product information from text
   */
  parse(text: string): ParseResult;

  /**
   * Get parser name for logging/debugging
   */
  getName(): string;
}
