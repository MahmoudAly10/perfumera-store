"use client";

import Link from "next/link";
import { Package, Heart, MapPin, ArrowRight } from "lucide-react";
import { useAuth, useOrders, useWishlist } from "@/lib/store";
import { formatPrice, formatDate } from "@/lib/utils";

export default function AccountOverview() {
  const auth = useAuth();
  const orders = useOrders();
  const wishlist = useWishlist();
  const recentOrders = orders.orders.slice(0, 3);

  const totalSpent = orders.orders.reduce((sum, o) => sum + o.total, 0);
  const loyaltyTier =
    totalSpent > 1000 ? "Gold" : totalSpent > 500 ? "Silver" : "Bronze";
  const loyaltyProgress = Math.min(100, (totalSpent / 1000) * 100);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Total orders"
          value={orders.orders.length}
          icon={Package}
          link="/account/orders"
        />
        <StatCard
          label="Wishlist items"
          value={wishlist.count()}
          icon={Heart}
          link="/account/wishlist"
        />
        <StatCard
          label="Saved addresses"
          value={auth.user!.addresses.length}
          icon={MapPin}
          link="/account/addresses"
        />
      </div>

      {/* Loyalty */}
      <div className="bg-gradient-to-br from-[var(--color-oud)] to-[var(--color-ink)] text-white p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="eyebrow text-[var(--color-gold-light)] mb-1">Member tier</p>
            <h2 className="font-display text-3xl">{loyaltyTier}</h2>
            <p className="text-sm text-white/70 mt-1">
              ${totalSpent.toFixed(0)} spent · {loyaltyTier === "Gold" ? "You're a Gold member!" : `$${(1000 - totalSpent).toFixed(0)} to Gold`}
            </p>
          </div>
          <SparkleIcon />
        </div>
        <div className="h-1.5 bg-white/20">
          <div
            className="h-full bg-[var(--color-gold-light)]"
            style={{ width: `${loyaltyProgress}%` }}
          />
        </div>
        <p className="text-xs text-white/60 mt-2">
          Gold members get free express shipping and early access to new releases.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl">Recent orders</h3>
            <Link href="/account/orders" className="text-sm text-[var(--color-gold-dark)] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="border border-[var(--color-line)] p-6 text-center">
              <Package className="w-8 h-8 text-[var(--color-ink-muted)] mx-auto mb-2" />
              <p className="text-sm text-[var(--color-ink-soft)]">No orders yet</p>
              <Link href="/shop" className="text-sm text-[var(--color-gold-dark)] hover:underline mt-2 inline-block">
                Start shopping →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/account/orders`}
                  className="block p-4 border border-[var(--color-line)] hover:border-[var(--color-gold)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs">{o.id}</span>
                    <span
                      className={`text-[10px] tracking-wider uppercase px-2 py-0.5 ${
                        o.status === "delivered"
                          ? "bg-emerald-100 text-emerald-700"
                          : o.status === "shipped"
                          ? "bg-blue-100 text-blue-700"
                          : o.status === "cancelled"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <p className="text-sm">
                    {o.items.length} item{o.items.length > 1 ? "s" : ""} · {formatPrice(o.total)}
                  </p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{formatDate(o.createdAt)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display text-2xl mb-4">Profile</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-ink-muted)]">Name</span>
              <span>{auth.user!.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-ink-muted)]">Email</span>
              <span>{auth.user!.email}</span>
            </div>
            {auth.user!.phone && (
              <div className="flex justify-between py-2 border-b border-[var(--color-line)]">
                <span className="text-[var(--color-ink-muted)]">Phone</span>
                <span>{auth.user!.phone}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-ink-muted)]">Newsletter</span>
              <span>{auth.user!.preferences.receiveNewsletter ? "Subscribed" : "Not subscribed"}</span>
            </div>
            <Link
              href="/account/settings"
              className="btn btn-secondary w-full mt-4"
            >
              Edit profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  link,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
}) {
  return (
    <Link
      href={link}
      className="bg-[var(--color-bg-alt)] p-6 hover:bg-[var(--color-line)]/30 transition-colors group"
    >
      <Icon className="w-5 h-5 text-[var(--color-gold-dark)] mb-3" />
      <p className="font-display text-3xl">{value}</p>
      <p className="text-sm text-[var(--color-ink-soft)] flex items-center gap-1">
        {label} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </p>
    </Link>
  );
}

function SparkleIcon() {
  return (
    <div className="w-10 h-10 border border-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold-light)]">
      ✦
    </div>
  );
}
