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
  brandId?: number;
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
  url?: string;
  image?: {
    id: number;
    url: string;
    type?: string;
    alt_text?: string | null;
  };
  attributes?: any[];
  is_primary?: boolean;
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
  price?: number | string;
  sale_price?: number | string | null;
  attributes?: any[];
  currency?: string;
  priceGroup?: Record<string, unknown>;
};

export type ProductWeight = {
  id?: number;
  weight?: number;
  unit?: string;
  weightGroup?: Record<string, unknown>;
};



export type ProductAttributeValue = {
  name_en: string;
  name_ar: string;
  color_code: string | null;
};

export type ProductAttributeGroup = {
  name_en: string;
  name_ar: string;
  values: Record<string, ProductAttributeValue>;
};

export type ProductMediaItem = {
  id: number;
  url: string;
  type: string;
  alt_text: string | null;
  is_primary: boolean;
  is_group_primary: boolean;
};

export type ProductMediaGroup = {
  media: ProductMediaItem[];
};

export type ProductPriceGroup = {
  price: string;
  sale_price: string | null;
};

export type ProductWeightGroup = {
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
};

export type ProductVariant = {
  id: number;
  is_active: boolean;
  quantity: number;
  attribute_values: Record<string, number>;
  price_group_id: string;
  media_group_id: string;
  weight_group_id: string;
};

export type Product = {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  sku: string;
  short_description_en: string | null;
  short_description_ar: string | null;
  long_description_en: string | null;
  long_description_ar: string | null;
  status: Status;
  visible: boolean;
  average_rating: string;
  total_ratings: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  vendor: Vendor;
  brand: Brand | null;
  categories: Category[];
  
  // New Complex Structures
  attributes: Record<string, ProductAttributeGroup>;
  media_groups: Record<string, ProductMediaGroup>;
  price_groups: Record<string, ProductPriceGroup>;
  weight_groups: Record<string, ProductWeightGroup>;
  
  quantity?: number;
  
  variants: ProductVariant[];
};


export type ProductDetail = Product;

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
  slug: string;
  level?: number;
  sortOrder?: number;
  image: string | null;
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
  slug: string;
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
  parent?: CategoryChild | null;
  children?: CategoryChild[];
};

export type CategoryDetail = Category & {
  products: Product[];
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
  slug: string;
  description_en: string | null;
  description_ar: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo: string | null;
  status: Status;
  visible: boolean;
  rating: string | number;
  rating_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// ===== Brand Types =====
export type BrandSortBy =
  | 'created_at'
  | 'name_en'
  | 'name_ar'
  | 'sort_order';

export type BrandFilters = {
  page?: number;
  limit?: number;
  sortBy?: BrandSortBy;
  sortOrder?: SortOrder;
  status?: Status;
  visible?: boolean;
  search?: string;
};

export type Brand = {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  description_en: string | null;
  description_ar: string | null;
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
  slug: string;
  description_en?: string;
  description_ar?: string;
  image: string | null;
  level: number;
  sortOrder: number;
  parent_id?: number | null;
  children?: HomeCategory[];
};

export type HomeVendor = {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
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
  slug: string;
  logo: string | null;
  sort_order: number;
};

export type HomeData = {
  categories: HomeCategory[];
  vendors: HomeVendor[];
  banners: HomeBanner[];
  brands: HomeBrand[];
};
