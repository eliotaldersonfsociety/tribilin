// types/product.ts
export interface Product {
  id: number;
  title: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  vendor?: string;
  productType?: string;
  status?: boolean;
  category?: string;
  tags?: string;
  sku?: string;
  barcode?: string;
  quantity?: number;
  trackInventory?: boolean;
  images: string[];
  sizes?: string[];
  sizeRange?: { min: number; max: number };
  colors?: string[];
}
