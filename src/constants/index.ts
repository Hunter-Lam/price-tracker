export const SOURCES = ["URL", "商鋪"] as const;
export const SOURCE_KEYS = ["url", "shop"] as const;

export const CATEGORIES = [
  "電器", "數碼", "家電", "家俱", "廚用", "衞浴",
  "家紡", "服飾", "書籍", "食品", "醫用",
  "藥用", "水果", "零食", "飲品", "五金", "糧油"
] as const;

export const CATEGORY_KEYS = [
  "electronics", "digital", "appliances", "furniture", "kitchen", "bathroom",
  "textiles", "apparel", "books", "food", "medical",
  "medicine", "fruits", "snacks", "beverages", "hardware", "grains"
] as const;

export const DISCOUNT_ORGANIZERS = ["政府", "平台", "店舖", "支付"] as const;
export const DISCOUNT_ORGANIZER_KEYS = ["government", "platform", "store", "payment"] as const;

export const DISCOUNT_METHODS = [
  "折扣", "滿折", "滿件折",
  "滿減", "滿件減", "每滿減", "立減",
  "首購", "限購"
] as const;
export const DISCOUNT_METHOD_KEYS = [
  "discount", "amountDiscount", "quantityDiscount",
  "thresholdReduction", "quantityReduction", "everyReduction", "instantReduction",
  "firstPurchase", "limitedPurchase"
] as const;

// All supported units (language-neutral keys)
export const UNITS = ["ml", "l", "liang", "jin", "kg", "g", "piece"] as const;

export type SourceType = typeof SOURCES[number];
export type CategoryType = typeof CATEGORIES[number];
export type DiscountOrganizerType = typeof DISCOUNT_ORGANIZERS[number];
export type DiscountMethodType = typeof DISCOUNT_METHODS[number];
export type UnitType = typeof UNITS[number];
