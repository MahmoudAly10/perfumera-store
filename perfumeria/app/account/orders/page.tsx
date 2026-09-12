"use client";

import Link from "next/link";
import { Package, ChevronRight, X } from "lucide-react";
import { useOrders, useUI } from "@/lib/store";
import { formatDate, formatPrice } from "@/lib/utils";

export default function OrdersPage() {
  const orders = useOrders();
  const ui = useUI();

  if (orders.orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 text-[var(--color-ink-muted)] mx-auto mb-4" />
        <h2 className="font-display text-3xl mb-2">No orders yet</h2>
        <p className="text-[var(--color-ink-soft)] mb-6">
          When you place your first order, it will appear here.
        </p>
        <Link href="/shop" className="btn btn-primary inline-flex">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-3xl mb-6">Your orders</h2>
      <div className="space-y-4">
        {orders.orders.map((o) => (
          <div key={o.id} className="border border-[var(--color-line)]">
            <div className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line)] bg-[var(--color-bg-alt)]">
              <div>
                <p className="text-xs eyebrow mb-0.5">Order</p>
                <p className="font-mono text-sm">{o.id}</p>
                <p className="text-xs text-[var(--color-ink-muted)]">{formatDate(o.createdAt)}</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="eyebrow text-xs">Total</p>
                  <p className="font-medium">{formatPrice(o.total)}</p>
                </div>
                <div>
                  <p className="eyebrow text-xs">Status</p>
                  <span
                    className={`text-[10px] tracking-wider uppercase px-2 py-0.5 ${
                      o.status === "delivered"
                        ? "bg-emerald-100 text-emerald-700"
                        : o.status === "shipped"
                        ? "bg-blue-100 text-blue-700"
                        : o.status === "cancelled"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-3">
              {o.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-16 bg-[var(--color-bg-alt)] overflow-hidden shrink-0">
                    {item.image && (
                      <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="eyebrow text-xs">{item.brand}</p>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-[var(--color-ink-muted)]">
                      {item.variant} · Qty {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 sm:p-6 border-t border-[var(--color-line)] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[var(--color-ink-muted)]">
                {o.trackingNumber && o.status !== "cancelled" && (
                  <span>Tracking: <span className="font-mono">{o.trackingNumber}</span></span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {o.status === "processing" && (
                  <button
                    onClick={() => {
                      if (confirm("Cancel this order?")) {
                        orders.cancel(o.id);
                        ui.showToast("success", "Order cancelled");
                      }
                    }}
                    className="btn btn-ghost text-xs"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                )}
                {o.status === "delivered" && (
                  <button className="btn btn-ghost text-xs">Return / Refund</button>
                )}
                <Link href={`/order-confirmation/${o.id}`} className="btn btn-secondary text-xs">
                  View details <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
