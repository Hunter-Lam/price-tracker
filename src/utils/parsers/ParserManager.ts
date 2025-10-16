import type { IProductInfoParser, ParseResult } from './types';
import { JDProductParser } from './JDProductParser';
import { PlainTextParser } from './PlainTextParser';

/**
 * Manages all product info parsers and selects the appropriate one
 * Uses Strategy Pattern for extensibility
 */
export class ParserManager {
  private parsers: IProductInfoParser[] = [];

  constructor() {
    // Register all available parsers
    // Order matters: parsers are tried in sequence
    this.registerParser(new JDProductParser());
    this.registerParser(new PlainTextParser());
  }

  /**
   * Register a new parser
   * @param parser Parser instance to register
   */
  registerParser(parser: IProductInfoParser): void {
    this.parsers.push(parser);
  }

  /**
   * Parse product information using the first compatible parser
   * @param text Raw text to parse
   * @returns Parse result with success/error status
   */
  parse(text: string): ParseResult {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return {
        success: false,
        error: 'Empty input'
      };
    }

    // Try each parser in sequence
    for (const parser of this.parsers) {
      if (parser.canParse(trimmedText)) {
        console.log(`Using parser: ${parser.getName()}`);
        const result = parser.parse(trimmedText);

        if (result.success) {
          return result;
        }

        // If parser failed, log and try next one
        console.warn(`${parser.getName()} failed:`, result.error);
      }
    }

    // No compatible parser found
    return {
      success: false,
      error: `Unsupported format. Supported formats:\n${this.getSupportedFormats()}`
    };
  }

  /**
   * Get list of supported format names
   */
  getSupportedFormats(): string {
    return this.parsers.map(p => `- ${p.getName()}`).join('\n');
  }

  /**
   * Get all registered parsers
   */
  getParsers(): IProductInfoParser[] {
    return [...this.parsers];
  }
}
