"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/store";
import { getProductById } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const cart = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-cart", onOpen);
    return () => window.removeEventListener("open-cart", onOpen);
  }, []);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />
      <div className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-[var(--color-bg)] shadow-2xl flex flex-col toast-in">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-line)]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <span className="font-display text-2xl">Your Cart</span>
            <span className="text-sm text-[var(--color-ink-muted)]">({cart.count()})</span>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close cart">
            <X className="w-6 h-6" />
          </button>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-[var(--color-ink-muted)] mb-4" />
            <h3 className="font-display text-2xl mb-2">Your cart is empty</h3>
            <p className="text-sm text-[var(--color-ink-soft)] mb-6">
              Start exploring our curated world of fragrances.
            </p>
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="btn btn-primary"
            >
              Shop Fragrances
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.items.map((item) => {
                const p = getProductById(item.productId);
                if (!p) return null;
                const v = p.variants.find((v) => v.size === item.variant);
                return (
                  <div
                    key={`${item.productId}-${item.variant}`}
                    className="flex gap-4 pb-4 border-b border-[var(--color-line)] last:border-0"
                  >
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="w-20 h-24 bg-[var(--color-bg-alt)] shrink-0 overflow-hidden"
                    >
                      {p.images[0] && (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs eyebrow mb-0.5">{p.brand}</p>
                      <Link
                        href={`/product/${p.slug}`}
                        onClick={() => setOpen(false)}
                        className="font-display text-lg leading-tight block truncate hover:text-[var(--color-gold-dark)]"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{item.variant}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-[var(--color-line)]">
                          <button
                            onClick={() =>
                              cart.updateQty(item.productId, item.variant, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center hover:bg-[var(--color-bg-alt)]"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() =>
                              cart.updateQty(item.productId, item.variant, item.quantity + 1)
                            }
                            className="w-7 h-7 flex items-center justify-center hover:bg-[var(--color-bg-alt)]"
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-medium">
                          {formatPrice((v?.price ?? 0) * item.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => cart.remove(item.productId, item.variant)}
                      className="text-[var(--color-ink-muted)] hover:text-[var(--color-rose)] self-start"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="p-6 border-t border-[var(--color-line)] bg-[var(--color-bg-alt)]">
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-[var(--color-ink-soft)]">Subtotal</span>
                <span>{formatPrice(cart.subtotal())}</span>
              </div>
              <div className="flex justify-between mb-4 text-sm">
                <span className="text-[var(--color-ink-soft)]">Shipping</span>
                <span>{cart.subtotal() >= 75 ? "Free" : formatPrice(8.5)}</span>
              </div>
              {cart.discount() > 0 && (
                <div className="flex justify-between mb-4 text-sm text-[var(--color-emerald)]">
                  <span>Discount ({cart.promoCode})</span>
                  <span>−{formatPrice(cart.discount())}</span>
                </div>
              )}
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="btn btn-primary w-full mb-2"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="btn btn-gold w-full"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
