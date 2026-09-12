// Core types for the perfume shop

export type ScentFamily =
  | "floral"
  | "woody"
  | "citrus"
  | "oriental"
  | "fresh"
  | "gourmand"
  | "aquatic"
  | "green"
  | "spicy"
  | "leather"
  | "smoky"
  | "earthy"
  | "aromatic";

export type Concentration = "Parfum" | "EDP" | "EDT" | "EDC" | "Body Mist";

export type Gender = "men" | "women" | "unisex";

export type ProductCategory =
  | "men"
  | "women"
  | "unisex"
  | "niche"
  | "arabic"
  | "gift-sets";

export interface ProductVariant {
  size: string; // e.g. "30ml", "50ml", "100ml"
  price: number; // USD
  stock: number;
}

export interface ProductReview {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  date: string; // ISO date
  title: string;
  body: string;
  photos?: string[];
  verified: boolean;
  helpful: number;
  unhelpful: number;
}

export interface ProductQA {
  id: string;
  user: string;
  question: string;
  answer?: string;
  answeredBy?: string;
  date: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  gender: Gender;
  concentration: Concentration;
  scentFamily: ScentFamily[];
  description: string;
  brandStory: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  longevity: "Light" | "Moderate" | "Long-lasting" | "All-day";
  sillage: "Intimate" | "Moderate" | "Strong" | "Enormous";
  variants: ProductVariant[];
  images: string[];
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  qa: ProductQA[];
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  originalPrice?: number;
  tags?: string[];
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  description: string;
  country: string;
  founded: number;
}

export interface CartItem {
  productId: string;
  variant: string; // size
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  addresses: Address[];
  preferences: {
    scentFamilies: ScentFamily[];
    receiveNewsletter: boolean;
  };
}

export interface Address {
  id: string;
  label: string; // "Home", "Work"
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    productName: string;
    brand: string;
    image: string;
    variant: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  shippingAddress: Address;
  createdAt: string;
  trackingNumber?: string;
  promoCode?: string;
}

export interface PromoCode {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  description: string;
  expiresAt: string;
}

export interface QuizResult {
  scentFamilies: ScentFamily[];
  intensity: "light" | "moderate" | "strong";
  occasion: string[];
  recommendedProductIds: string[];
}

export interface ChatMessage {
  id: string;
  from: "user" | "bot";
  text: string;
  timestamp: string;
}
