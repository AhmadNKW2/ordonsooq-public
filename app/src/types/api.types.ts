// ===== Common Types =====
export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type SortOrder = 'ASC' | 'DESC';
export type Status = 'active' | 'archived';

// ===== Product Types =====
export type ProductSortBy =
  | 'created_at'
  | 'name_en'
  | 'name_ar'
  | 'average_rating'
  | 'total_ratings';

export type ProductFilters = {
  page?: number;
  limit?: number;
  sortBy?: ProductSortBy;
  sortOrder?: SortOrder;
  categoryId?: number;
  vendorId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  status?: Status;
  visible?: boolean;
  search?: string;
};

export type ProductCategory = {
  id: number;
  name_en: string;
  name_ar: string;
};

export type ProductVendor = {
  id: number;
  name_en: string;
  name_ar: string;
};

export type ProductMedia = {
  id: number;
  url: string;
  is_primary: boolean;
  mediaGroup?: Record<string, unknown>;
};

export type ProductStock = {
  id?: number;
  quantity?: number;
  reserved?: number;
  available?: number;
};

export type ProductPrice = {
  id?: number;
  price?: number;
  currency?: string;
  priceGroup?: Record<string, unknown>;
};

export type ProductWeight = {
  id?: number;
  weight?: number;
  unit?: string;
  weightGroup?: Record<string, unknown>;
};

export type ProductVariant = {
  id: number;
  name_en?: string;
  name_ar?: string;
  sku?: string;
  prices?: ProductPrice[];
  stock?: ProductStock[];
  combinations?: any[];
};

export type ProductAttribute = {
  id: number;
  name_en?: string;
  name_ar?: string;
  value_en?: string;
  value_ar?: string;
  is_color?: boolean;
  controls_pricing?: boolean;
  controls_media?: boolean;
  controls_weight?: boolean;
};

export type Product = {
  id: number;
  name_en: string;
  name_ar: string;
  sku: string;
  short_description_en: string | null;
  short_description_ar: string | null;
  long_description_en: string | null;
  long_description_ar: string | null;
  status: Status;
  visible: boolean;
  average_rating: number;
  total_ratings: number;
  created_at: string;
  updated_at: string;
  category: ProductCategory | null;
  categories: ProductCategory[];
  vendor: ProductVendor | null;
  primary_image: string | { url: string } | null;
  stock: ProductStock | { total_quantity: number; in_stock: boolean } | null;
  prices?: ProductPrice[];
  price?: string;
  sale_price?: string | null;
};

export type ProductDetail = Product & {
  media: ProductMedia[];
  weights: ProductWeight[];
  variants: ProductVariant[];
  attributes: {
    id: number;
    product_id: number;
    attribute_id: number;
    attribute: ProductAttribute;
    controls_pricing: boolean;
    controls_media: boolean;
    controls_weight: boolean;
  }[];
  brand?: {
    id: number;
    name_en: string;
    name_ar: string;
    logo?: string;
    status: Status;
  };
  stock: Array<{
    id: number;
    product_id: number;
    variant_id: number | null;
    quantity: number;
    reserved_quantity: number;
    low_stock_threshold: number;
  }>;
};

// ===== Category Types =====
export type CategorySortBy =
  | 'createdAt'
  | 'name_en'
  | 'name_ar'
  | 'level'
  | 'sortOrder';

export type CategoryFilters = {
  page?: number;
  limit?: number;
  sortBy?: CategorySortBy;
  sortOrder?: SortOrder;
  status?: Status;
  visible?: boolean;
  parent_id?: number | null;
  level?: number;
  search?: string;
};

export type CategoryChild = {
  id: number;
  name_en: string;
  name_ar: string;
  level?: number;
  sortOrder?: number;
};

export type CategoryProduct = {
  id: number;
  name_en: string;
  name_ar: string;
  sku: string;
};

export type Category = {
  id: number;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  image: string | null;
  level: number;
  sortOrder: number;
  status: Status;
  visible: boolean;
  parent_id: number | null;
  createdAt: string;
  updatedAt: string;
  parent: CategoryChild | null;
  children: CategoryChild[];
};

export type CategoryDetail = Category & {
  products: CategoryProduct[];
};

// ===== Vendor Types =====
export type VendorSortBy =
  | 'created_at'
  | 'name_en'
  | 'name_ar'
  | 'sort_order';

export type VendorFilters = {
  page?: number;
  limit?: number;
  sortBy?: VendorSortBy;
  sortOrder?: SortOrder;
  status?: Status;
  visible?: boolean;
  search?: string;
};

export type Vendor = {
  id: number;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  logo: string | null;
  status: Status;
  visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// ===== Banner Types =====
export type BannerSortBy =
  | 'created_at'
  | 'title_en'
  | 'title_ar'
  | 'sort_order';

export type BannerStatus = 'active' | 'inactive';

export type BannerFilters = {
  page?: number;
  limit?: number;
  sortBy?: BannerSortBy;
  sortOrder?: SortOrder;
  status?: BannerStatus;
  visible?: boolean;
  search?: string;
};

export type Banner = {
  id: number;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  image: string;
  link: string | null;
  status: BannerStatus;
  visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// ===== Home API Types =====
export type HomeCategory = {
  id: number;
  name_en: string;
  name_ar: string;
  image: string | null;
  level: number;
  sortOrder: number;
};

export type HomeVendor = {
  id: number;
  name_en: string;
  name_ar: string;
  logo: string | null;
  sort_order: number;
};

export type HomeBanner = {
  id: number;
  title_en?: string;
  title_ar?: string;
  description_en?: string | null;
  description_ar?: string | null;
  image: string;
  link: string | null;
  language: 'en' | 'ar';
  sort_order: number;
};

export type HomeBrand = {
  id: number;
  name_en: string;
  name_ar: string;
  logo: string | null;
  sort_order: number;
};

export type HomeData = {
  categories: HomeCategory[];
  vendors: HomeVendor[];
  banners: HomeBanner[];
  brands: HomeBrand[];
};
