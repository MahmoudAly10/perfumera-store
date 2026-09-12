import Link from "next/link";
import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[var(--color-ink)] text-[var(--color-bg)] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-3xl mb-4">Perfumeria</h3>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              A curated world of niche, designer, and Arabic fragrances.
              Authenticity guaranteed, delivered to your door.
            </p>
            <div className="flex gap-3">
              <SocialLink label="IG" href="#" />
              <SocialLink label="FB" href="#" />
              <SocialLink label="TW" href="#" />
              <SocialLink label="YT" href="#" />
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="eyebrow text-[var(--color-gold-light)] mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/shop?category=women" className="text-white/80 hover:text-white">Women</Link></li>
              <li><Link href="/shop?category=men" className="text-white/80 hover:text-white">Men</Link></li>
              <li><Link href="/shop?category=unisex" className="text-white/80 hover:text-white">Unisex</Link></li>
              <li><Link href="/shop?category=niche" className="text-white/80 hover:text-white">Niche</Link></li>
              <li><Link href="/shop?category=arabic" className="text-white/80 hover:text-white">Arabic / Oud</Link></li>
              <li><Link href="/shop?category=gift-sets" className="text-white/80 hover:text-white">Gift Sets</Link></li>
              <li><Link href="/quiz" className="text-white/80 hover:text-white">Find Your Scent</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="eyebrow text-[var(--color-gold-light)] mb-4">Help</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/support" className="text-white/80 hover:text-white">Customer Support</Link></li>
              <li><Link href="/support#faq" className="text-white/80 hover:text-white">FAQ</Link></li>
              <li><Link href="/support#shipping" className="text-white/80 hover:text-white">Shipping & Returns</Link></li>
              <li><Link href="/support#authenticity" className="text-white/80 hover:text-white">Authenticity Guarantee</Link></li>
              <li><Link href="/account/orders" className="text-white/80 hover:text-white">Track Your Order</Link></li>
              <li><Link href="/admin" className="text-white/80 hover:text-white">Admin</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="eyebrow text-[var(--color-gold-light)] mb-4">Stay In The Know</h4>
            <p className="text-sm text-white/70 mb-4">
              New arrivals, scent stories, and members-only sales. No spam.
            </p>
            <form className="flex">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[var(--color-gold-light)]"
                />
              </div>
              <button
                type="button"
                className="px-5 py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] text-white text-xs font-semibold tracking-[0.15em] uppercase"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-white/50 mt-3">
              By subscribing, you agree to our Privacy Policy.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/60">
          <div>© 2026 Perfumeria. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
            <Link href="#" className="hover:text-white">Accessibility</Link>
            <Link href="#" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-9 h-9 border border-white/20 rounded-full flex items-center justify-center hover:bg-[var(--color-gold)] hover:border-[var(--color-gold)] transition-colors text-xs font-medium"
    >
      {label}
    </a>
  );
}
