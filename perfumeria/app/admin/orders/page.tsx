"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

const MOCK_ORDERS = Array.from({ length: 50 }).map((_, i) => ({
  id: `PRF-${2000 + i}`,
  customer: ["Sarah L.", "Marcus J.", "Aria K.", "David M.", "Emma J."][i % 5],
  email: `customer${i}@example.com`,
  total: 50 + Math.random() * 500,
  status: ["processing", "shipped", "delivered", "cancelled"][Math.floor(Math.random() * 4)],
  payment: ["Card", "Apple Pay", "Google Pay", "COD"][Math.floor(Math.random() * 4)],
  items: 1 + Math.floor(Math.random() * 4),
  createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
}));

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = MOCK_ORDERS.filter((o) => {
    if (status !== "all" && o.status !== status) return false;
    if (
      search &&
      !o.id.toLowerCase().includes(search.toLowerCase()) &&
      !o.customer.toLowerCase().includes(search.toLowerCase()) &&
      !o.email.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Orders</h1>

      <div className="bg-white border border-[var(--color-line)]">
        <div className="p-4 border-b border-[var(--color-line)] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders, customer name, or email..."
              className="input pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input sm:w-48"
          >
            <option value="all">All statuses</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--color-ink-muted)] border-b border-[var(--color-line)]">
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-[var(--color-line)] hover:bg-[var(--color-bg-alt)]">
                  <td className="p-4 font-mono text-xs">{o.id}</td>
                  <td className="p-4">
                    <p className="text-sm font-medium">{o.customer}</p>
                    <p className="text-xs text-[var(--color-ink-muted)]">{o.email}</p>
                  </td>
                  <td className="p-4 text-sm">{o.items}</td>
                  <td className="p-4 text-sm font-medium">{formatPrice(o.total)}</td>
                  <td className="p-4 text-sm">{o.payment}</td>
                  <td className="p-4">
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
                  </td>
                  <td className="p-4 text-sm text-[var(--color-ink-muted)]">
                    {formatDate(o.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
