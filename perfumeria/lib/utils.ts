import { clsx, type ClassValue } from "clsx";
import type { Product, ProductVariant } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function getCheapestVariant(product: Product): ProductVariant {
  return product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0]);
}

export function getStartingPrice(product: Product): number {
  return getCheapestVariant(product).price;
}

export function getTotalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function calculateShipping(subtotal: number): number {
  if (subtotal >= 75) return 0;
  return 8.5;
}

export function calculateTax(subtotal: number): number {
  return subtotal * 0.08;
}

export function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PRF-${ts}-${rand}`;
}

export function generateTrackingNumber(): string {
  return `1Z${Math.random().toString(36).slice(2, 12).toUpperCase()}`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

export function starArray(rating: number): ("full" | "half" | "empty")[] {
  const arr: ("full" | "half" | "empty")[] = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) arr.push("full");
    else if (rating >= i - 0.5) arr.push("half");
    else arr.push("empty");
  }
  return arr;
}
