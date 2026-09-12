// lib/store.ts
// Supabase-backed versions of the four persisted Zustand stores.
// localStorage is gone — every cart/wishlist/auth/order lives in Postgres
// and is gated by RLS policies from supabase/migrations/.

"use client";

import { create } from "zustand";
import { supabase, SUPABASE_READY } from "./supabase";
import type { Address, CartItem, Order, User } from "./types";
import { generateOrderId, generateTrackingNumber } from "./utils";

// ============================================================================
// Internal types (DB rows)
// ============================================================================

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar: string | null;
  phone: string | null;
  preferred_families: string[];
  receive_newsletter: boolean;
  role: "customer" | "admin" | "manager";
};

type CartRow = {
  id: string;
  product_id: string;
  variant: string;
  quantity: number;
};

type WishlistRow = {
  product_id: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  status: Order["status"];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: string;
  shipping_address_id: string | null;
  promo_code: string | null;
  tracking_number: string | null;
  created_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  brand_name: string;
  image: string;
  variant: string;
  quantity: number;
  unit_price: number;
};

// ============================================================================
// useAuth
// ============================================================================

interface AuthState {
  user: User | null;
  role: "customer" | "admin" | "manager";
  loading: boolean;
  /** Initialise — subscribes to onAuthStateChange and loads profile. */
  init: () => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (
    address: Omit<Address, "id">
  ) => Promise<{ success: boolean; message: string }>;
  removeAddress: (id: string) => Promise<void>;
}

const DEMO_ADDRESSES: Address[] = [
  {
    id: "demo-1",
    label: "Home",
    street: "1245 Park Avenue, Apt 8B",
    city: "New York",
    state: "NY",
    zip: "10128",
    country: "United States",
    isDefault: true,
  },
  {
    id: "demo-2",
    label: "Office",
    street: "500 Madison Avenue, Floor 22",
    city: "New York",
    state: "NY",
    zip: "10022",
    country: "United States",
    isDefault: false,
  },
];

function profileToUser(p: ProfileRow, addresses: Address[] = []): User {
  return {
    id: p.id,
    name: p.display_name ?? "",
    email: p.email ?? "",
    avatar: p.avatar ?? "",
    phone: p.phone ?? "",
    addresses,
    preferences: {
      scentFamilies: (p.preferred_families ?? []) as User["preferences"]["scentFamilies"],
      receiveNewsletter: p.receive_newsletter ?? true,
    },
  };
}

async function loadProfileAndAddresses(userId: string) {
  const [{ data: prof }, { data: addrs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("addresses").select("*").eq("profile_id", userId).order("created_at"),
  ]);
  return {
    profile: prof as ProfileRow | null,
    addresses: ((addrs ?? []) as Array<{
      id: string;
      label: string;
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      is_default: boolean;
    }>).map<Address>((a) => ({
      id: a.id,
      label: a.label,
      street: a.street,
      city: a.city,
      state: a.state,
      zip: a.zip,
      country: a.country,
      isDefault: a.is_default,
    })),
  };
}

