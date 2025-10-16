/**
 * Product Info Parsers
 *
 * This module uses the Strategy Pattern to support multiple product info formats.
 *
 * ## Architecture
 *
 * - `IProductInfoParser`: Interface that all parsers must implement
 * - `ParserManager`: Manages parser selection and execution
 * - Individual parsers: `JDProductParser`, `PlainTextParser`, etc.
 *
 * ## Adding a New Parser
 *
 * 1. Create a new class implementing `IProductInfoParser`
 * 2. Implement `canParse()`, `parse()`, and `getName()` methods
 * 3. Register the parser in `ParserManager` constructor
 *
 * Example:
 * ```typescript
 * export class TaobaoParser implements IProductInfoParser {
 *   getName() { return 'Taobao Parser'; }
 *   canParse(text: string) { return text.includes('taobao'); }
 *   parse(text: string) { / * parsing logic * / }
 * }
 * ```
 */

export { ParserManager } from './ParserManager';
export { JDProductParser } from './JDProductParser';
export { PlainTextParser } from './PlainTextParser';
export type { IProductInfoParser, ParseResult } from './types';
