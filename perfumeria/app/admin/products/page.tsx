"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, AlertCircle } from "lucide-react";
import { PRODUCTS } from "@/lib/data";
import { formatPrice, getTotalStock } from "@/lib/utils";

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = PRODUCTS.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (
      search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.brand.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Products</h1>
        <button className="btn btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      <div className="bg-white border border-[var(--color-line)]">
        <div className="p-4 border-b border-[var(--color-line)] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input sm:w-48"
          >
            <option value="all">All categories</option>
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="unisex">Unisex</option>
            <option value="niche">Niche</option>
            <option value="arabic">Arabic / Oud</option>
            <option value="gift-sets">Gift Sets</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--color-ink-muted)] border-b border-[var(--color-line)]">
                <th className="p-4">Product</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Rating</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const stock = getTotalStock(p);
                const minPrice = Math.min(...p.variants.map((v) => v.price));
                const lowStock = stock < 15;
                return (
                  <tr key={p.id} className="border-b border-[var(--color-line)] hover:bg-[var(--color-bg-alt)]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-[var(--color-bg-alt)] overflow-hidden shrink-0">
                          {p.images[0] && (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-[var(--color-ink-muted)]">{p.concentration}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{p.brand}</td>
                    <td className="p-4 text-sm capitalize">{p.category.replace("-", " ")}</td>
                    <td className="p-4 text-sm font-medium">{formatPrice(minPrice)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {lowStock && <AlertCircle className="w-3.5 h-3.5 text-[var(--color-amber)]" />}
                        <span className={`text-sm ${lowStock ? "text-[var(--color-amber)] font-medium" : ""}`}>
                          {stock}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">★ {p.rating}</td>
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
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 text-sm text-[var(--color-ink-muted)] border-t border-[var(--color-line)]">
          Showing {filtered.length} of {PRODUCTS.length} products
        </div>
      </div>
    </div>
  );
}
