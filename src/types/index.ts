import type { Dayjs } from 'dayjs';
import type { SourceType, CategoryType, DiscountOrganizerType, DiscountMethodType } from '../constants';

export interface Product {
  id?: number;
  address: string;
  title: string;
  brand: string;
  type: CategoryType;
  price: number;
  originalPrice?: number;
  discount?: string;
  specification?: string;
  date: string;
  remark?: string;
  created_at?: string;
}

export interface ProductInput {
  address: string;
  title: string;
  brand: string;
  type: CategoryType;
  price: number;
  originalPrice?: number;
  discount?: string;
  specification?: string;
  date: string;
  remark?: string;
}

export interface DiscountItem {
  discountOwner: DiscountOrganizerType;
  discountType: DiscountMethodType;
  discountValue: string | number;
}

export interface SourceData {
  type: SourceType;
  address: string;
}

export interface FormData {
  source: SourceData;
  title: string;
  brand: string;
  type: CategoryType;
  price: number;
  originalPrice?: number;
  discount: DiscountItem[];
  specification: string;
  date: Dayjs;
  remark: string;
}