export const useAuth = create<AuthState>()((set, get) => ({
  user: null,
  role: "customer",
  loading: true,

  init: async () => {
    if (!SUPABASE_READY) {
      set({ loading: false });
      return;
    }
    const { data: sess } = await supabase.auth.getSession();
    if (sess.session?.user) {
      const { profile, addresses } = await loadProfileAndAddresses(sess.session.user.id);
      if (profile) {
        set({
          user: profileToUser(profile, addresses),
          role: profile.role,
          loading: false,
        });
        return;
      }
    }
    set({ user: null, role: "customer", loading: false });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        set({ user: null, role: "customer" });
        return;
      }
      const { profile, addresses } = await loadProfileAndAddresses(session.user.id);
      if (profile) {
        set({ user: profileToUser(profile, addresses), role: profile.role });
      }
    });
  },

  signup: async (name, email, password) => {
    if (!SUPABASE_READY) {
      return { success: false, message: "Supabase is not configured." };
    }
    if (!name || !email || !password) {
      return { success: false, message: "Name, email and password are required." };
    }
    if (password.length < 6) {
      return { success: false, message: "Password must be at least 6 characters." };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    if (error) return { success: false, message: error.message };
    return {
      success: true,
      message:
        "Welcome to Perfumeria! Check your email to confirm your account, or sign in directly if email confirmation is disabled.",
    };
  },

  login: async (email, password) => {
    if (!SUPABASE_READY) {
      return { success: false, message: "Supabase is not configured." };
    }
    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Welcome back!" };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: "customer" });
  },

  updateProfile: async (data) => {
    const u = get().user;
    if (!u) return;
    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.display_name = data.name;
    if (data.email !== undefined) update.email = data.email;
    if (data.avatar !== undefined) update.avatar = data.avatar;
    if (data.phone !== undefined) update.phone = data.phone;
    if (data.preferences?.scentFamilies !== undefined)
      update.preferred_families = data.preferences.scentFamilies;
    if (data.preferences?.receiveNewsletter !== undefined)
      update.receive_newsletter = data.preferences.receiveNewsletter;
    await supabase.from("profiles").update(update).eq("id", u.id);
  },

  addAddress: async (address) => {
    const u = get().user;
    if (!u) return { success: false, message: "Not signed in." };
    const isDefault =
      u.addresses.length === 0 ? true : !!address.isDefault;
    if (isDefault) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("profile_id", u.id);
    }
    const { data, error } = await supabase
      .from("addresses")
      .insert({
        profile_id: u.id,
        label: address.label,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
        is_default: isDefault,
      })
      .select()
      .single();
    if (error) return { success: false, message: error.message };
    set({
      user: {
        ...u,
        addresses: [
          ...u.addresses.map((a) => ({ ...a, isDefault: false })),
          {
            id: data.id,
            label: data.label,
            street: data.street,
            city: data.city,
            state: data.state,
            zip: data.zip,
            country: data.country,
            isDefault: data.is_default,
          },
        ],
      },
    });
    return { success: true, message: "Address added." };
  },

  removeAddress: async (id) => {
    const u = get().user;
    if (!u) return;
    await supabase.from("addresses").delete().eq("id", id);
    set({
      user: {
        ...u,
        addresses: u.addresses.filter((a) => a.id !== id),
      },
    });
  },
}));

// ============================================================================
// useCart
// ============================================================================

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (productId: string, variant: string, quantity?: number) => Promise<void>;
  remove: (productId: string, variant: string) => Promise<void>;
  updateQty: (productId: string, variant: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  applyPromo: (code: string) => { success: boolean; message: string };
  removePromo: () => void;
  count: () => number;
  subtotal: () => number;
  discount: () => number;
}

