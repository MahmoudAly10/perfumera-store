"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, ShoppingBag, User, Heart, Menu, X } from "lucide-react";
import { useCart, useWishlist, useUI, useAuth } from "@/lib/store";
import { CATEGORIES } from "@/lib/data";

export function Header() {
  const cart = useCart();
  const wishlist = useWishlist();
  const ui = useUI();
  const auth = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-[var(--color-ink)] text-[var(--color-bg)] py-2 overflow-hidden">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0">
              <span className="px-6 text-xs tracking-[0.2em] uppercase">
                Free shipping on US orders over $75
                <span className="divider-dot"></span>
                Authenticity guaranteed
                <span className="divider-dot"></span>
                30-day easy returns
                <span className="divider-dot"></span>
                New: Arabic Oud Collection now in
                <span className="divider-dot"></span>
                Use code SCENT20 for 20% off orders over $150
                <span className="divider-dot"></span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 bg-[var(--color-bg)]/95 backdrop-blur-sm transition-all ${
          scrolled ? "border-b border-[var(--color-line)]" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => ui.setMobileMenu(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-2xl tracking-tight">
                Perfumeria
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8 text-sm">
              <Link
                href="/shop"
                className="text-[var(--color-ink)] hover:text-[var(--color-gold-dark)] transition-colors"
              >
                Shop All
              </Link>
              {CATEGORIES.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${c.id}`}
                  className="text-[var(--color-ink)] hover:text-[var(--color-gold-dark)] transition-colors"
                >
                  {c.label}
                </Link>
              ))}
              <Link
                href="/quiz"
                className="text-[var(--color-rose)] hover:text-[var(--color-rose)] transition-colors font-medium"
              >
                Find Your Scent
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => ui.setSearchOpen(true)}
                className="p-2 hover:text-[var(--color-gold-dark)] transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link
                href="/account/wishlist"
                className="hidden sm:flex p-2 hover:text-[var(--color-gold-dark)] transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.count() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[var(--color-rose)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.count()}
                  </span>
                )}
              </Link>
              <Link
                href={auth.user ? "/account" : "/login"}
                className="hidden sm:flex p-2 hover:text-[var(--color-gold-dark)] transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>
              <button
                onClick={() => ui.setMobileMenu(true)}
                className="hidden"
                aria-label="Cart"
              />
              <CartButton />
            </div>
          </div>
        </div>
      </header>

      <MobileMenu />
    </>
  );
}

function CartButton() {
  const cart = useCart();
  return (
    <button
      onClick={() => {
        // Trigger a custom event for the cart drawer
        window.dispatchEvent(new CustomEvent("open-cart"));
      }}
      className="p-2 hover:text-[var(--color-gold-dark)] transition-colors relative"
      aria-label="Cart"
    >
      <ShoppingBag className="w-5 h-5" />
      {cart.count() > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-[var(--color-gold)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
          {cart.count()}
        </span>
      )}
    </button>
  );
}

function MobileMenu() {
  const ui = useUI();
  const auth = useAuth();

  if (!ui.mobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => ui.setMobileMenu(false)}
      />
      <div className="absolute top-0 left-0 right-0 bg-[var(--color-bg)] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="font-display text-2xl">Menu</span>
            <button
              onClick={() => ui.setMobileMenu(false)}
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-1">
            <Link
              href="/shop"
              onClick={() => ui.setMobileMenu(false)}
              className="block py-3 text-lg font-display border-b border-[var(--color-line)]"
            >
              Shop All
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.id}`}
                onClick={() => ui.setMobileMenu(false)}
                className="block py-3 text-lg font-display border-b border-[var(--color-line)]"
              >
                {c.label}
              </Link>
            ))}
            <Link
              href="/quiz"
              onClick={() => ui.setMobileMenu(false)}
              className="block py-3 text-lg font-display border-b border-[var(--color-line)] text-[var(--color-rose)]"
            >
              Find Your Scent
            </Link>
            <Link
              href="/account/wishlist"
              onClick={() => ui.setMobileMenu(false)}
              className="block py-3 text-lg font-display border-b border-[var(--color-line)]"
            >
              Wishlist
            </Link>
            <Link
              href={auth.user ? "/account" : "/login"}
              onClick={() => ui.setMobileMenu(false)}
              className="block py-3 text-lg font-display border-b border-[var(--color-line)]"
            >
              {auth.user ? "My Account" : "Sign In"}
            </Link>
            <Link
              href="/admin"
              onClick={() => ui.setMobileMenu(false)}
              className="block py-3 text-lg font-display text-[var(--color-gold-dark)]"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
