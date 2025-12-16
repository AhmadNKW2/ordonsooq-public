// Site Configuration
export const SITE_CONFIG = {
  name: "ordonsooq",
  description: "Your premier destination for online shopping - Quality products, great prices, fast delivery",
  url: "https://ordonsooq.com",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://twitter.com/ordonsooq",
    facebook: "https://facebook.com/ordonsooq",
    instagram: "https://instagram.com/ordonsooq",
  },
  contact: {
    email: "support@ordonsooq.com",
    phone: "+1 (555) 123-4567",
    address: "123 Commerce Street, Shopping City, SC 12345",
  },
};

// Navigation Links
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Deals", href: "/deals" },
  { label: "New Arrivals", href: "/products?filter=new" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Footer Links
export const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "New Arrivals", href: "/products?filter=new" },
    { label: "Best Sellers", href: "/products?filter=bestsellers" },
    { label: "Sale", href: "/deals" },
    { label: "Gift Cards", href: "/gift-cards" },
  ],
  support: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "/faq" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns & Exchanges", href: "/returns" },
    { label: "Track Order", href: "/track-order" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
    { label: "Affiliate Program", href: "/affiliates" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Accessibility", href: "/accessibility" },
  ],
};

// Product Sort Options
export const SORT_OPTIONS = [
  { label: "Most Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
];

// Price Range Options
export const PRICE_RANGES = [
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 to $50", min: 25, max: 50 },
  { label: "$50 to $100", min: 50, max: 100 },
  { label: "$100 to $200", min: 100, max: 200 },
  { label: "$200 & Above", min: 200, max: Infinity },
];

// Rating Options
export const RATING_OPTIONS = [
  { label: "4 Stars & Up", value: 4 },
  { label: "3 Stars & Up", value: 3 },
  { label: "2 Stars & Up", value: 2 },
  { label: "1 Star & Up", value: 1 },
];

// Order Status
export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-primary" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-primary" },
  processing: { label: "Processing", color: "bg-purple-100 text-primary" },
  shipped: { label: "Shipped", color: "bg-indigo-100 text-primary" },
  delivered: { label: "Delivered", color: "bg-green-100 text-primary" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-secondary" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-primary" },
};

// Payment Methods
export const PAYMENT_METHODS = [
  { id: "card", name: "Credit/Debit Card", label: "Credit/Debit Card", icon: "💳" },
  { id: "paypal", name: "PayPal", label: "PayPal", icon: "🅿️" },
  { id: "apple-pay", name: "Apple Pay", label: "Apple Pay", icon: "🍎" },
  { id: "google-pay", name: "Google Pay", label: "Google Pay", icon: "🔵" },
  { id: "cod", name: "Cash on Delivery", label: "Cash on Delivery", icon: "💵" },
];

// Shipping Options
export const SHIPPING_OPTIONS = [
  {
    id: "standard",
    name: "Standard Shipping",
    label: "Standard Shipping",
    description: "5-7 business days",
    price: 5.99,
  },
  {
    id: "express",
    name: "Express Shipping",
    label: "Express Shipping",
    description: "2-3 business days",
    price: 12.99,
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    label: "Overnight Shipping",
    description: "Next business day",
    price: 24.99,
  },
  {
    id: "free",
    name: "Free Shipping",
    label: "Free Shipping",
    description: "7-10 business days (Orders over $50)",
    price: 0,
    minOrder: 50,
  },
];

// Pagination
export const ITEMS_PER_PAGE = 12;
export const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

// Image Sizes
export const IMAGE_SIZES = {
  thumbnail: { width: 80, height: 80 },
  small: { width: 200, height: 200 },
  medium: { width: 400, height: 400 },
  large: { width: 800, height: 800 },
  banner: { width: 1920, height: 600 },
  card: { width: 300, height: 300 },
};

// Animation Durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  cart: "ordonsooq-cart",
  wishlist: "ordonsooq-wishlist",
  recentlyViewed: "ordonsooq-recently-viewed",
  user: "ordonsooq-user",
  theme: "ordonsooq-theme",
};
