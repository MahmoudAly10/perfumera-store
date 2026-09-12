"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight } from "lucide-react";
import { useCart, useUI } from "@/lib/store";
import { getProductById, PROMO_CODES } from "@/lib/data";
import {
  calculateShipping,
  calculateTax,
  formatPrice,
} from "@/lib/utils";

export default function CartPage() {
  const cart = useCart();
  const ui = useUI();
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const subtotal = cart.subtotal();
  const discount = cart.discount();
  const shipping = calculateShipping(subtotal - discount);
  const tax = calculateTax(subtotal - discount);
  const total = subtotal - discount + shipping + tax;

  const onApplyPromo = () => {
    if (!promoInput.trim()) return;
    const res = cart.applyPromo(promoInput.trim());
    setPromoMessage({ type: res.success ? "ok" : "err", text: res.message });
    if (res.success) {
      setPromoInput("");
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-12 h-12 text-[var(--color-ink-muted)] mx-auto mb-4" />
        <h1 className="font-display text-4xl mb-3">Your cart is empty</h1>
        <p className="text-[var(--color-ink-soft)] mb-8">
          Add some fragrances to your cart to get started.
        </p>
        <Link href="/shop" className="btn btn-primary inline-flex">
          Shop Fragrances
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-5xl mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div>
          <div className="border-t border-[var(--color-line)]">
            {cart.items.map((item) => {
              const p = getProductById(item.productId);
              if (!p) return null;
              const v = p.variants.find((v) => v.size === item.variant);
              return (
                <div
                  key={`${item.productId}-${item.variant}`}
                  className="flex gap-4 sm:gap-6 py-6 border-b border-[var(--color-line)]"
                >
                  <Link
                    href={`/product/${p.slug}`}
                    className="w-24 h-32 sm:w-32 sm:h-40 bg-[var(--color-bg-alt)] shrink-0 overflow-hidden"
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
                    <p className="eyebrow mb-1">{p.brand}</p>
                    <Link
                      href={`/product/${p.slug}`}
                      className="font-display text-xl sm:text-2xl block hover:text-[var(--color-gold-dark)]"
                    >
                      {p.name}
                    </Link>
                    <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                      {p.concentration} · {item.variant}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-[var(--color-line)]">
                        <button
                          onClick={() =>
                            cart.updateQty(item.productId, item.variant, item.quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-bg-alt)]"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() =>
                            cart.updateQty(item.productId, item.variant, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-bg-alt)]"
                          aria-label="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-display text-lg">
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

          <div className="flex items-center justify-between mt-6">
            <Link
              href="/shop"
              className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            >
              ← Continue shopping
            </Link>
            <button
              onClick={() => {
                if (confirm("Clear your cart?")) cart.clear();
              }}
              className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-rose)]"
            >
              Clear cart
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-28 self-start">
          <div className="bg-[var(--color-bg-alt)] p-6 sm:p-8">
            <h2 className="font-display text-2xl mb-6">Order Summary</h2>

            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-[var(--color-line)]">
              <div className="flex justify-between">
                <span className="text-[var(--color-ink-soft)]">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[var(--color-emerald)]">
                  <span>Discount ({cart.promoCode})</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--color-ink-soft)]">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-ink-soft)]">Tax (est.)</span>
                <span>{formatPrice(tax)}</span>
              </div>
            </div>

            <div className="flex justify-between mb-6 text-lg font-display">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {/* Promo code */}
            <div className="mb-6">
              <label className="label">Promo code</label>
              {cart.promoCode ? (
                <div className="flex items-center justify-between bg-[var(--color-bg)] border border-[var(--color-line)] px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-3.5 h-3.5 text-[var(--color-emerald)]" />
                    <span className="font-medium">{cart.promoCode}</span>
                    <span className="text-[var(--color-ink-muted)]">applied</span>
                  </div>
                  <button
                    onClick={() => {
                      cart.removePromo();
                      setPromoMessage(null);
                    }}
                    className="text-xs text-[var(--color-rose)] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && onApplyPromo()}
                    placeholder="WELCOME10"
                    className="input flex-1 text-sm"
                  />
                  <button onClick={onApplyPromo} className="btn btn-secondary text-xs px-4">
                    Apply
                  </button>
                </div>
              )}
              {promoMessage && (
                <p
                  className={`text-xs mt-2 ${
                    promoMessage.type === "ok" ? "text-[var(--color-emerald)]" : "text-[var(--color-rose)]"
                  }`}
                >
                  {promoMessage.text}
                </p>
              )}
              <details className="mt-3 text-xs text-[var(--color-ink-muted)]">
                <summary className="cursor-pointer hover:text-[var(--color-ink)]">
                  Try one of these codes
                </summary>
                <ul className="mt-2 space-y-1">
                  {PROMO_CODES.map((p) => (
                    <li key={p.code} className="flex items-center justify-between">
                      <button
                        onClick={() => setPromoInput(p.code)}
                        className="font-mono text-[var(--color-ink)]"
                      >
                        {p.code}
                      </button>
                      <span>{p.description}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>

            <Link href="/checkout" className="btn btn-primary w-full mb-3">
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-center text-[var(--color-ink-muted)]">
              Free samples with every order
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
