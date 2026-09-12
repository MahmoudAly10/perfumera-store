"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
} from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { useCart, useWishlist, useUI } from "@/lib/store";
import { Stars } from "@/components/stars";
import { ProductCard } from "@/components/product-card";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import type { ProductQA, ProductReview } from "@/lib/types";

export default function ProductClient() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const product = slug ? getProductBySlug(slug) : undefined;

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-4xl mb-3">Product not found</h1>
        <Link href="/shop" className="btn btn-primary inline-flex">
          Back to shop
        </Link>
      </div>
    );
  }

  return <ProductView product={product} />;
}

function ProductView({ product }: { product: NonNullable<ReturnType<typeof getProductBySlug>> }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const ui = useUI();

  const [imageIdx, setImageIdx] = useState(0);
  const [variant, setVariant] = useState(product.variants[0].size);
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [tab, setTab] = useState<"description" | "reviews" | "qa">("description");

  const selectedVariant =
    product.variants.find((v) => v.size === variant) ?? product.variants[0];
  const liked = wishlist.has(product.id);
  const related = getRelatedProducts(product, 4);

  const onAdd = () => {
    cart.add(product.id, selectedVariant.size, quantity);
    ui.showToast("success", `${product.name} (${selectedVariant.size}) added to cart`);
  };

  const onBuyNow = () => {
    cart.add(product.id, selectedVariant.size, quantity);
    window.location.href = "/checkout";
  };

  const inStock = selectedVariant.stock > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <nav className="text-xs text-[var(--color-ink-muted)] mb-6 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-[var(--color-ink)]">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[var(--color-ink)]">Shop</Link>
        <span>/</span>
        <Link
          href={`/shop?category=${product.category}`}
          className="hover:text-[var(--color-ink)]"
        >
          {product.category.replace("-", " ")}
        </Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div>
          <div
            className="relative aspect-square bg-[var(--color-bg-alt)] overflow-hidden mb-4 cursor-zoom-in group"
            onClick={() => setZoom(true)}
          >
            <img
              src={product.images[imageIdx]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {product.isBestseller && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-[var(--color-gold)] text-white text-xs tracking-[0.15em] uppercase">
                Bestseller
              </span>
            )}
            {product.isNew && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-[var(--color-emerald)] text-white text-xs tracking-[0.15em] uppercase">
                New
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setImageIdx(i)}
                className={cn(
                  "aspect-square bg-[var(--color-bg-alt)] overflow-hidden border-2 transition-colors",
                  imageIdx === i
                    ? "border-[var(--color-gold)]"
                    : "border-transparent hover:border-[var(--color-line)]"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-1">{product.brand}</p>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-2">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mb-4">
            <Stars rating={product.rating} size={16} />
            <span className="text-sm text-[var(--color-ink-soft)]">
              {product.rating} · {product.reviewCount} reviews
            </span>
          </div>
          <p className="text-2xl font-display mb-6">
            {formatPrice(selectedVariant.price)}
          </p>
          <p className="text-[var(--color-ink-soft)] leading-relaxed mb-6">
            {product.description}
          </p>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="label mb-0">Size</span>
              <span className="text-xs text-[var(--color-ink-muted)]">
                {selectedVariant.stock} in stock
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.size}
                  onClick={() => setVariant(v.size)}
                  className={cn(
                    "px-3 py-3 border text-sm transition-colors",
                    variant === v.size
                      ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-bg)]"
                      : "border-[var(--color-line)] hover:border-[var(--color-ink)]"
                  )}
                >
                  <span className="block font-medium">{v.size}</span>
                  <span className="block text-xs opacity-70">{formatPrice(v.price)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-stretch gap-2 mb-3">
            <div className="flex items-center border border-[var(--color-line)]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-12 flex items-center justify-center hover:bg-[var(--color-bg-alt)]"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-12 flex items-center justify-center hover:bg-[var(--color-bg-alt)]"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={onAdd}
              disabled={!inStock}
              className="btn btn-primary flex-1 disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </button>
            <button
              onClick={() => {
                wishlist.toggle(product.id);
                ui.showToast("info", liked ? "Removed from wishlist" : "Saved to wishlist");
              }}
              className={cn(
                "w-12 flex items-center justify-center border transition-colors",
                liked
                  ? "border-[var(--color-rose)] text-[var(--color-rose)]"
                  : "border-[var(--color-line)] hover:border-[var(--color-rose)] hover:text-[var(--color-rose)]"
              )}
              aria-label="Wishlist"
            >
              <Heart className={cn("w-5 h-5", liked && "fill-current")} />
            </button>
          </div>
          <button
            onClick={onBuyNow}
            disabled={!inStock}
            className="btn btn-secondary w-full mb-6"
          >
            Buy Now
          </button>

          <div className="grid grid-cols-3 gap-2 mb-8 text-center">
            <TrustBadge icon={Truck} label="Free shipping over $75" />
            <TrustBadge icon={ShieldCheck} label="100% Authentic" />
            <TrustBadge icon={RotateCcw} label="30-day returns" />
          </div>

          <div className="border-t border-[var(--color-line)] pt-6 space-y-5">
            <div>
              <h4 className="eyebrow mb-2">Scent family</h4>
              <div className="flex flex-wrap gap-2">
                {product.scentFamily.map((f) => (
                  <Link
                    key={f}
                    href={`/shop?scentFamily=${f}`}
                    className="px-3 py-1 border border-[var(--color-line)] text-xs capitalize hover:border-[var(--color-gold)] hover:text-[var(--color-gold-dark)]"
                  >
                    {f}
                  </Link>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="eyebrow mb-1">Concentration</h4>
                <p>{product.concentration}</p>
              </div>
              <div>
                <h4 className="eyebrow mb-1">Longevity</h4>
                <p>{product.longevity}</p>
              </div>
              <div>
                <h4 className="eyebrow mb-1">Sillage</h4>
                <p>{product.sillage}</p>
              </div>
              <div>
                <h4 className="eyebrow mb-1">For</h4>
                <p className="capitalize">{product.gender}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-20 border-t border-[var(--color-line)] pt-12">
        <div className="flex border-b border-[var(--color-line)] mb-8">
          {[
            { id: "description", label: "Description" },
            { id: "reviews", label: `Reviews (${product.reviewCount})` },
            { id: "qa", label: `Q&A (${product.qa.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={cn(
                "px-6 py-3 text-sm tracking-wider uppercase border-b-2 -mb-px transition-colors",
                tab === t.id
                  ? "border-[var(--color-ink)] font-medium"
                  : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "description" && (
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-display text-2xl mb-3">The story</h3>
              <p className="text-[var(--color-ink-soft)] leading-relaxed mb-6">
                {product.brandStory}
              </p>
              <h3 className="font-display text-2xl mb-3">Fragrance notes</h3>
              <div className="space-y-4">
                <NoteLayer title="Top notes" notes={product.topNotes} />
                <NoteLayer title="Heart notes" notes={product.heartNotes} />
                <NoteLayer title="Base notes" notes={product.baseNotes} />
              </div>
            </div>
            <div>
              <div className="bg-[var(--color-bg-alt)] p-8">
                <h3 className="font-display text-2xl mb-4">The character</h3>
                <p className="text-[var(--color-ink-soft)] leading-relaxed mb-6">
                  {product.description}
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-[var(--color-line)] py-2">
                    <span className="text-[var(--color-ink-muted)]">Family</span>
                    <span className="capitalize">{product.scentFamily.join(", ")}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--color-line)] py-2">
                    <span className="text-[var(--color-ink-muted)]">Concentration</span>
                    <span>{product.concentration}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--color-line)] py-2">
                    <span className="text-[var(--color-ink-muted)]">Longevity</span>
                    <span>{product.longevity}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[var(--color-ink-muted)]">Sillage</span>
                    <span>{product.sillage}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div className="grid md:grid-cols-[1fr_2fr] gap-12">
            <div>
              <div className="text-center p-8 bg-[var(--color-bg-alt)] mb-6">
                <div className="font-display text-6xl mb-2">{product.rating.toFixed(1)}</div>
                <Stars rating={product.rating} size={20} />
                <p className="text-sm text-[var(--color-ink-muted)] mt-2">
                  Based on {product.reviewCount} reviews
                </p>
              </div>
              <RatingBreakdown reviews={product.reviews} />
              <button className="btn btn-secondary w-full mt-6">
                Write a review
              </button>
            </div>
            <div className="space-y-6">
              {product.reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          </div>
        )}

        {tab === "qa" && (
          <div className="max-w-2xl">
            <div className="mb-8 p-6 bg-[var(--color-bg-alt)] flex items-center gap-4">
              <MessageCircle className="w-6 h-6 text-[var(--color-gold-dark)]" />
              <div className="flex-1">
                <h4 className="font-medium mb-1">Have a question?</h4>
                <p className="text-sm text-[var(--color-ink-soft)]">
                  Our fragrance concierge typically responds within 24 hours.
                </p>
              </div>
              <button className="btn btn-secondary">Ask a question</button>
            </div>
            <div className="space-y-4">
              {product.qa.map((q) => (
                <QACard key={q.id} qa={q} />
              ))}
              {product.qa.length === 0 && (
                <p className="text-center text-[var(--color-ink-muted)] py-12">
                  No questions yet. Be the first to ask!
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-20">
          <div className="text-center mb-10">
            <p className="eyebrow mb-2">You may also love</p>
            <h2 className="font-display text-4xl">Similar Scents</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 cursor-zoom-out"
          onClick={() => setZoom(false)}
        >
          <img
            src={product.images[imageIdx]}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

function TrustBadge({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-[var(--color-ink-soft)]">
      <Icon className="w-4 h-4" />
      <span className="text-[10px] tracking-wider uppercase">{label}</span>
    </div>
  );
}

function NoteLayer({ title, notes }: { title: string; notes: string[] }) {
  return (
    <div>
      <p className="eyebrow mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {notes.map((n) => (
          <span
            key={n}
            className="px-2.5 py-1 bg-[var(--color-bg-alt)] text-sm"
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

function RatingBreakdown({ reviews }: { reviews: ProductReview[] }) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const total = reviews.length;
  return (
    <div className="space-y-2">
      {counts.map((c) => (
        <div key={c.star} className="flex items-center gap-2 text-xs">
          <span className="w-8">{c.star} ★</span>
          <div className="flex-1 h-2 bg-[var(--color-line)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-gold)]"
              style={{ width: `${(c.count / Math.max(total, 1)) * 100}%` }}
            />
          </div>
          <span className="w-8 text-right text-[var(--color-ink-muted)]">{c.count}</span>
        </div>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ProductReview }) {
  const [helpful, setHelpful] = useState<"up" | "down" | null>(null);
  return (
    <div className="border-b border-[var(--color-line)] pb-6 last:border-0">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center font-medium">
          {review.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{review.user}</span>
            {review.verified && (
              <span className="text-[10px] tracking-wider uppercase px-1.5 py-0.5 bg-[var(--color-emerald)]/10 text-[var(--color-emerald)]">
                Verified buyer
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Stars rating={review.rating} size={12} />
            <span className="text-xs text-[var(--color-ink-muted)]">
              {formatDate(review.date)}
            </span>
          </div>
        </div>
      </div>
      <h4 className="font-medium mb-1">{review.title}</h4>
      <p className="text-[var(--color-ink-soft)] leading-relaxed mb-3">
        {review.body}
      </p>
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.photos.map((p, i) => (
            <div key={i} className="w-16 h-16 bg-[var(--color-bg-alt)] overflow-hidden">
              <img src={p} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 text-xs text-[var(--color-ink-muted)]">
        <span>Helpful?</span>
        <button
          onClick={() => setHelpful("up")}
          className={cn(
            "flex items-center gap-1 hover:text-[var(--color-ink)]",
            helpful === "up" && "text-[var(--color-emerald)]"
          )}
        >
          <ThumbsUp className="w-3 h-3" /> {review.helpful + (helpful === "up" ? 1 : 0)}
        </button>
        <button
          onClick={() => setHelpful("down")}
          className={cn(
            "flex items-center gap-1 hover:text-[var(--color-ink)]",
            helpful === "down" && "text-[var(--color-rose)]"
          )}
        >
          <ThumbsDown className="w-3 h-3" /> {review.unhelpful + (helpful === "down" ? 1 : 0)}
        </button>
      </div>
    </div>
  );
}

function QACard({ qa }: { qa: ProductQA }) {
  const [open, setOpen] = useState(!!qa.answer);
  return (
    <div className="border border-[var(--color-line)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-[var(--color-bg-alt)]"
      >
        <div className="flex-1 pr-4">
          <p className="text-sm text-[var(--color-ink-muted)] mb-0.5">
            {qa.user} asked · {formatDate(qa.date)}
          </p>
          <p className="font-medium">{qa.question}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
      </button>
      {open && qa.answer && (
        <div className="p-4 border-t border-[var(--color-line)] bg-[var(--color-bg-alt)]">
          <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed mb-2">
            {qa.answer}
          </p>
          <p className="text-xs text-[var(--color-ink-muted)]">
            — {qa.answeredBy}, {formatDate(qa.date)}
          </p>
        </div>
      )}
    </div>
  );
}
