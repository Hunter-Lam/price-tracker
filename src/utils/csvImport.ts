import { ProductInput } from '../types';
import { CATEGORIES, CATEGORY_KEYS } from '../constants';
import dayjs from 'dayjs';

export interface CSVImportResult {
  success: ProductInput[];
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
}

export interface CSVImportOptions {
  skipHeader?: boolean;
  delimiter?: string;
  expectedColumns?: Array<{ key: string; header: string; required?: boolean }>;
  t?: (key: string, options?: any) => string;
}

// Define column structure matching export functionality exactly
export const getImportColumns = (t?: (key: string) => string) => [
  { key: 'id', header: t ? t('table.id') : 'ID', required: false },
  { key: 'title', header: t ? t('table.title') : '產品標題', required: true },
  { key: 'brand', header: t ? t('table.brand') : '品牌', required: true },
  { key: 'type', header: t ? t('table.type') : '類型', required: true },
  { key: 'price', header: t ? t('table.price') : '價格', required: true },
  { key: 'specification', header: t ? t('table.specification') : '規格', required: false },
  { key: 'date', header: t ? t('table.date') : '日期', required: false },
  { key: 'remark', header: t ? t('table.remark') : '備註', required: false },
  { key: 'created_at', header: t ? t('table.createdAt') : '創建時間', required: false },
  { key: 'address', header: t ? t('table.url') : '地址', required: false }
] as const;

// Keep the static version for backward compatibility
export const IMPORT_COLUMNS = getImportColumns();

const parseCSVLine = (line: string, delimiter: string = ','): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === delimiter && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  result.push(current.trim());
  return result;
};

const validateAndParseProduct = (row: string[], rowIndex: number, columnMap: Array<{ key: string; header: string; required?: boolean }>, t?: (key: string, options?: any) => string): ProductInput | { error: string } => {
  try {
    // Check minimum required columns (at least 5 columns for ID, title, brand, type, price)
    if (row.length < 5) {
      const errorMsg = t
        ? t('csvImport.validationErrors.insufficientColumns', { row: rowIndex })
        : `Row ${rowIndex}: Insufficient columns (minimum 5 required: ID, Title, Brand, Type, Price)`;
      return { error: errorMsg };
    }

    const values: Record<string, string> = {};

    // Map row values to column keys
    columnMap.forEach((col, index) => {
      values[col.key] = row[index]?.trim() || '';
    });

    // Validate required fields
    const requiredColumns = columnMap.filter(col => col.required);
    for (const col of requiredColumns) {
      if (!values[col.key]) {
        const errorMsg = t
          ? t('csvImport.validationErrors.fieldRequired', { row: rowIndex, field: col.header })
          : `Row ${rowIndex}: ${col.header} is required`;
        return { error: errorMsg };
      }
    }

    // Validate and map type - accept both English and Chinese category names
    let type = values.type;
    const typeIndex = CATEGORY_KEYS.findIndex(key => key.toLowerCase() === type.toLowerCase());
    if (typeIndex !== -1) {
      // Map English category key to Chinese category
      type = CATEGORIES[typeIndex];
    } else if (!CATEGORIES.includes(type as any)) {
      const validTypes = `${CATEGORIES.join(', ')} or ${CATEGORY_KEYS.join(', ')}`;
      const errorMsg = t
        ? t('csvImport.validationErrors.invalidType', { row: rowIndex, type, validTypes })
        : `Row ${rowIndex}: Invalid type "${type}". Must be one of: ${validTypes}`;
      return { error: errorMsg };
    }

    // Parse and validate price
    const price = parseFloat(values.price);
    if (isNaN(price) || price < 0) {
      const errorMsg = t
        ? t('csvImport.validationErrors.invalidPrice', { row: rowIndex, price: values.price })
        : `Row ${rowIndex}: Invalid price "${values.price}" (must be a positive number)`;
      return { error: errorMsg };
    }

    // Clean address (make validation lenient)
    if (values.address) {
      let cleanAddress = values.address.trim();
      // Only auto-add https if it looks like a domain (contains dots)
      if (cleanAddress && !cleanAddress.startsWith('http://') && !cleanAddress.startsWith('https://') && cleanAddress.includes('.')) {
        cleanAddress = 'https://' + cleanAddress;
      }
      values.address = cleanAddress;
    }

    // Parse and validate date
    let date = dayjs().format('YYYY-MM-DD');
    if (values.date) {
      const parsedDate = dayjs(values.date);
      if (!parsedDate.isValid()) {
        const errorMsg = t
          ? t('csvImport.validationErrors.invalidDate', { row: rowIndex, date: values.date })
          : `Row ${rowIndex}: Invalid date format "${values.date}" (expected YYYY-MM-DD)`;
        return { error: errorMsg };
      }
      date = parsedDate.format('YYYY-MM-DD');
    }

    const product: ProductInput = {
      address: values.address || '',
      title: values.title,
      brand: values.brand,
      type: type as any, // type is validated above
      price,
      specification: values.specification || undefined,
      date,
      remark: values.remark || undefined,
    };

    return product;
  } catch (error) {
    const errorMsg = t
      ? t('csvImport.validationErrors.parsingError', { row: rowIndex, error: error instanceof Error ? error.message : 'Unknown error' })
      : `Row ${rowIndex}: Parsing error - ${error instanceof Error ? error.message : 'Unknown error'}`;
    return { error: errorMsg };
  }
};

