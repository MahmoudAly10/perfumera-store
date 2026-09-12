"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, User, Address, Order } from "./types";
import { generateId, generateOrderId, generateTrackingNumber } from "./utils";
import { getProductById, PROMO_CODES } from "./data";

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  add: (productId: string, variant: string, quantity?: number) => void;
  remove: (productId: string, variant: string) => void;
  updateQty: (productId: string, variant: string, quantity: number) => void;
  clear: () => void;
  applyPromo: (code: string) => { success: boolean; message: string };
  removePromo: () => void;
  count: () => number;
  subtotal: () => number;
  discount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      add: (productId, variant, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === productId && i.variant === variant
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId && i.variant === variant
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { productId, variant, quantity }],
          };
        }),
      remove: (productId, variant) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variant === variant)
          ),
        })),
      updateQty: (productId, variant, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId && i.variant === variant
                ? { ...i, quantity: Math.max(1, quantity) }
                : i
            ),
        })),
      clear: () => set({ items: [], promoCode: null }),
      applyPromo: (code) => {
        const promo = PROMO_CODES.find(
          (p) => p.code.toLowerCase() === code.toLowerCase()
        );
        if (!promo) {
          return { success: false, message: "Invalid promo code" };
        }
        const sub = get().subtotal();
        if (sub < promo.minOrder) {
          return {
            success: false,
            message: `Minimum order $${promo.minOrder} required for this code`,
          };
        }
        set({ promoCode: promo.code });
        return { success: true, message: `${promo.description} applied!` };
      },
      removePromo: () => set({ promoCode: null }),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => {
          const p = getProductById(i.productId);
          if (!p) return sum;
          const v = p.variants.find((v) => v.size === i.variant);
          return sum + (v?.price ?? 0) * i.quantity;
        }, 0),
      discount: () => {
        const code = get().promoCode;
        if (!code) return 0;
        const promo = PROMO_CODES.find((p) => p.code === code);
        if (!promo) return 0;
        const sub = get().subtotal();
        if (promo.type === "percent") return sub * (promo.value / 100);
        return Math.min(promo.value, sub);
      },
    }),
    {
      name: "perfumeria-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  count: () => number;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),
      has: (productId) => get().ids.includes(productId),
      count: () => get().ids.length,
    }),
    {
      name: "perfumeria-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

interface AuthState {
  user: User | null;
  signup: (name: string, email: string) => { success: boolean; message: string };
  login: (email: string) => { success: boolean; message: string };
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addAddress: (address: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
}

const DEMO_USER: User = {
  id: "demo-user-1",
  name: "Aria Khalil",
  email: "aria@perfumeria.demo",
  avatar: "A",
  phone: "+1 555 0123",
  preferences: {
    scentFamilies: ["floral", "woody"],
    receiveNewsletter: true,
  },
  addresses: [
    {
      id: "addr-1",
      label: "Home",
      street: "1245 Park Avenue, Apt 8B",
      city: "New York",
      state: "NY",
      zip: "10128",
      country: "United States",
      isDefault: true,
    },
    {
      id: "addr-2",
      label: "Office",
      street: "500 Madison Avenue, Floor 22",
      city: "New York",
      state: "NY",
      zip: "10022",
      country: "United States",
      isDefault: false,
    },
  ],
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signup: (name, email) => {
        if (!name || !email) return { success: false, message: "Name and email required" };
        if (!email.includes("@")) return { success: false, message: "Invalid email" };
        set({
          user: {
            id: generateId(),
            name,
            email,
            avatar: name[0]?.toUpperCase() ?? "U",
            preferences: { scentFamilies: [], receiveNewsletter: true },
            addresses: [],
          },
        });
        return { success: true, message: "Welcome to Perfumeria!" };
      },
      login: (email) => {
        // Demo: any email logs in as the demo user if it matches, otherwise create a new minimal user
        if (email === "demo@perfumeria.com" || email === DEMO_USER.email) {
          set({ user: DEMO_USER });
          return { success: true, message: "Welcome back!" };
        }
        set({
          user: {
            ...DEMO_USER,
            id: generateId(),
            email,
            name: email.split("@")[0],
            avatar: email[0]?.toUpperCase() ?? "U",
            addresses: [],
          },
        });
        return { success: true, message: "Welcome to Perfumeria!" };
      },
      logout: () => set({ user: null }),
      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      addAddress: (address) =>
        set((state) => {
          if (!state.user) return state;
          const isDefault = state.user.addresses.length === 0 || address.isDefault;
          return {
            user: {
              ...state.user,
              addresses: [
                ...state.user.addresses.map((a) => ({ ...a, isDefault: false })),
                { ...address, id: generateId(), isDefault },
              ],
            },
          };
        }),
      removeAddress: (id) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                addresses: state.user.addresses.filter((a) => a.id !== id),
              }
            : null,
        })),
    }),
    {
      name: "perfumeria-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

interface OrdersState {
  orders: Order[];
  place: (data: Omit<Order, "id" | "createdAt" | "status" | "trackingNumber">) => Order;
  cancel: (orderId: string) => void;
  getById: (orderId: string) => Order | undefined;
}

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      place: (data) => {
        const order: Order = {
          ...data,
          id: generateOrderId(),
          status: "processing",
          createdAt: new Date().toISOString(),
          trackingNumber: generateTrackingNumber(),
        };
        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },
      cancel: (orderId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: "cancelled" as const } : o
          ),
        })),
      getById: (orderId) => get().orders.find((o) => o.id === orderId),
    }),
    {
      name: "perfumeria-orders",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

interface UIState {
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  toast: { id: string; type: "success" | "error" | "info"; message: string } | null;
  toggleMobileMenu: () => void;
  setMobileMenu: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
  hideToast: () => void;
}

export const useUI = create<UIState>((set) => ({
  mobileMenuOpen: false,
  searchOpen: false,
  toast: null,
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  setMobileMenu: (open) => set({ mobileMenuOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  showToast: (type, message) => {
    const id = generateId();
    set({ toast: { id, type, message } });
    setTimeout(() => {
      set((s) => (s.toast?.id === id ? { toast: null } : s));
    }, 3200);
  },
  hideToast: () => set({ toast: null }),
}));
