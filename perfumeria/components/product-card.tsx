"use client";

import Link from "next/link";
import { Heart, Star, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { useWishlist, useCart, useUI } from "@/lib/store";
import { formatPrice, getStartingPrice, starArray } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className }: Props) {
  const wishlist = useWishlist();
  const cart = useCart();
  const ui = useUI();
  const liked = wishlist.has(product.id);
  const starting = getStartingPrice(product);
  const stars = starArray(product.rating);

  const onQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const v = product.variants[0];
    cart.add(product.id, v.size, 1);
    ui.showToast("success", `${product.name} added to cart`);
  };

  const onLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    wishlist.toggle(product.id);
    ui.showToast("info", liked ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn("group block relative", className)}
    >
      <div className="relative aspect-[3/4] bg-[var(--color-bg-alt)] overflow-hidden mb-3">
        {product.images[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew && (
            <span className="px-2 py-1 bg-[var(--color-emerald)] text-white text-[10px] tracking-[0.15em] uppercase">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="px-2 py-1 bg-[var(--color-gold)] text-white text-[10px] tracking-[0.15em] uppercase">
              Bestseller
            </span>
          )}
          {product.isOnSale && (
            <span className="px-2 py-1 bg-[var(--color-rose)] text-white text-[10px] tracking-[0.15em] uppercase">
              Sale
            </span>
          )}
        </div>

        {/* Like button */}
        <button
          onClick={onLike}
          className="absolute top-3 right-3 w-9 h-9 bg-[var(--color-bg)]/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[var(--color-bg)] transition-colors"
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              liked ? "fill-[var(--color-rose)] text-[var(--color-rose)]" : "text-[var(--color-ink)]"
            )}
          />
        </button>

        {/* Quick add */}
        <button
          onClick={onQuickAdd}
          className="absolute bottom-3 left-3 right-3 bg-[var(--color-ink)] text-[var(--color-bg)] py-2.5 text-xs tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-oud)] flex items-center justify-center gap-2"
        >
          <Plus className="w-3 h-3" /> Quick Add
        </button>
      </div>

      <div>
        <p className="eyebrow">{product.brand}</p>
        <h3 className="font-display text-lg leading-tight mt-0.5 group-hover:text-[var(--color-gold-dark)] transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          {stars.map((s, i) => (
            <Star
              key={i}
              className={cn(
                "w-3 h-3",
                s === "empty" ? "star-empty fill-current" : "star fill-current"
              )}
            />
          ))}
          <span className="text-xs text-[var(--color-ink-muted)] ml-1">
            ({product.reviewCount})
          </span>
        </div>
        <p className="mt-2 font-medium">
          {formatPrice(starting)}
          {product.variants.length > 1 && (
            <span className="text-xs text-[var(--color-ink-muted)] ml-1">
              · from
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
