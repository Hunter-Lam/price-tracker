import type { Product, ProductInput } from "../types";

const PRODUCTS_STORAGE_KEY = 'price-tracker-products';

// Check if we're in Tauri environment
const isTauriEnvironment = () => {
  const hasWindow = typeof window !== 'undefined';

  if (!hasWindow) {
    console.log("No window object - server-side or worker environment");
    return false;
  }

  // Use the official Tauri detection method
  const isTauri = !!(window as any).isTauri;

  if (isTauri) {
    console.log("✅ Tauri environment - using database storage");
  } else {
    console.log("🌐 Browser environment - using localStorage");
  }

  return isTauri;
};

// Generate a simple ID for browser storage
const generateId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

// Browser storage implementation
const browserStorage = {
  async getProducts(): Promise<Product[]> {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load products from localStorage:', error);
      return [];
    }
  },

  async saveProduct(product: ProductInput): Promise<Product> {
    try {
      const products = await this.getProducts();
      const newProduct: Product = {
        ...product,
        id: generateId(),
        created_at: new Date().toISOString()
      };

      const updatedProducts = [newProduct, ...products];
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));

      return newProduct;
    } catch (error) {
      console.error('Failed to save product to localStorage:', error);
      throw new Error('Failed to save product');
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      const products = await this.getProducts();
      const updatedProducts = products.filter(p => p.id !== id);
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('Failed to delete product from localStorage:', error);
      throw new Error('Failed to delete product');
    }
  },

  async importProducts(products: ProductInput[]): Promise<Product[]> {
    try {
      const existingProducts = await this.getProducts();
      const newProducts: Product[] = products.map(product => ({
        ...product,
        id: generateId(),
        created_at: new Date().toISOString()
      }));

      const updatedProducts = [...newProducts, ...existingProducts];
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));

      return newProducts;
    } catch (error) {
      console.error('Failed to import products to localStorage:', error);
      throw new Error('Failed to import products');
    }
  }
};

// Tauri storage implementation
const tauriStorage = {
  async getProducts(): Promise<Product[]> {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const result = await invoke<Product[]>("get_products");
      return result;
    } catch (error) {
      console.error("Tauri getProducts error:", error);
      throw new Error(`Failed to load products from database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async saveProduct(product: ProductInput): Promise<Product> {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const result = await invoke<Product>("save_product", { product });
      return result;
    } catch (error) {
      console.error("Tauri saveProduct error:", error);
      throw new Error(`Failed to save product to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("delete_product", { id });
    } catch (error) {
      console.error("Tauri deleteProduct error:", error);
      throw new Error(`Failed to delete product from database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async importProducts(products: ProductInput[]): Promise<Product[]> {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      // Import products one by one in Tauri
      const savedProducts: Product[] = [];
      for (const product of products) {
        try {
          const savedProduct = await invoke<Product>("save_product", { product });
          savedProducts.push(savedProduct);
        } catch (error) {
          console.error(`Failed to save product: ${product.title}`, error);
          // Continue with other products but log the error
        }
      }
      return savedProducts;
    } catch (error) {
      console.error("Tauri importProducts error:", error);
      throw new Error(`Failed to import products to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// Main storage interface
export const storage = {
  async getProducts(): Promise<Product[]> {
    try {
      if (isTauriEnvironment()) {
        return await tauriStorage.getProducts();
      } else {
        return await browserStorage.getProducts();
      }
    } catch (error) {
      console.error("Storage getProducts error:", error);
      throw error;
    }
  },

  async saveProduct(product: ProductInput): Promise<Product> {
    try {
      if (isTauriEnvironment()) {
        console.log("💾 Saving to database:", product.title);
        return await tauriStorage.saveProduct(product);
      } else {
        console.log("💾 Saving to localStorage:", product.title);
        return await browserStorage.saveProduct(product);
      }
    } catch (error) {
      console.error("Storage saveProduct error:", error);
      throw error;
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      if (isTauriEnvironment()) {
        console.log("🗑️ Deleting from database:", id);
        await tauriStorage.deleteProduct(id);
      } else {
        console.log("🗑️ Deleting from localStorage:", id);
        await browserStorage.deleteProduct(id);
      }
    } catch (error) {
      console.error("Storage deleteProduct error:", error);
      throw error;
    }
  },

  async importProducts(products: ProductInput[]): Promise<Product[]> {
    try {
      if (isTauriEnvironment()) {
        console.log("📥 Importing to database:", products.length, "products");
        return await tauriStorage.importProducts(products);
      } else {
        console.log("📥 Importing to localStorage:", products.length, "products");
        return await browserStorage.importProducts(products);
      }
    } catch (error) {
      console.error("Storage importProducts error:", error);
      throw error;
    }
  },

  isTauriEnvironment,

  // Diagnostic function for testing Tauri connectivity
  async testTauriConnection(): Promise<boolean> {
    if (!isTauriEnvironment()) {
      console.log("Not in Tauri environment");
      return false;
    }

    try {
      const { invoke } = await import("@tauri-apps/api/core");
      // Test with a simple greet command first
      const greeting = await invoke<string>("greet", { name: "Test" });
      console.log("Tauri greet test:", greeting);

      // Then test database path
      const dbPath = await invoke<string>("get_database_path");
      console.log("Database path:", dbPath);

      return true;
    } catch (error) {
      console.error("Tauri connection test failed:", error);
      return false;
    }
  }
};

export default storage;