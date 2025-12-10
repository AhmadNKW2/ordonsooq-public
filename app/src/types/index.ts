// Product Types
export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description: string;
  descriptionAr?: string;
  longDescription?: string;
  descriptionImages?: string[];
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: Category;
  subcategory?: Category;
  brand?: Brand;
  vendor?: Vendor;
  otherSellers?: OtherSeller[];
  tags: string[];
  variants?: ProductVariant[];
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  rating: number;
  reviewCount: number;
}

export interface OtherSeller {
  id: string;
  name: string;
  price: number;
  rating: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  attributes: Record<string, string>;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
}

// Brand Types
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

// Cart Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variant?: ProductVariant;
  selectedAttributes?: Record<string, string>;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  user: User;
  items: OrderItem[];
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  variant?: ProductVariant;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// Review Types
export interface Review {
  id: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  product: Pick<Product, 'id' | 'name'>;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  isVerified: boolean;
  helpful: number;
  createdAt: string;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

// Search & Filter Types
export interface ProductFilters {
  categories?: string[];
  brands?: string[];
  priceRange?: { min: number; max: number };
  rating?: number;
  inStock?: boolean;
  tags?: string[];
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating';
}

export interface SearchResult {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Banner Types
export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link: string;
  buttonText?: string;
  isActive: boolean;
  order: number;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Re-export API types that are also used in frontend
export type { HomeData, HomeCategory, HomeVendor, HomeBanner } from './api.types';
