"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { User, Heart, Package, MapPin, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Overview", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth.user) {
      // Allow demo access by clicking login with demo email
      // For pages, require auth
    }
  }, [auth.user]);

  if (!auth.user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl mb-3">Sign in required</h1>
        <p className="text-[var(--color-ink-soft)] mb-6">
          Please sign in to access your account.
        </p>
        <Link href="/login" className="btn btn-primary inline-flex">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl mb-2">My Account</h1>
      <p className="text-[var(--color-ink-soft)] mb-8">Welcome back, {auth.user.name}</p>

      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        <aside>
          <div className="bg-[var(--color-bg-alt)] p-6 mb-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-ink)] text-[var(--color-bg)] flex items-center justify-center text-2xl font-display mb-3">
              {auth.user.avatar ?? auth.user.name[0]}
            </div>
            <p className="font-medium">{auth.user.name}</p>
            <p className="text-xs text-[var(--color-ink-muted)]">{auth.user.email}</p>
          </div>
          <nav className="space-y-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
                      : "hover:bg-[var(--color-bg-alt)]"
                  )}
                >
                  <Icon className="w-4 h-4" /> {n.label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                auth.logout();
                router.push("/");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[var(--color-bg-alt)] text-[var(--color-ink-muted)] hover:text-[var(--color-rose)]"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
