"use client";

import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Users, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { PRODUCTS } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

// Mock analytics data
const MOCK_ORDERS = Array.from({ length: 87 }).map((_, i) => ({
  id: `PRF-${1000 + i}`,
  total: 50 + Math.random() * 500,
  status: ["processing", "shipped", "delivered", "cancelled"][Math.floor(Math.random() * 4)],
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}));

const RECENT_ACTIVITY = [
  { type: "order", text: "New order #PRF-1024 from Sarah L. — $245", time: "2m ago" },
  { type: "low_stock", text: "Low stock alert: Cedar Smoke 100ml (3 left)", time: "15m ago" },
  { type: "review", text: "New 5-star review on Royal Oud", time: "1h ago" },
  { type: "signup", text: "Marcus J. created an account", time: "2h ago" },
  { type: "order", text: "Order #PRF-1018 shipped to NY", time: "3h ago" },
  { type: "return", text: "Return request for #PRF-1009", time: "5h ago" },
];

export default function AdminDashboard() {
  const totalRevenue = MOCK_ORDERS.reduce((s, o) => s + o.total, 0);
  const lowStock = PRODUCTS.flatMap((p) => p.variants.filter((v) => v.stock < 10).map((v) => ({ p, v }))).slice(0, 5);

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPI
          label="Revenue (30d)"
          value={formatPrice(totalRevenue)}
          change="+12.4%"
          up
          icon={DollarSign}
        />
        <KPI
          label="Orders (30d)"
          value={MOCK_ORDERS.length.toString()}
          change="+8.2%"
          up
          icon={ShoppingBag}
        />
        <KPI
          label="Customers"
          value="1,243"
          change="+24.6%"
          up
          icon={Users}
        />
        <KPI
          label="Avg. Order Value"
          value={formatPrice(totalRevenue / MOCK_ORDERS.length)}
          change="-1.3%"
          up={false}
          icon={TrendingUp}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-[var(--color-line)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Revenue (last 30 days)</h2>
            <span className="text-xs text-[var(--color-emerald)] flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +12.4% vs last month
            </span>
          </div>
          <RevenueChart />
        </div>

        {/* Activity */}
        <div className="bg-white border border-[var(--color-line)] p-6">
          <h2 className="font-display text-xl mb-4">Recent activity</h2>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="text-sm">
                <p className="leading-snug">{a.text}</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{a.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="lg:col-span-2 bg-white border border-[var(--color-line)] p-6">
          <h2 className="font-display text-xl mb-4">Top selling products</h2>
          <div className="space-y-3">
            {PRODUCTS.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-6 text-sm text-[var(--color-ink-muted)]">{i + 1}.</span>
                <div className="w-10 h-12 bg-[var(--color-bg-alt)] overflow-hidden shrink-0">
                  {p.images[0] && (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{p.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{Math.floor(50 + Math.random() * 300)} sold</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    {formatPrice(8000 + Math.random() * 12000)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white border border-[var(--color-line)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Low stock alerts</h2>
            <AlertTriangle className="w-4 h-4 text-[var(--color-amber)]" />
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)]">All products well-stocked.</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map(({ p, v }) => (
                <div key={`${p.id}-${v.size}`} className="flex items-center gap-3">
                  <div className="w-10 h-12 bg-[var(--color-bg-alt)] overflow-hidden shrink-0">
                    {p.images[0] && (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-[var(--color-ink-muted)]">{v.size}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 ${
                      v.stock < 5
                        ? "bg-[var(--color-rose)]/10 text-[var(--color-rose)]"
                        : "bg-[var(--color-amber)]/10 text-[var(--color-amber)]"
                    }`}
                  >
                    {v.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  change,
  up,
  icon: Icon,
}: {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white border border-[var(--color-line)] p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--color-ink-muted)] uppercase tracking-wider">
          {label}
        </span>
        <Icon className="w-4 h-4 text-[var(--color-gold-dark)]" />
      </div>
      <p className="font-display text-2xl">{value}</p>
      <p
        className={`text-xs mt-1 flex items-center gap-1 ${
          up ? "text-[var(--color-emerald)]" : "text-[var(--color-rose)]"
        }`}
      >
        {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </p>
    </div>
  );
}

function RevenueChart() {
  // Simple SVG chart with 30 days of data
  const data = Array.from({ length: 30 }, (_, i) => 2000 + Math.random() * 5000 + Math.sin(i / 3) * 1500);
  const max = Math.max(...data);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-40">
        <defs>
          <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${points} 100,100`} fill="url(#chart-fill)" />
        <polyline points={points} fill="none" stroke="var(--color-gold)" strokeWidth="0.4" />
      </svg>
      <div className="flex justify-between text-xs text-[var(--color-ink-muted)] mt-2">
        <span>30 days ago</span>
        <span>15 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
