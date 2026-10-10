export interface ProductColor {
  name: string;
  hex: string;
  imageIndex?: number;
}

export interface CraftDetail {
  label: string;
  value: string;
}

export type ProductCategory = 
  | 'all'
  | 'hoodies' 
  | 'joggers' 
  | 'longsleeves' 
  | 'tees' 
  | 'outerwear' 
  | 'tracksuits'
  | string;

export interface CustomCategory {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  nameEs?: string;
  description?: string;
  targetAudience?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  nameEs?: string;
  subtitle: string;
  subtitleAr?: string;
  subtitleEn?: string;
  subtitleEs?: string;
  category: string;
  price: number; // in DZD
  compareAtPrice?: number;
  wholesalePriceDzd?: number; // B2B wholesale price
  minWholesaleQty?: number;
  description: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionEs?: string;
  story: string;
  fabric: string;
  fabricAr?: string;
  fabricEn?: string;
  fabricEs?: string;
  fabricWeight: string; // e.g. "Heavyweight Fleece / Molleton Épais"
  fabricWeightAr?: string;
  fabricWeightEn?: string;
  fabricWeightEs?: string;
  millOrigin: string; // e.g. "DBC Workshop Confection - Alger"
  millOriginAr?: string;
  millOriginEn?: string;
  millOriginEs?: string;
  images: string[];
  sizes: string[]; // e.g. ['S', 'M', 'L', 'XL', 'XXL']
  colors: ProductColor[];
  details: CraftDetail[];
  allowsMadeToMeasure: boolean;
  batchNumber?: string;
  readyInDays: string;
  careInstructions: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  isWinterFocus?: boolean;
  isB2BAvailable?: boolean;
  inStock?: boolean;
  stock?: number;
  isPublished?: boolean;
  updatedAt?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedAt: string;
  uploadedBy?: string;
  category?: 'product' | 'hero' | 'workshop' | 'general';
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'owner';
  createdAt?: string;
}

export interface CustomMeasurements {
  chest?: number;
  waist?: number;
  sleeve?: number;
  inseam?: number;
  shoulder?: number;
  heightCm?: number;
  weightKg?: number;
  fitPreference: 'slim' | 'tailored' | 'relaxed';
  specialNotes?: string;
}

export interface MonogramOptions {
  enabled: boolean;
  text: string;
  threadColor: string;
  placement: string;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  product: Product;
  size: string;
  color: ProductColor;
  quantity: number;
  isMadeToMeasure: boolean;
  isWholesaleOrder?: boolean;
  customMeasurements?: CustomMeasurements;
  monogram?: MonogramOptions;
  pricePerUnit: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  currency: Currency;
  createdAt?: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    wilayaCode: string;
    wilayaName: string;
    notes?: string;
  };
  deliveryType: 'home' | 'desk';
  paymentMethod: 'cod' | 'baridimob';
  status: 'Reçu / Confirmed' | 'En Préparation / Atelier' | 'Expédié / En Livraison' | 'Livré / Completed';
  trackingNumber: string;
  estimatedDelivery: string;
  carrierName?: string;
  carrierTrackingUrl?: string;
  trackingNotes?: string;
  dispatchedAt?: string;
}

export interface DeliveryCompany {
  id: string;
  name: string;
  phone: string;
  trackingUrlTemplate: string;
  trackingPrefix: string;
  supportsStopDesk: boolean;
  isActive: boolean;
  notes?: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  location: string;
  locationAr?: string;
  rating: number;
  date: string;
  dateAr?: string;
  dateEn?: string;
  dateEs?: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  titleEs?: string;
  comment: string;
  commentAr?: string;
  commentEn?: string;
  commentEs?: string;
  verifiedWorkshopPurchase: boolean;
  garmentSpec: string;
  garmentSpecAr?: string;
  garmentSpecEn?: string;
  garmentSpecEs?: string;
}

export type Currency = 'DZD' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyRate {
  symbol: string;
  rate: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  taglineAr?: string;
  taglineEn?: string;
  taglineEs?: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  baridiMobRip: string;
  ccpAccount: string;
  b2bDiscountPercent: number;
  defaultDeliveryFeeDzd: number;
  instagram: string;
  facebook: string;
  mapsUrl?: string;
  heroImage?: string;
  heroImages?: string[];
  heroFocalPosition?: string;
  heroOverlayStrength?: 'subtle' | 'medium' | 'dark';
  heroTitle?: string;
  heroTitleAr?: string;
  heroTitleEn?: string;
  heroTitleEs?: string;
  heroSubtitle?: string;
  heroSubtitleAr?: string;
  heroSubtitleEn?: string;
  heroSubtitleEs?: string;
  heroCtaText?: string;
  heroCtaTextAr?: string;
  heroCtaTextEn?: string;
  heroCtaTextEs?: string;
  // Site-wide SEO Metadata
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoAuthor?: string;
  ogImage?: string;
  canonicalUrl?: string;
  // Delivery & Logistics Settings
  activeDeliveryCompany?: string;
  deliveryCompanies?: DeliveryCompany[];
  customWilayaRates?: Record<string, { home: number; desk: number }>;
  freeShippingThresholdDzd?: number;
  defaultDeliveryDelay?: string;
  customCategories?: CustomCategory[];
}