export const parseCSV = (csvContent: string, options: CSVImportOptions = {}): CSVImportResult => {
  const { skipHeader = true, delimiter = ',', expectedColumns = [...IMPORT_COLUMNS], t } = options;

  const lines = csvContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    const errorMsg = t ? t('csvImport.validationErrors.emptyFile') : 'CSV file is empty';
    return {
      success: [],
      errors: [{ row: 0, error: errorMsg }]
    };
  }

  let columnMap = expectedColumns;

  // If we have a header, could validate it in the future
  // For now, we assume the column order matches IMPORT_COLUMNS

  const dataLines = skipHeader ? lines.slice(1) : lines;
  const result: CSVImportResult = {
    success: [],
    errors: []
  };

  dataLines.forEach((line, index) => {
    const rowIndex = skipHeader ? index + 2 : index + 1; // Adjust for header and 1-based indexing

    try {
      const fields = parseCSVLine(line, delimiter);
      const parsed = validateAndParseProduct(fields, rowIndex, columnMap, t);

      if ('error' in parsed) {
        result.errors.push({
          row: rowIndex,
          error: parsed.error,
          data: fields
        });
      } else {
        result.success.push(parsed);
      }
    } catch (error) {
      const errorMsg = t
        ? t('csvImport.validationErrors.lineParseError', { error: error instanceof Error ? error.message : 'Unknown error' })
        : `Failed to parse line: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push({
        row: rowIndex,
        error: errorMsg,
        data: line
      });
    }
  });

  return result;
};

export const importCSVFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        resolve(content);
      } catch (error) {
        reject(new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    // Read as text with UTF-8 encoding
    reader.readAsText(file, 'UTF-8');
  });
};

// Helper function to generate a sample CSV template
export const generateCSVTemplate = (t?: (key: string) => string): string => {
  // Use the same column generation as import to ensure consistency
  const importColumns = getImportColumns(t);
  const headers = importColumns.map(col => col.header);

  const sampleRow = [
    '', // ID 會自動生成
    t ? t('csvImport.sampleProduct') : '示例產品',
    t ? t('csvImport.sampleBrand') : '示例品牌',
    t ? t('constants.categories.electronics') : '電器', // 使用翻譯的類型
    '99.99',
    t ? t('csvImport.sampleSpecification') : '示例規格說明',
    dayjs().format('YYYY-MM-DD'),
    t ? t('csvImport.sampleRemark') : '示例備註',
    '', // 創建時間會自動生成
    'https://example.com/product'
  ];

  // Add BOM for proper UTF-8 encoding
  const csvContent = [headers, sampleRow]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
};