"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPI label="Total Revenue" value="$148,392" change="+12.4%" up />
        <KPI label="Orders" value="2,341" change="+8.2%" up />
        <KPI label="Conversion Rate" value="3.2%" change="+0.4%" up />
        <KPI label="Cart Abandonment" value="24.1%" change="-2.1%" up={false} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-[var(--color-line)] p-6">
          <h2 className="font-display text-xl mb-4">Revenue (90 days)</h2>
          <BigChart />
        </div>
        <div className="bg-white border border-[var(--color-line)] p-6">
          <h2 className="font-display text-xl mb-4">Traffic sources</h2>
          <div className="space-y-3">
            {[
              { src: "Direct", val: 32, color: "var(--color-gold)" },
              { src: "Organic Search", val: 28, color: "var(--color-rose)" },
              { src: "Social Media", val: 22, color: "var(--color-emerald)" },
              { src: "Email", val: 12, color: "var(--color-amber)" },
              { src: "Referral", val: 6, color: "var(--color-ink-muted)" },
            ].map((s) => (
              <div key={s.src}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.src}</span>
                  <span className="font-medium">{s.val}%</span>
                </div>
                <div className="h-2 bg-[var(--color-bg-alt)]">
                  <div
                    className="h-full"
                    style={{ width: `${s.val}%`, background: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[var(--color-line)] p-6">
          <h2 className="font-display text-xl mb-4">Top categories</h2>
          {[
            { name: "Women", val: 38 },
            { name: "Men", val: 28 },
            { name: "Unisex", val: 15 },
            { name: "Arabic / Oud", val: 12 },
            { name: "Niche", val: 5 },
            { name: "Gift Sets", val: 2 },
          ].map((c) => (
            <div key={c.name} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>{c.name}</span>
                <span className="font-medium">{c.val}%</span>
              </div>
              <div className="h-2 bg-[var(--color-bg-alt)]">
                <div
                  className="h-full bg-[var(--color-ink)]"
                  style={{ width: `${c.val}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[var(--color-line)] p-6">
          <h2 className="font-display text-xl mb-4">Search-to-purchase</h2>
          <div className="text-center my-6">
            <p className="font-display text-6xl">42%</p>
            <p className="text-sm text-[var(--color-ink-soft)] mt-2">
              of buyers used search
            </p>
          </div>
          <div className="space-y-2 text-sm">
            {["oud", "rose perfume", "cologne", "vanilla", "gift set"].map((q) => (
              <div key={q} className="flex items-center justify-between">
                <span className="text-[var(--color-ink-soft)]">"{q}"</span>
                <span>{Math.floor(Math.random() * 300) + 50}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[var(--color-line)] p-6">
          <h2 className="font-display text-xl mb-4">Customer insights</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[var(--color-ink-muted)] uppercase tracking-wider">
                Returning customers
              </p>
              <p className="font-display text-3xl mt-1">34%</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-ink-muted)] uppercase tracking-wider">
                Avg. time to repurchase
              </p>
              <p className="font-display text-3xl mt-1">62 days</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-ink-muted)] uppercase tracking-wider">
                Avg. review rating
              </p>
              <p className="font-display text-3xl mt-1">4.7 ★</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, change, up }: { label: string; value: string; change: string; up: boolean }) {
  return (
    <div className="bg-white border border-[var(--color-line)] p-5">
      <p className="text-xs text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">{label}</p>
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

function BigChart() {
  const data = Array.from({ length: 60 }, (_, i) => 3000 + Math.random() * 6000 + Math.sin(i / 5) * 2000);
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
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-48">
        <defs>
          <linearGradient id="big-chart" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${points} 100,100`} fill="url(#big-chart)" />
        <polyline points={points} fill="none" stroke="var(--color-gold)" strokeWidth="0.3" />
      </svg>
    </div>
  );
}
