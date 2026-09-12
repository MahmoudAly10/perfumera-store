"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Wallet,
  Banknote,
  Check,
  Lock,
  Plus,
  ChevronLeft,
} from "lucide-react";
import { useCart, useOrders, useAuth, useUI } from "@/lib/store";
import { getProductById } from "@/lib/data";
import {
  calculateShipping,
  calculateTax,
  formatPrice,
} from "@/lib/utils";
import type { Address } from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = "shipping" | "payment" | "review";
type PaymentMethod = "card" | "apple" | "google" | "cod";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const orders = useOrders();
  const auth = useAuth();
  const ui = useUI();

  const [step, setStep] = useState<Step>("shipping");
  const [shippingAddr, setShippingAddr] = useState<Address | null>(
    auth.user?.addresses.find((a) => a.isDefault) ?? null
  );
  const [newAddr, setNewAddr] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  });
  const [showNewAddr, setShowNewAddr] = useState(!shippingAddr);
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (cart.items.length === 0 && !processing) {
      router.push("/cart");
    }
  }, [cart.items.length, processing, router]);

  const subtotal = cart.subtotal();
  const discount = cart.discount();
  const shipping = calculateShipping(subtotal - discount);
  const tax = calculateTax(subtotal - discount);
  const total = subtotal - discount + shipping + tax;

  const onPlaceOrder = async () => {
    setProcessing(true);
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1200));

    if (!shippingAddr) {
      ui.showToast("error", "Please add a shipping address");
      setProcessing(false);
      return;
    }

    const order = orders.place({
      userId: auth.user?.id ?? "guest",
      items: cart.items.map((i) => {
        const p = getProductById(i.productId)!;
        const v = p.variants.find((v) => v.size === i.variant)!;
        return {
          productId: i.productId,
          productName: p.name,
          brand: p.brand,
          image: p.images[0],
          variant: i.variant,
          quantity: i.quantity,
          price: v.price,
        };
      }),
      subtotal,
      shipping,
      tax,
      discount,
      total,
      paymentMethod:
        payment === "card"
          ? `Card ending in ${card.number.slice(-4)}`
          : payment === "apple"
          ? "Apple Pay"
          : payment === "google"
          ? "Google Pay"
          : "Cash on Delivery",
      shippingAddress: shippingAddr,
      promoCode: cart.promoCode ?? undefined,
    });

    cart.clear();
    router.push(`/order-confirmation/${order.id}`);
  };

  if (cart.items.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back to cart
      </Link>

      <h1 className="font-display text-5xl mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 sm:gap-4 mb-8 text-sm">
        <StepDot num={1} label="Shipping" active={step === "shipping"} done={step !== "shipping"} />
        <div className="flex-1 h-px bg-[var(--color-line)]" />
        <StepDot num={2} label="Payment" active={step === "payment"} done={step === "review"} />
        <div className="flex-1 h-px bg-[var(--color-line)]" />
        <StepDot num={3} label="Review" active={step === "review"} done={false} />
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div>
          {step === "shipping" && (
            <div>
              <h2 className="font-display text-2xl mb-6">Shipping address</h2>

              {!auth.user && (
                <div className="mb-6 p-4 bg-[var(--color-bg-alt)] flex items-center justify-between">
                  <p className="text-sm">Already have an account?</p>
                  <Link href="/login" className="text-sm text-[var(--color-gold-dark)] hover:underline">
                    Sign in
                  </Link>
                </div>
              )}

              {!auth.user && (
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="input"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="label">Full name *</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
              )}

              {auth.user && auth.user.addresses.length > 0 && !showNewAddr && (
                <div className="space-y-3 mb-6">
                  {auth.user.addresses.map((a) => (
                    <label
                      key={a.id}
                      className={cn(
                        "block p-4 border cursor-pointer transition-colors",
                        shippingAddr?.id === a.id
                          ? "border-[var(--color-ink)] bg-[var(--color-bg-alt)]"
                          : "border-[var(--color-line)] hover:border-[var(--color-ink)]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{a.label}</span>
                        {a.isDefault && (
                          <span className="text-[10px] tracking-wider uppercase text-[var(--color-gold-dark)]">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-ink-soft)]">
                        {a.street}, {a.city}, {a.state} {a.zip}, {a.country}
                      </p>
                      <input
                        type="radio"
                        name="address"
                        checked={shippingAddr?.id === a.id}
                        onChange={() => setShippingAddr(a)}
                        className="sr-only"
                      />
                    </label>
                  ))}
                  <button
                    onClick={() => setShowNewAddr(true)}
                    className="btn btn-secondary w-full"
                  >
                    <Plus className="w-4 h-4" /> Add new address
                  </button>
                </div>
              )}

              {(showNewAddr || (auth.user && auth.user.addresses.length === 0)) && (
                <div className="space-y-4 p-6 bg-[var(--color-bg-alt)]">
                  <h3 className="font-display text-xl">New address</h3>
                  <div>
                    <label className="label">Label</label>
                    <input
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Street *</label>
                    <input
                      required
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">City *</label>
                      <input
                        required
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">State *</label>
                      <input
                        required
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">ZIP *</label>
                      <input
                        required
                        value={newAddr.zip}
                        onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Country *</label>
                      <input
                        required
                        value={newAddr.country}
                        onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!newAddr.street || !newAddr.city) {
                        ui.showToast("error", "Please fill in required fields");
                        return;
                      }
                      setShippingAddr({ ...newAddr, id: "new", isDefault: false });
                      setShowNewAddr(false);
                      ui.showToast("success", "Address saved");
                    }}
                    className="btn btn-primary"
                  >
                    Use this address
                  </button>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => {
                    if (!shippingAddr) {
                      ui.showToast("error", "Please add a shipping address");
                      return;
                    }
                    if (!auth.user && (!guestEmail || !guestName)) {
                      ui.showToast("error", "Please enter your name and email");
                      return;
                    }
                    setStep("payment");
                  }}
                  className="btn btn-primary"
                >
                  Continue to payment
                </button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div>
              <h2 className="font-display text-2xl mb-6">Payment method</h2>

              <div className="space-y-3 mb-6">
                <PaymentOption
                  active={payment === "card"}
                  onClick={() => setPayment("card")}
                  icon={CreditCard}
                  title="Credit / Debit Card"
                  subtitle="Visa, Mastercard, Amex"
                />
                <PaymentOption
                  active={payment === "apple"}
                  onClick={() => setPayment("apple")}
                  icon={Wallet}
                  title="Apple Pay"
                  subtitle="Fast & secure"
                />
                <PaymentOption
                  active={payment === "google"}
                  onClick={() => setPayment("google")}
                  icon={Wallet}
                  title="Google Pay"
                  subtitle="Fast & secure"
                />
                <PaymentOption
                  active={payment === "cod"}
                  onClick={() => setPayment("cod")}
                  icon={Banknote}
                  title="Cash on Delivery"
                  subtitle="Pay when your order arrives"
                />
              </div>

              {payment === "card" && (
                <div className="space-y-4 p-6 bg-[var(--color-bg-alt)]">
                  <div>
                    <label className="label">Card number</label>
                    <input
                      placeholder="1234 5678 9012 3456"
                      value={card.number}
                      onChange={(e) =>
                        setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16) })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Name on card</label>
                    <input
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Expiry</label>
                      <input
                        placeholder="MM/YY"
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">CVC</label>
                      <input
                        placeholder="123"
                        value={card.cvc}
                        onChange={(e) =>
                          setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })
                        }
                        className="input"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Secured with industry-standard encryption. This is a demo, no real charges.
                  </p>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep("shipping")}
                  className="btn btn-ghost"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => {
                    if (payment === "card" && (card.number.length < 12 || !card.name)) {
                      ui.showToast("error", "Please complete card details");
                      return;
                    }
                    setStep("review");
                  }}
                  className="btn btn-primary"
                >
                  Review order
                </button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div>
              <h2 className="font-display text-2xl mb-6">Review your order</h2>

              <div className="space-y-4 mb-6">
                <div className="p-4 border border-[var(--color-line)]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Shipping to</h3>
                    <button
                      onClick={() => setStep("shipping")}
                      className="text-xs text-[var(--color-gold-dark)] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  {shippingAddr && (
                    <p className="text-sm text-[var(--color-ink-soft)]">
                      {shippingAddr.street}, {shippingAddr.city}, {shippingAddr.state} {shippingAddr.zip}, {shippingAddr.country}
                    </p>
                  )}
                </div>
                <div className="p-4 border border-[var(--color-line)]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Payment</h3>
                    <button
                      onClick={() => setStep("payment")}
                      className="text-xs text-[var(--color-gold-dark)] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-[var(--color-ink-soft)]">
                    {payment === "card"
                      ? `Card ending in ${card.number.slice(-4) || "****"}`
                      : payment === "apple"
                      ? "Apple Pay"
                      : payment === "google"
                      ? "Google Pay"
                      : "Cash on Delivery"}
                  </p>
                </div>
                <div className="p-4 border border-[var(--color-line)]">
                  <h3 className="font-medium mb-3">Items ({cart.count()})</h3>
                  <div className="space-y-3">
                    {cart.items.map((i) => {
                      const p = getProductById(i.productId);
                      if (!p) return null;
                      return (
                        <div key={`${i.productId}-${i.variant}`} className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-[var(--color-bg-alt)] overflow-hidden shrink-0">
                            {p.images[0] && (
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-xs text-[var(--color-ink-muted)]">
                              {i.variant} · Qty {i.quantity}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep("payment")} className="btn btn-ghost">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={onPlaceOrder}
                  disabled={processing}
                  className="btn btn-gold px-8"
                >
                  {processing ? "Processing..." : `Place order · ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-28 self-start">
          <div className="bg-[var(--color-bg-alt)] p-6">
            <h3 className="font-display text-xl mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4 pb-4 border-b border-[var(--color-line)]">
              {cart.items.map((i) => {
                const p = getProductById(i.productId);
                const v = p?.variants.find((v) => v.size === i.variant);
                if (!p || !v) return null;
                return (
                  <div key={`${i.productId}-${i.variant}`} className="flex items-center gap-3 text-sm">
                    <div className="w-12 h-14 bg-[var(--color-bg)] overflow-hidden shrink-0 relative">
                      {p.images[0] && (
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      )}
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-ink)] text-[var(--color-bg)] text-[10px] rounded-full flex items-center justify-center">
                        {i.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{p.name}</p>
                      <p className="text-xs text-[var(--color-ink-muted)]">{i.variant}</p>
                    </div>
                    <span>{formatPrice(v.price * i.quantity)}</span>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-ink-soft)]">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[var(--color-emerald)]">
                  <span>Discount</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--color-ink-soft)]">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-ink-soft)]">Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
            </div>
            <div className="border-t border-[var(--color-line)] mt-4 pt-4 flex justify-between font-display text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepDot({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium",
          done
            ? "bg-[var(--color-emerald)] text-white"
            : active
            ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
            : "bg-[var(--color-bg-alt)] text-[var(--color-ink-muted)]"
        )}
      >
        {done ? <Check className="w-3.5 h-3.5" /> : num}
      </div>
      <span className={cn("text-xs sm:text-sm", active ? "font-medium" : "text-[var(--color-ink-muted)]")}>
        {label}
      </span>
    </div>
  );
}

function PaymentOption({
  active,
  onClick,
  icon: Icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 border transition-colors text-left",
        active
          ? "border-[var(--color-ink)] bg-[var(--color-bg-alt)]"
          : "border-[var(--color-line)] hover:border-[var(--color-ink)]"
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-xs text-[var(--color-ink-muted)]">{subtitle}</p>
      </div>
      <div
        className={cn(
          "w-4 h-4 rounded-full border-2",
          active ? "border-[var(--color-ink)] bg-[var(--color-ink)]" : "border-[var(--color-line)]"
        )}
      />
    </button>
  );
}
