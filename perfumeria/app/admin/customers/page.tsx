"use client";

import { useState } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

const MOCK_CUSTOMERS = Array.from({ length: 30 }).map((_, i) => ({
  id: `C${1000 + i}`,
  name: ["Sarah L.", "Marcus J.", "Aria K.", "David M.", "Emma J.", "Yuki T.", "Layla A."][i % 7] + (i > 6 ? " " + Math.floor(i / 7) : ""),
  email: `customer${i}@example.com`,
  orders: Math.floor(Math.random() * 12),
  spent: 100 + Math.random() * 2000,
  joined: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
  tier: ["Bronze", "Silver", "Gold"][Math.floor(Math.random() * 3)],
}));

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_CUSTOMERS.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Customers</h1>

      <div className="bg-white border border-[var(--color-line)]">
        <div className="p-4 border-b border-[var(--color-line)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="input pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--color-ink-muted)] border-b border-[var(--color-line)]">
                <th className="p-4">Customer</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Spent</th>
                <th className="p-4">Tier</th>
                <th className="p-4">Joined</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-[var(--color-line)] hover:bg-[var(--color-bg-alt)]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-ink)] text-[var(--color-bg)] flex items-center justify-center text-sm">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-[var(--color-ink-muted)]">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{c.orders}</td>
                  <td className="p-4 text-sm font-medium">{formatPrice(c.spent)}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] tracking-wider uppercase px-2 py-0.5 ${
                        c.tier === "Gold"
                          ? "bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]"
                          : c.tier === "Silver"
                          ? "bg-slate-200 text-slate-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {c.tier}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[var(--color-ink-muted)]">
                    {formatDate(c.joined)}
                  </td>
                  <td className="p-4">
                    <button className="p-1.5 hover:bg-[var(--color-bg)] rounded" aria-label="More">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
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
