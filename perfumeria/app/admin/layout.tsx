"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  BarChart3,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/content", label: "Content", icon: ImageIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-[#f5f3ee] min-h-[calc(100vh-160px)]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6 text-sm text-[var(--color-ink-soft)]">
          <Link href="/" className="hover:text-[var(--color-ink)] inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to store
          </Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">Admin</span>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          <aside>
            <div className="bg-white border border-[var(--color-line)] p-4 sticky top-28">
              <p className="eyebrow text-xs mb-3 px-2">Admin</p>
              <nav className="space-y-1">
                {NAV.map((n) => {
                  const Icon = n.icon;
                  const active = n.end ? pathname === n.href : pathname.startsWith(n.href);
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded",
                        active
                          ? "bg-[var(--color-ink)] text-white"
                          : "hover:bg-[var(--color-bg-alt)]"
                      )}
                    >
                      <Icon className="w-4 h-4" /> {n.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
