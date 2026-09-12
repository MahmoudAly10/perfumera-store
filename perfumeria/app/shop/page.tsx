"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import {
  PRODUCTS,
  CATEGORIES,
  SCENT_FAMILIES,
  BRANDS,
  getMinMaxPrice,
} from "@/lib/data";
import type { ScentFamily, Concentration } from "@/lib/types";
import { cn } from "@/lib/utils";

function ShopPageInner() {
  const params = useSearchParams();
  const initialCategory = params.get("category");
  const initialBrand = params.get("brand");
  const initialScent = params.get("scentFamily");
  const initialSort = params.get("sort");

  const [category, setCategory] = useState<string | null>(initialCategory);
  const [brands, setBrands] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [scentFamilies, setScentFamilies] = useState<string[]>(
    initialScent ? [initialScent] : []
  );
  const [concentrations, setConcentrations] = useState<string[]>([]);
  const [genders, setGenders] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const { min, max } = getMinMaxPrice();
  const [priceRange, setPriceRange] = useState<[number, number]>([min, max]);
  const [sort, setSort] = useState(initialSort || "featured");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const c = params.get("category");
    const b = params.get("brand");
    const s = params.get("scentFamily");
    const so = params.get("sort");
    if (c) setCategory(c);
    if (b) setBrands([b]);
    if (s) setScentFamilies([s]);
    if (so) setSort(so);
  }, [params]);

  const filtered = useMemo(() => {
    let out = PRODUCTS.slice();
    if (category) out = out.filter((p) => p.category === category);
    if (brands.length) out = out.filter((p) => brands.includes(p.brand));
    if (scentFamilies.length)
      out = out.filter((p) => p.scentFamily.some((s) => scentFamilies.includes(s)));
    if (concentrations.length)
      out = out.filter((p) => concentrations.includes(p.concentration));
    if (genders.length) out = out.filter((p) => genders.includes(p.gender));
    if (sizes.length)
      out = out.filter((p) => p.variants.some((v) => sizes.includes(v.size)));
    if (minRating > 0) out = out.filter((p) => p.rating >= minRating);
    out = out.filter((p) => {
      const lo = Math.min(...p.variants.map((v) => v.price));
      return lo >= priceRange[0] && lo <= priceRange[1];
    });

    if (sort === "price-asc") out.sort((a, b) => getMin(a) - getMin(b));
    else if (sort === "price-desc") out.sort((a, b) => getMin(b) - getMin(a));
    else if (sort === "rating") out.sort((a, b) => b.rating - a.rating);
    else if (sort === "new") out.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    else if (sort === "bestsellers")
      out.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    return out;
  }, [category, brands, scentFamilies, concentrations, genders, sizes, minRating, priceRange, sort]);

  const getMin = (p: typeof PRODUCTS[number]) =>
    Math.min(...p.variants.map((v) => v.price));

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const clearAll = () => {
    setCategory(null);
    setBrands([]);
    setScentFamilies([]);
    setConcentrations([]);
    setGenders([]);
    setSizes([]);
    setMinRating(0);
    setPriceRange([min, max]);
  };

  const activeFilters = [
    ...(category ? [{ label: CATEGORIES.find((c) => c.id === category)?.label || category, clear: () => setCategory(null) }] : []),
    ...brands.map((b) => ({ label: b, clear: () => setBrands(brands.filter((x) => x !== b)) })),
    ...scentFamilies.map((s) => ({ label: SCENT_FAMILIES.find((f) => f.id === s)?.label || s, clear: () => setScentFamilies(scentFamilies.filter((x) => x !== s)) })),
    ...concentrations.map((c) => ({ label: c, clear: () => setConcentrations(concentrations.filter((x) => x !== c)) })),
    ...genders.map((g) => ({ label: g, clear: () => setGenders(genders.filter((x) => x !== g)) })),
    ...sizes.map((s) => ({ label: s, clear: () => setSizes(sizes.filter((x) => x !== s)) })),
  ];

  const categoryTitle = category
    ? CATEGORIES.find((c) => c.id === category)?.label
    : "All Fragrances";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="eyebrow mb-2">Shop</p>
        <h1 className="font-display text-5xl mb-3">{categoryTitle}</h1>
        <p className="text-[var(--color-ink-soft)] max-w-2xl">
          {category
            ? CATEGORIES.find((c) => c.id === category)?.description
            : "Explore our complete collection of curated fragrances."}
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setFilterOpen(true)}
          className="lg:hidden btn btn-secondary"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
          {activeFilters.length > 0 && (
            <span className="ml-1 bg-[var(--color-gold)] text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </button>
        <div className="hidden lg:block text-sm text-[var(--color-ink-soft)]">
          {filtered.length} product{filtered.length === 1 ? "" : "s"}
        </div>
        <div className="flex items-center gap-3">
          <label className="hidden sm:block text-sm text-[var(--color-ink-soft)]">
            Sort by
          </label>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-transparent border border-[var(--color-line)] pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="new">New arrivals</option>
              <option value="bestsellers">Bestsellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeFilters.map((f, i) => (
            <button
              key={i}
              onClick={f.clear}
              className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-bg-alt)] border border-[var(--color-line)] text-xs"
            >
              {f.label}
              <X className="w-3 h-3" />
            </button>
          ))}
          <button
            onClick={clearAll}
            className="text-xs text-[var(--color-rose)] hover:underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <FilterPanel
            category={category}
            setCategory={setCategory}
            brands={brands}
            toggleBrand={(b) => toggle(brands, b, setBrands)}
            scentFamilies={scentFamilies}
            toggleScent={(s) => toggle(scentFamilies, s, setScentFamilies)}
            concentrations={concentrations}
            toggleConc={(c) => toggle(concentrations, c, setConcentrations)}
            genders={genders}
            toggleGender={(g) => toggle(genders, g, setGenders)}
            sizes={sizes}
            toggleSize={(s) => toggle(sizes, s, setSizes)}
            minRating={minRating}
            setMinRating={setMinRating}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            min={min}
            max={max}
            clearAll={clearAll}
          />
        </aside>

        {/* Mobile filter drawer */}
        {filterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setFilterOpen(false)}
            />
            <div className="absolute top-0 left-0 right-0 max-h-[90vh] overflow-y-auto bg-[var(--color-bg)] p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-2xl">Filters</span>
                <button onClick={() => setFilterOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <FilterPanel
                category={category}
                setCategory={setCategory}
                brands={brands}
                toggleBrand={(b) => toggle(brands, b, setBrands)}
                scentFamilies={scentFamilies}
                toggleScent={(s) => toggle(scentFamilies, s, setScentFamilies)}
                concentrations={concentrations}
                toggleConc={(c) => toggle(concentrations, c, setConcentrations)}
                genders={genders}
                toggleGender={(g) => toggle(genders, g, setGenders)}
                sizes={sizes}
                toggleSize={(s) => toggle(sizes, s, setSizes)}
                minRating={minRating}
                setMinRating={setMinRating}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                min={min}
                max={max}
                clearAll={clearAll}
              />
              <button
                onClick={() => setFilterOpen(false)}
                className="btn btn-primary w-full mt-6"
              >
                Show {filtered.length} results
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div>
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-display text-3xl mb-3">No matches</p>
              <p className="text-[var(--color-ink-soft)] mb-6">
                Try adjusting your filters to find what you're looking for.
              </p>
              <button onClick={clearAll} className="btn btn-secondary">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-10">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FilterPanelProps {
  category: string | null;
  setCategory: (c: string | null) => void;
  brands: string[];
  toggleBrand: (b: string) => void;
  scentFamilies: string[];
  toggleScent: (s: string) => void;
  concentrations: string[];
  toggleConc: (c: string) => void;
  genders: string[];
  toggleGender: (g: string) => void;
  sizes: string[];
  toggleSize: (s: string) => void;
  minRating: number;
  setMinRating: (n: number) => void;
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
  min: number;
  max: number;
  clearAll: () => void;
}

