import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS, CATEGORIES, BRANDS, SCENT_FAMILIES } from "@/lib/data";

export default function HomePage() {
  const featured = PRODUCTS.filter((p) => p.isFeatured).slice(0, 4);
  const bestsellers = PRODUCTS.filter((p) => p.isBestseller).slice(0, 4);
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 4);
  const arabic = PRODUCTS.filter((p) => p.category === "arabic").slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[90vh] min-h-[600px] max-h-[900px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/banners/0.jpg"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl text-white fade-up">
            <p className="eyebrow text-[var(--color-gold-light)] mb-4">
              Autumn Collection 2026
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6">
              A Library of <em className="text-[var(--color-gold-light)] not-italic">Scent</em>
            </h1>
            <p className="text-lg sm:text-xl text-white/85 mb-8 max-w-lg leading-relaxed">
              Curated niche, designer, and Arabic fragrances. Authenticity
              guaranteed, delivered to your door.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="btn bg-white text-[var(--color-ink)] hover:bg-[var(--color-gold-light)] border-white hover:border-[var(--color-gold-light)]"
              >
                Shop the Collection
              </Link>
              <Link
                href="/quiz"
                className="btn border-white/40 text-white hover:bg-white hover:text-[var(--color-ink)]"
              >
                Find Your Scent
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-xs tracking-[0.3em] uppercase flex flex-col items-center gap-2">
          <span>Discover</span>
          <div className="w-px h-8 bg-white/30" />
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-[var(--color-line)] bg-[var(--color-bg-alt)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <TrustItem icon={ShieldCheck} title="100% Authentic" desc="Certificate of authenticity" />
            <TrustItem icon={Truck} title="Free Shipping" desc="On US orders over $75" />
            <TrustItem icon={RotateCcw} title="30-Day Returns" desc="Easy & hassle-free" />
            <TrustItem icon={Sparkles} title="Free Samples" desc="With every order" />
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">Explore by category</p>
          <h2 className="font-display text-4xl sm:text-5xl">Find Your World</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.id}`}
              className="group relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-alt)]"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                style={{
                  backgroundImage: `url(/categories/${(CATEGORIES.indexOf(cat) % 10)}.jpg)`,
                }}
              />
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
                <p className="eyebrow text-[var(--color-gold-light)] mb-1">
                  {cat.icon}
                </p>
                <h3 className="font-display text-2xl text-white">{cat.label}</h3>
                <p className="text-xs text-white/70 mt-1 hidden sm:block">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow mb-2">Editor's Picks</p>
            <h2 className="font-display text-4xl">Featured Collection</h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-1 text-sm text-[var(--color-ink)] hover:text-[var(--color-gold-dark)] transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Story / Editorial split */}
      <section className="bg-[var(--color-oud)] text-white my-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] bg-[var(--color-bg-alt)] overflow-hidden">
            <img
              src="/banners/3.jpg"
              alt="Oud"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="eyebrow text-[var(--color-gold-light)] mb-4">
              The Arabic Oud Collection
            </p>
            <h2 className="font-display text-4xl sm:text-5xl leading-tight mb-6">
              Tradition Distilled to Its Purest Form
            </h2>
            <p className="text-white/80 leading-relaxed mb-8 max-w-lg">
              From Abu Dhabi to Damascus, our oud collection honors centuries of
              Arabian perfumery. Each fragrance is composed in collaboration
              with master distillers using the finest Cambodian and Indian
              agarwood.
            </p>
            <Link
              href="/shop?category=arabic"
              className="btn border-[var(--color-gold-light)] text-[var(--color-gold-light)] hover:bg-[var(--color-gold-light)] hover:text-[var(--color-oud)]"
            >
              Explore the Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Best-sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow mb-2">Most loved</p>
            <h2 className="font-display text-4xl">Bestsellers</h2>
          </div>
          <Link
            href="/shop?sort=bestsellers"
            className="hidden sm:flex items-center gap-1 text-sm text-[var(--color-ink)] hover:text-[var(--color-gold-dark)] transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Scent Family quiz banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden bg-[var(--color-bg-alt)] p-8 sm:p-12 lg:p-16">
          <div className="absolute inset-0 bg-pattern opacity-50" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="eyebrow mb-3">Personalized Discovery</p>
              <h2 className="font-display text-4xl sm:text-5xl leading-tight mb-4">
                Find Your Signature Scent
              </h2>
              <p className="text-[var(--color-ink-soft)] leading-relaxed mb-6 max-w-md">
                Answer 5 quick questions about your preferences, mood, and
                occasion. We'll match you with your perfect fragrance.
              </p>
              <Link href="/quiz" className="btn btn-primary">
                Take the Quiz
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 justify-center md:justify-end">
              {SCENT_FAMILIES.slice(0, 6).map((f) => (
                <div
                  key={f.id}
                  className="bg-[var(--color-bg)] border border-[var(--color-line)] px-5 py-3 flex flex-col items-center min-w-[100px] hover:border-[var(--color-gold)] transition-colors"
                >
                  <span className="text-2xl mb-1">{f.emoji}</span>
                  <span className="text-xs font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow mb-2">Just landed</p>
            <h2 className="font-display text-4xl">New Arrivals</h2>
          </div>
          <Link
            href="/shop?sort=new"
            className="hidden sm:flex items-center gap-1 text-sm text-[var(--color-ink)] hover:text-[var(--color-gold-dark)] transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[var(--color-line)]">
        <p className="eyebrow text-center mb-8">Houses we carry</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {BRANDS.map((b) => (
            <Link
              key={b.id}
              href={`/shop?brand=${encodeURIComponent(b.name)}`}
              className="text-center p-6 border border-[var(--color-line)] hover:border-[var(--color-gold)] transition-colors group"
            >
              <h3 className="font-display text-2xl group-hover:text-[var(--color-gold-dark)] transition-colors">
                {b.name}
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                {b.country} · est. {b.founded}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[var(--color-bg-alt)] border-t border-[var(--color-line)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="eyebrow mb-3">Join the inner circle</p>
          <h2 className="font-display text-4xl mb-4">
            Scent stories, members-only sales, and first access.
          </h2>
          <p className="text-[var(--color-ink-soft)] mb-8">
            Sign up and receive 10% off your first order.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="input flex-1"
            />
            <button type="button" className="btn btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function TrustItem({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon className="w-5 h-5 text-[var(--color-gold-dark)] mb-1" />
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-[var(--color-ink-soft)]">{desc}</p>
    </div>
  );
}
