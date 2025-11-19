export const SOURCES = ["URL", "商鋪"] as const;
export const SOURCE_KEYS = ["url", "shop"] as const;

export const CATEGORIES = [
  "食品", "零食", "飲品", "糧油",
  "藥用", "醫用", "數碼", "服飾",
  "衞浴", "廚用",
  "家紡", "電器", "家電", "家俱", "書籍", "五金", "水果"
] as const;

export const CATEGORY_KEYS = [
  "food", "snacks", "beverages", "grains",
  "medicine", "medical", "digital", "apparel",
  "bathroom", "kitchen",
  "textiles", "electronics", "appliances", "furniture", "books", "hardware", "fruits"
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
