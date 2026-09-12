"use client";

import { Plus, Edit2, Trash2, Copy } from "lucide-react";
import { PROMO_CODES } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { useUI } from "@/lib/store";

export default function AdminPromotionsPage() {
  const ui = useUI();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Promotions</h1>
        <button className="btn btn-primary text-sm">
          <Plus className="w-4 h-4" /> Create promotion
        </button>
      </div>

      <div className="bg-white border border-[var(--color-line)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--color-ink-muted)] border-b border-[var(--color-line)]">
                <th className="p-4">Code</th>
                <th className="p-4">Description</th>
                <th className="p-4">Type</th>
                <th className="p-4">Value</th>
                <th className="p-4">Min Order</th>
                <th className="p-4">Expires</th>
                <th className="p-4">Uses</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {PROMO_CODES.map((p) => (
                <tr key={p.code} className="border-b border-[var(--color-line)] hover:bg-[var(--color-bg-alt)]">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm bg-[var(--color-bg-alt)] px-2 py-1">
                        {p.code}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(p.code);
                          ui.showToast("success", "Code copied");
                        }}
                        className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{p.description}</td>
                  <td className="p-4 text-sm capitalize">{p.type}</td>
                  <td className="p-4 text-sm font-medium">
                    {p.type === "percent" ? `${p.value}%` : `$${p.value}`}
                  </td>
                  <td className="p-4 text-sm">${p.minOrder}</td>
                  <td className="p-4 text-sm text-[var(--color-ink-muted)]">
                    {formatDate(p.expiresAt)}
                  </td>
                  <td className="p-4 text-sm">{Math.floor(Math.random() * 200) + 5}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-[var(--color-bg)] rounded" aria-label="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 hover:bg-[var(--color-bg)] rounded text-[var(--color-rose)]" aria-label="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
