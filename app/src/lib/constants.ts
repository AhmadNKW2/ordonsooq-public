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
  { label: "nav.home", href: "/" },
  { label: "nav.shop", href: "/products" },
  { label: "nav.categories", href: "/categories" },
  { label: "nav.deals", href: "#" },
  { label: "nav.newArrivals", href: "/products?filter=new" },
  { label: "nav.about", href: "#" },
  { label: "nav.contact", href: "#" },
];

// Footer Links
export const FOOTER_LINKS = {
  shop: [
    { label: "footer.links.allProducts", href: "/products" },
    { label: "footer.links.newArrivals", href: "/products?filter=new" },
    { label: "footer.links.bestSellers", href: "/products?filter=bestsellers" },
    { label: "footer.links.sale", href: "#" },
    { label: "footer.links.giftCards", href: "#" },
  ],
  support: [
    { label: "footer.links.contactUs", href: "#" },
    { label: "footer.links.faqs", href: "#" },
    { label: "footer.links.shippingInfo", href: "#" },
    { label: "footer.links.returnsExchanges", href: "#" },
    { label: "footer.links.trackOrder", href: "#" },
  ],
  company: [
    { label: "footer.links.aboutUs", href: "#" },
    { label: "footer.links.careers", href: "#" },
    { label: "footer.links.blog", href: "#" },
    { label: "footer.links.press", href: "#" },
    { label: "footer.links.affiliateProgram", href: "#" },
  ],
  legal: [
    { label: "footer.links.privacyPolicy", href: "#" },
    { label: "footer.links.termsOfService", href: "#" },
    { label: "footer.links.cookiePolicy", href: "#" },
    { label: "footer.links.accessibility", href: "#" },
  ],
};

// Product Sort Options
export const SORT_OPTIONS = [
  { label: "options.sort.mostPopular", value: "popular" },
  { label: "options.sort.newest", value: "newest" },
  { label: "options.sort.priceLowHigh", value: "price-asc" },
  { label: "options.sort.priceHighLow", value: "price-desc" },
  { label: "options.sort.topRated", value: "rating" },
];

// Price Range Options
export const PRICE_RANGES = [
  { label: "options.price.under25", min: 0, max: 25 },
  { label: "options.price.25to50", min: 25, max: 50 },
  { label: "options.price.50to100", min: 50, max: 100 },
  { label: "options.price.100to200", min: 100, max: 200 },
  { label: "options.price.200plus", min: 200, max: Infinity },
];

// Rating Options
export const RATING_OPTIONS = [
  { label: "options.rating.4stars", value: 4 },
  { label: "options.rating.3stars", value: 3 },
  { label: "options.rating.2stars", value: 2 },
  { label: "options.rating.1star", value: 1 },
];

// Order Status
export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "options.orderStatus.pending", color: "bg-yellow-100 text-primary" },
  confirmed: { label: "options.orderStatus.confirmed", color: "bg-blue-100 text-primary" },
  processing: { label: "options.orderStatus.processing", color: "bg-purple-100 text-primary" },
  shipped: { label: "options.orderStatus.shipped", color: "bg-indigo-100 text-primary" },
  delivered: { label: "options.orderStatus.delivered", color: "bg-green-100 text-primary" },
  cancelled: { label: "options.orderStatus.cancelled", color: "bg-red-100 text-secondary" },
  refunded: { label: "options.orderStatus.refunded", color: "bg-gray-100 text-primary" },
};

// Payment Methods
export const PAYMENT_METHODS = [
  { id: "card", name: "Credit/Debit Card", label: "options.payment.card", icon: "💳" },
  { id: "paypal", name: "PayPal", label: "options.payment.paypal", icon: "🅿️" },
  { id: "apple-pay", name: "Apple Pay", label: "options.payment.applePay", icon: "🍎" },
  { id: "google-pay", name: "Google Pay", label: "options.payment.googlePay", icon: "🔵" },
  { id: "cod", name: "Cash on Delivery", label: "options.payment.cod", icon: "💵" },
];

// Shipping Options
export const SHIPPING_OPTIONS = [
  {
    id: "standard",
    name: "Standard Shipping",
    label: "options.shipping.standard",
    description: "options.shipping.standardDesc",
    price: 5.99,
  },
  {
    id: "express",
    name: "Express Shipping",
    label: "options.shipping.express",
    description: "options.shipping.expressDesc",
    price: 12.99,
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    label: "options.shipping.overnight",
    description: "options.shipping.overnightDesc",
    price: 24.99,
  },
  {
    id: "free",
    name: "Free Shipping",
    label: "options.shipping.free",
    description: "options.shipping.freeDesc",
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

export const JORDAN_CITIES = [
  { value: 'Amman', label: 'Amman' },
  { value: 'Zarqa', label: 'Zarqa' },
  { value: 'Irbid', label: 'Irbid' },
  { value: 'Russeifa', label: 'Russeifa' },
  { value: 'Sahab', label: 'Sahab' },
  { value: 'Ramtha', label: 'Ramtha' },
  { value: 'Aqaba', label: 'Aqaba' },
  { value: 'Mafraq', label: 'Mafraq' },
  { value: 'Madaba', label: 'Madaba' },
  { value: 'Salt', label: 'Salt' },
  { value: 'Jerash', label: 'Jerash' },
  { value: 'Ain Al-Basha', label: 'Ain Al-Basha' },
  { value: 'Karak', label: 'Karak' },
  { value: 'Tafilah', label: 'Tafilah' },
  { value: 'Ma\'an', label: 'Ma\'an' },
  { value: 'Ajloun', label: 'Ajloun' }
];
