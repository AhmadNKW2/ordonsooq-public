// Product Types
export interface ProductDimensions {
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
}

export interface ProductAttributeValue {
  value: string;
  meta?: string;
  image?: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  values: ProductAttributeValue[];
  isColor: boolean;
  controlsPricing: boolean;
  controlsMedia: boolean;
  controlsWeight: boolean;
}

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
  /** Variant IDs from API list responses (e.g. variants_ids). */
  variantIds?: string[];
  /** Convenience flag to indicate product requires option selection. */
  hasVariants?: boolean;
  /** If set, this card represents a specific variant ID (used for deep-linking). */
  defaultVariantId?: string;
  attributes?: ProductAttribute[];
  dimensions?: ProductDimensions;
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
  description?: string;
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
  compareAtPrice?: number;
  stock: number;
  sku: string;
  attributes: Record<string, string>;
  image?: string;
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

// Order Types
export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  country: string;
}

export interface ApiOrderItem {
  id?: string | number;
  productId: string | number;
  variantId?: string | number;
  quantity: number;
  price?: number;
  product?: Product;
}

export interface ApiOrder {
  id: string | number;
  items: ApiOrderItem[];
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  items: {
    productId: string | number;
    quantity: number;
    variantId?: string | number;
  }[];
  paymentMethod: string;
  shippingAddress: ShippingAddress;
}

export interface OrderResponse {
  data: ApiOrder[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Wallet Types
export interface Wallet {
  id: string | number;
  balance: number;
  currency: string;
  userId: string | number;
}

export interface WalletTransaction {
  id: string | number;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  createdAt: string;
  referenceId?: string;
}

export interface AddFundsPayload {
  amount: number;
  description: string;
}

export interface TransactionFilterPayload {
  type?: 'credit' | 'debit';
  from_date?: string;
  to_date?: string;
}

export interface WalletResponse {
  data: Wallet;
}

export interface TransactionsResponse {
  data: WalletTransaction[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Cart Types
export interface CartVariantAttribute {
  attribute_name_en: string;
  value_en: string;
  color_code?: string;
}

export interface CartVariant {
  id: number;
  sku: string;
  price: number;
  sale_price?: number;
  attributes: CartVariantAttribute[];
  compareAtPrice?: number;
  stock?: number;
}

export interface CartProduct {
  id: number;
  name_en: string;
  price: number;
  sale_price?: number;
  image: string;
  compareAtPrice?: number;
  slug?: string;
  stock?: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  product: CartProduct;
  variant: CartVariant | null;
}

export interface Cart {
  id: number;
  user_id: number;
  total_amount: number;
  items: CartItem[];
}

// Wishlist Types
export interface WishlistProduct {
  id: number;
  name_en: string;
  name_ar: string;
  price: number;
  image: string;
  vendor?: any;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  created_at: string;
  product: WishlistProduct;
}

export interface WishlistResponse {
  data: WishlistItem[];
  total: number;
}

export interface WishlistUpdateResponse {
  message: string;
  items: {
    data: WishlistItem[];
    total: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'vendor'; // Added from Postman
  phone?: string;
  avatar?: string;
  addresses?: Address[];
  createdAt?: string;
}

export interface AuthResponse {
  data: {
    user: User;
    access_token: string;
  };
  token?: string; // Sometimes APIs return token at root
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  company?: string;
  address1: string;
  address2?: string;
  buildingNumber?: string;
  floorNumber?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  phone: string;
  isDefault: boolean;
  notes?: string;
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