export const useCart = create<CartState>()((set, get) => ({
  items: [],
  promoCode: null,
  loading: false,

  refresh: async () => {
    const u = useAuth.getState().user;
    if (!u || !SUPABASE_READY) {
      set({ items: [] });
      return;
    }
    set({ loading: true });
    const { data } = await supabase
      .from("cart_items")
      .select("id, product_id, variant, quantity")
      .eq("profile_id", u.id)
      .order("created_at");
    const items: CartItem[] = ((data ?? []) as CartRow[]).map((r) => ({
      productId: r.product_id,
      variant: r.variant,
      quantity: r.quantity,
    }));
    set({ items, loading: false });
  },

  add: async (productId, variant, quantity = 1) => {
    const u = useAuth.getState().user;
    if (!u || !SUPABASE_READY) return;
    // Optimistic update
    const existing = get().items.find(
      (i) => i.productId === productId && i.variant === variant
    );
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.productId === productId && i.variant === variant
            ? { ...i, quantity: i.quantity + quantity }
            : i
        ),
      });
    } else {
      set({ items: [...get().items, { productId, variant, quantity }] });
    }
    // Upsert to DB (unique on profile_id+product_id+variant)
    await supabase
      .from("cart_items")
      .upsert(
        {
          profile_id: u.id,
          product_id: productId,
          variant,
          quantity: (existing?.quantity ?? 0) + quantity,
        },
        { onConflict: "profile_id,product_id,variant" }
      );
    await get().refresh();
  },

  remove: async (productId, variant) => {
    const u = useAuth.getState().user;
    if (!u || !SUPABASE_READY) return;
    set({
      items: get().items.filter(
        (i) => !(i.productId === productId && i.variant === variant)
      ),
    });
    await supabase
      .from("cart_items")
      .delete()
      .eq("profile_id", u.id)
      .eq("product_id", productId)
      .eq("variant", variant);
  },

  updateQty: async (productId, variant, quantity) => {
    const u = useAuth.getState().user;
    if (!u || !SUPABASE_READY) return;
    const q = Math.max(1, quantity);
    set({
      items: get().items.map((i) =>
        i.productId === productId && i.variant === variant ? { ...i, quantity: q } : i
      ),
    });
    await supabase
      .from("cart_items")
      .update({ quantity: q })
      .eq("profile_id", u.id)
      .eq("product_id", productId)
      .eq("variant", variant);
  },

  clear: async () => {
    const u = useAuth.getState().user;
    if (!u || !SUPABASE_READY) return;
    set({ items: [], promoCode: null });
    await supabase.from("cart_items").delete().eq("profile_id", u.id);
  },

  applyPromo: (code) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return { success: false, message: "Enter a promo code." };
    set({ promoCode: trimmed });
    return { success: true, message: `${trimmed} applied!` };
  },

  removePromo: () => set({ promoCode: null }),

  count: () => get().items.reduce((s, i) => s + i.quantity, 0),
  subtotal: () => get().items.reduce((s, i) => s, 0), // computed upstream with product prices
  discount: () => 0, // computed upstream via apply_promo RPC
}));

// ============================================================================
// useWishlist
// ============================================================================

interface WishlistState {
  ids: string[];
  loading: boolean;
  refresh: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
  count: () => number;
}

export const useWishlist = create<WishlistState>()((set, get) => ({
  ids: [],
  loading: false,

  refresh: async () => {
    const u = useAuth.getState().user;
    if (!u || !SUPABASE_READY) {
      set({ ids: [] });
      return;
    }
    set({ loading: true });
    const { data } = await supabase
      .from("wishlist_items")
      .select("product_id")
      .eq("profile_id", u.id);
    set({ ids: ((data ?? []) as WishlistRow[]).map((r) => r.product_id), loading: false });
  },

  toggle: async (productId) => {
    const u = useAuth.getState().user;
    if (!u || !SUPABASE_READY) return;
    const has = get().ids.includes(productId);
    if (has) {
      set({ ids: get().ids.filter((id) => id !== productId) });
      await supabase
        .from("wishlist_items")
        .delete()
        .eq("profile_id", u.id)
        .eq("product_id", productId);
    } else {
      set({ ids: [...get().ids, productId] });
      await supabase
        .from("wishlist_items")
        .insert({ profile_id: u.id, product_id: productId });
    }
  },

  has: (productId) => get().ids.includes(productId),
  count: () => get().ids.length,
}));

// ============================================================================
// useOrders
// ============================================================================

interface OrdersState {
  orders: Order[];
  loading: boolean;
  refresh: () => Promise<void>;
  place: (
    data: Omit<Order, "id" | "createdAt" | "status" | "trackingNumber" | "orderNumber">
  ) => Promise<Order | null>;
  cancel: (orderId: string) => Promise<void>;
  getById: (orderId: string) => Order | undefined;
}