function FilterPanel({
  category,
  setCategory,
  brands,
  toggleBrand,
  scentFamilies,
  toggleScent,
  concentrations,
  toggleConc,
  genders,
  toggleGender,
  sizes,
  toggleSize,
  minRating,
  setMinRating,
  priceRange,
  setPriceRange,
  min,
  max,
  clearAll,
}: FilterPanelProps) {
  const allConcentrations: Concentration[] = ["Parfum", "EDP", "EDT", "EDC", "Body Mist"];
  const allSizes = ["30ml", "50ml", "100ml", "12ml"];
  const allGenders = ["men", "women", "unisex"];

  return (
    <div className="space-y-6 text-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-line)]">
        <h3 className="font-display text-xl">Refine</h3>
        <button
          onClick={clearAll}
          className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] uppercase tracking-wider"
        >
          Clear
        </button>
      </div>

      <FilterGroup title="Category">
        <ul className="space-y-1.5">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setCategory(category === c.id ? null : c.id)}
                className={cn(
                  "w-full text-left px-2 py-1.5 hover:bg-[var(--color-bg-alt)]",
                  category === c.id && "bg-[var(--color-bg-alt)] text-[var(--color-gold-dark)] font-medium"
                )}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Gender">
        <div className="space-y-1.5">
          {allGenders.map((g) => (
            <Checkbox
              key={g}
              label={g.charAt(0).toUpperCase() + g.slice(1)}
              checked={genders.includes(g)}
              onChange={() => toggleGender(g)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Scent family">
        <div className="space-y-1.5">
          {SCENT_FAMILIES.map((f) => (
            <Checkbox
              key={f.id}
              label={`${f.emoji} ${f.label}`}
              checked={scentFamilies.includes(f.id)}
              onChange={() => toggleScent(f.id)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Brand">
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
          {BRANDS.map((b) => (
            <Checkbox
              key={b.id}
              label={b.name}
              checked={brands.includes(b.name)}
              onChange={() => toggleBrand(b.name)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Concentration">
        <div className="space-y-1.5">
          {allConcentrations.map((c) => (
            <Checkbox
              key={c}
              label={c}
              checked={concentrations.includes(c)}
              onChange={() => toggleConc(c)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="space-y-1.5">
          {allSizes.map((s) => (
            <Checkbox
              key={s}
              label={s}
              checked={sizes.includes(s)}
              onChange={() => toggleSize(s)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="w-full accent-[var(--color-gold)]"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-[var(--color-gold)]"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Rating">
        <div className="space-y-1.5">
          {[4.5, 4, 3.5, 3].map((r) => (
            <label
              key={r}
              className="flex items-center gap-2 cursor-pointer hover:text-[var(--color-gold-dark)]"
            >
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => setMinRating(r)}
                className="accent-[var(--color-gold)]"
              />
              <span>{r}+ stars</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rating"
              checked={minRating === 0}
              onChange={() => setMinRating(0)}
              className="accent-[var(--color-gold)]"
            />
            <span>Any rating</span>
          </label>
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="eyebrow mb-3">{title}</h4>
      {children}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer hover:text-[var(--color-gold-dark)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 accent-[var(--color-gold)]"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
      <ShopPageInner />
    </Suspense>
  );
}
