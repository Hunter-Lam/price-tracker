/**
 * JD Product Specification Parser
 * Parses product specifications from JD.com product pages
 */

export interface JDSpecification {
  [key: string]: string;
}

/**
 * Parse JD product specifications from HTML content
 * @param html - The HTML content of the JD product page
 * @returns Parsed specifications as key-value pairs
 */
export function parseJDSpecification(html: string): JDSpecification {
  const specs: JDSpecification = {};

  // Pattern: <div class="item">...<div class="name">KEY</div>...<div class="text">VALUE</div>...
  const itemRegex = /<div class="item">[\s\S]*?<div class="name">([^<]+)<\/div>[\s\S]*?<div class="text">\s*([^<]+?)\s*<\/div>/g;

  let match;
  while ((match = itemRegex.exec(html)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();

    // Skip brand and product ID as they're extracted separately
    if (key && value && key !== '品牌' && key !== '商品编号') {
      specs[key] = value;
    }
  }

  // Parse package contents (exclusive-row item)
  const packageRegex = /<div class="exclusive-row item">[\s\S]*?<div class="name">包装清单<\/div>[\s\S]*?<div class="text">\s*([^<]+?)\s*<\/div>/;
  const packageMatch = html.match(packageRegex);
  if (packageMatch) {
    specs['包装清单'] = packageMatch[1].trim();
  }

  return specs;
}

/**
 * Extract product title from JD HTML
 * @param html - The HTML content of the JD product page
 * @returns Product title without JD suffix, or null if not found
 */
export function extractProductTitle(html: string): string | null {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) {
    return titleMatch[1].replace(/【行情 报价 价格 评测】-京东$/, '').trim();
  }
  return null;
}

/**
 * Extract brand from JD HTML
 * @param html - The HTML content of the JD product page
 * @returns Brand name or null if not found
 */
export function extractBrand(html: string): string | null {
  const brandRegex = /<div class="item">[\s\S]*?<div class="name">品牌<\/div>[\s\S]*?<a[^>]*>([^<]+)<\/a>/;
  const match = html.match(brandRegex);
  return match ? match[1].trim() : null;
}

/**
 * Extract product ID from JD HTML
 * @param html - The HTML content of the JD product page
 * @returns Product ID or null if not found
 */
export function extractProductId(html: string): string | null {
  const idRegex = /<div class="item">[\s\S]*?<div class="name">商品编号<\/div>[\s\S]*?<div class="text">\s*(\d+)\s*<\/div>/;
  const match = html.match(idRegex);
  return match ? match[1].trim() : null;
}

/**
 * Complete product information extracted from JD HTML
 */
export interface JDProductInfo {
  title: string | null;
  brand: string | null;
  productId: string | null;
  specifications: JDSpecification;
}

/**
 * Parse complete product information from JD HTML
 * @param html - The HTML content of the JD product page
 * @returns Complete product information including title, brand, ID, and specifications
 */
export function parseJDProductInfo(html: string): JDProductInfo {
  return {
    title: extractProductTitle(html),
    brand: extractBrand(html),
    productId: extractProductId(html),
    specifications: parseJDSpecification(html),
  };
}