export const useOrders = create<OrdersState>()((set, get) => ({
  orders: [],
  loading: false,

  refresh: async () => {
    const u = useAuth.getState().user;
    if (!u || !SUPABASE_READY) {
      set({ orders: [] });
      return;
    }
    set({ loading: true });
    const { data: ordersRaw } = await supabase
      .from("orders")
      .select("*")
      .eq("profile_id", u.id)
      .order("created_at", { ascending: false });
    const { data: itemsRaw } = await supabase
      .from("order_items")
      .select("*")
      .in(
        "order_id",
        ((ordersRaw ?? []) as OrderRow[]).map((o) => o.id)
      );
    const itemsByOrder = new Map<string, OrderItemRow[]>();
    for (const it of (itemsRaw ?? []) as OrderItemRow[]) {
      const arr = itemsByOrder.get(it.order_id) ?? [];
      arr.push(it);
      itemsByOrder.set(it.order_id, arr);
    }
    const orders: Order[] = ((ordersRaw ?? []) as OrderRow[]).map((o) => {
      const items = (itemsByOrder.get(o.id) ?? []).map<Order["items"][number]>((it) => ({
        productId: it.product_id ?? "",
        productName: it.product_name,
        brand: it.brand_name,
        image: it.image,
        variant: it.variant,
        quantity: it.quantity,
        price: Number(it.unit_price),
      }));
      return {
        id: o.id,
        orderNumber: o.order_number,
        userId: u.id,
        items,
        subtotal: Number(o.subtotal),
        shipping: Number(o.shipping),
        tax: Number(o.tax),
        discount: Number(o.discount),
        total: Number(o.total),
        status: o.status,
        paymentMethod: o.payment_method,
        shippingAddress: {
          id: o.shipping_address_id ?? "",
          label: "",
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "",
          isDefault: false,
        }, // detail fetched separately when needed
        createdAt: o.created_at,
        trackingNumber: o.tracking_number ?? undefined,
        promoCode: o.promo_code ?? undefined,
      } as Order;
    });
    set({ orders, loading: false });
  },

  place: async (data) => {
    const u = useAuth.getState().user;
    if (!u || !SUPABASE_READY) return null;
    const trackingNumber = generateTrackingNumber();
    const orderNumber = generateOrderId();
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        profile_id: u.id,
        order_number: orderNumber,
        status: "processing",
        subtotal: data.subtotal,
        shipping: data.shipping,
        tax: data.tax,
        discount: data.discount,
        total: data.total,
        payment_method: data.paymentMethod,
        shipping_address_id: data.shippingAddress?.id || null,
        promo_code: data.promoCode || null,
        tracking_number: trackingNumber,
      })
      .select()
      .single();
    if (error || !order) return null;
    if (data.items.length > 0) {
      await supabase.from("order_items").insert(
        data.items.map((it) => ({
          order_id: order.id,
          product_id: it.productId || null,
          product_name: it.productName,
          brand_name: it.brand,
          image: it.image,
          variant: it.variant,
          quantity: it.quantity,
          unit_price: it.price,
        }))
      );
    }
    // Clear cart
    await supabase.from("cart_items").delete().eq("profile_id", u.id);
    await get().refresh();
    return { ...data, id: order.id, orderNumber, status: "processing", createdAt: order.created_at, trackingNumber } as Order;
  },

  cancel: async (orderId) => {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    await get().refresh();
  },

  getById: (orderId) => get().orders.find((o) => o.id === orderId),
}));

// ============================================================================
// useUI  (unchanged — purely client UI state, no persistence)
// ============================================================================

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
    const id = Math.random().toString(36).slice(2);
    set({ toast: { id, type, message } });
    setTimeout(() => {
      set((s) => (s.toast?.id === id ? { toast: null } : s));
    }, 3200);
  },
  hideToast: () => set({ toast: null }),
}));

// Re-export DEMO_ADDRESSES for any UI fallback that still expects it
export { DEMO_ADDRESSES };
