"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/store";
import { getProductsByIds } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

export default function WishlistPage() {
  const wishlist = useWishlist();
  const products = getProductsByIds(wishlist.ids);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-12 h-12 text-[var(--color-ink-muted)] mx-auto mb-4" />
        <h2 className="font-display text-3xl mb-2">Your wishlist is empty</h2>
        <p className="text-[var(--color-ink-soft)] mb-6">
          Save your favorite fragrances for later. We'll notify you of price drops and restocks.
        </p>
        <Link href="/shop" className="btn btn-primary inline-flex">
          Discover fragrances
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl">Wishlist</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">
          {products.length} item{products.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-10">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
