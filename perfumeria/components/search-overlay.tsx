"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, TrendingUp } from "lucide-react";
import { useUI } from "@/lib/store";
import { PRODUCTS, SCENT_FAMILIES } from "@/lib/data";
import { formatPrice, getStartingPrice } from "@/lib/utils";

const POPULAR = ["Oud", "Rose", "Vanilla", "Saffron", "Vetiver", "Jasmine", "Cedar"];

export function SearchOverlay() {
  const ui = useUI();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!ui.searchOpen) setQuery("");
  }, [ui.searchOpen]);

  useEffect(() => {
    if (!ui.searchOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && ui.setSearchOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ui, ui.searchOpen]);

  // Simple typo-tolerant search: lowercase, partial match across name/brand/notes
  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    return PRODUCTS.filter((p) => {
      const haystack = [
        p.name,
        p.brand,
        ...p.topNotes,
        ...p.heartNotes,
        ...p.baseNotes,
        ...p.scentFamily,
        p.description,
      ]
        .join(" ")
        .toLowerCase();
      // Subsequence match for typo tolerance
      let qi = 0;
      for (let i = 0; i < haystack.length && qi < q.length; i++) {
        if (haystack[i] === q[qi]) qi++;
      }
      if (qi === q.length) return true;
      // Fallback to substring
      return haystack.includes(q);
    }).slice(0, 8);
  }, [query]);

  if (!ui.searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg)]/95 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-4 pt-24">
        <div className="flex items-center justify-between mb-6">
          <span className="font-display text-2xl">Search</span>
          <button
            onClick={() => ui.setSearchOpen(false)}
            aria-label="Close search"
            className="p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-ink-muted)]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, brand, or note (e.g. oud, rose, vetiver)"
            className="w-full pl-12 pr-4 py-4 bg-transparent border-b-2 border-[var(--color-ink)] text-xl font-display focus:outline-none"
          />
        </div>

        {query.trim().length < 2 ? (
          <div className="mt-12 space-y-8">
            <div>
              <h3 className="eyebrow mb-4 flex items-center gap-2">
                <TrendingUp className="w-3 h-3" /> Popular searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((p) => (
                  <button
                    key={p}
                    onClick={() => setQuery(p)}
                    className="px-4 py-2 border border-[var(--color-line)] text-sm hover:border-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="eyebrow mb-4">Browse by scent family</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SCENT_FAMILIES.map((f) => (
                  <Link
                    key={f.id}
                    href={`/shop?scentFamily=${f.id}`}
                    onClick={() => ui.setSearchOpen(false)}
                    className="p-4 border border-[var(--color-line)] hover:border-[var(--color-gold)] transition-colors"
                  >
                    <div className="text-2xl mb-1">{f.emoji}</div>
                    <div className="font-medium">{f.label}</div>
                    <div className="text-xs text-[var(--color-ink-muted)] mt-1">{f.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="mt-8 space-y-2">
            <p className="text-xs text-[var(--color-ink-muted)] uppercase tracking-wider">
              {results.length} result{results.length === 1 ? "" : "s"}
            </p>
            {results.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                onClick={() => ui.setSearchOpen(false)}
                className="flex items-center gap-4 p-3 hover:bg-[var(--color-bg-alt)] transition-colors"
              >
                <div className="w-14 h-16 bg-[var(--color-bg-alt)] shrink-0 overflow-hidden">
                  {p.images[0] && (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs eyebrow">{p.brand}</p>
                  <p className="font-display text-lg truncate">{p.name}</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    {p.concentration} · {p.scentFamily.slice(0, 2).join(" · ")}
                  </p>
                </div>
                <span className="font-medium">{formatPrice(getStartingPrice(p))}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <p className="font-display text-2xl">No results for "{query}"</p>
            <p className="text-sm text-[var(--color-ink-soft)] mt-2">
              Try a different keyword, or browse by scent family.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
