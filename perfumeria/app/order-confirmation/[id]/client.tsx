"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Package, Truck, Mail, Download } from "lucide-react";
import { useOrders } from "@/lib/store";
import { formatDate, formatPrice } from "@/lib/utils";

export default function OrderConfirmationClient() {
  const params = useParams<{ id: string }>();
  const orders = useOrders();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="max-w-3xl mx-auto px-4 py-24 text-center">Loading...</div>;
  }

  const order = orders.getById(params.id);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-4xl mb-3">Order not found</h1>
        <p className="text-[var(--color-ink-soft)] mb-6">
          We couldn't find this order. It may have been placed in a different session.
        </p>
        <Link href="/account/orders" className="btn btn-primary inline-flex">
          View your orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-emerald)]/10 flex items-center justify-center">
          <Check className="w-8 h-8 text-[var(--color-emerald)]" strokeWidth={3} />
        </div>
        <h1 className="font-display text-5xl mb-2">Thank you!</h1>
        <p className="text-lg text-[var(--color-ink-soft)]">
          Your order has been received and is being processed.
        </p>
        <p className="text-sm text-[var(--color-ink-muted)] mt-2">
          Order <span className="font-mono">{order.id}</span> ·{" "}
          {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="bg-[var(--color-bg-alt)] p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <TimelineStep icon={Check} label="Order placed" active done />
          <div className="flex-1 h-px bg-[var(--color-emerald)] mx-2" />
          <TimelineStep icon={Package} label="Processing" active done />
          <div className="flex-1 h-px bg-[var(--color-line)] mx-2" />
          <TimelineStep icon={Truck} label="Shipped" />
          <div className="flex-1 h-px bg-[var(--color-line)] mx-2" />
          <TimelineStep icon={Check} label="Delivered" />
        </div>
      </div>

      <div className="border border-[var(--color-line)] mb-8">
        <div className="p-6 border-b border-[var(--color-line)]">
          <h2 className="font-display text-2xl">Your order</h2>
        </div>
        <div className="divide-y divide-[var(--color-line)]">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-6">
              <div className="w-16 h-20 bg-[var(--color-bg-alt)] overflow-hidden shrink-0">
                {item.image && (
                  <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="eyebrow">{item.brand}</p>
                <p className="font-display text-lg">{item.productName}</p>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  {item.variant} · Qty {item.quantity}
                </p>
              </div>
              <span className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="p-6 bg-[var(--color-bg-alt)] space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-ink-soft)]">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-[var(--color-emerald)]">
              <span>Discount ({order.promoCode})</span>
              <span>−{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[var(--color-ink-soft)]">Shipping</span>
            <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-ink-soft)]">Tax</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between font-display text-lg pt-2 border-t border-[var(--color-line)]">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="p-4 border border-[var(--color-line)]">
          <p className="eyebrow mb-2">Shipping to</p>
          <p className="text-sm">
            {order.shippingAddress.street}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
            {order.shippingAddress.country}
          </p>
        </div>
        <div className="p-4 border border-[var(--color-line)]">
          <p className="eyebrow mb-2">Payment</p>
          <p className="text-sm">{order.paymentMethod}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/account/orders" className="btn btn-primary flex-1">
          View all orders
        </Link>
        <Link href="/shop" className="btn btn-secondary flex-1">
          Continue shopping
        </Link>
        <button className="btn btn-ghost">
          <Download className="w-4 h-4" /> Invoice
        </button>
      </div>

      <div className="mt-12 p-6 bg-[var(--color-bg-alt)] text-center text-sm text-[var(--color-ink-soft)]">
        <Mail className="w-4 h-4 inline-block mr-1 -mt-0.5" />
        A confirmation email has been sent to your inbox. Free samples included!
      </div>
    </div>
  );
}

function TimelineStep({
  icon: Icon,
  label,
  active,
  done,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
          done
            ? "bg-[var(--color-emerald)] text-white"
            : active
            ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
            : "bg-[var(--color-bg)] border border-[var(--color-line)] text-[var(--color-ink-muted)]"
        }`}
      >
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>
      <span
        className={`text-[10px] sm:text-xs ${
          active || done ? "font-medium" : "text-[var(--color-ink-muted)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
