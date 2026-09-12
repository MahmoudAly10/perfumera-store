"use client";

import { Edit2, Eye, Plus } from "lucide-react";

const MOCK_BANNERS = [
  { id: 1, title: "Autumn Collection 2026", status: "Live", image: "/banners/0.jpg" },
  { id: 2, title: "Arabic Oud Drop", status: "Live", image: "/banners/3.jpg" },
  { id: 3, title: "Holiday Gift Sets", status: "Scheduled", image: "/banners/5.jpg" },
  { id: 4, title: "Members-Only Sale", status: "Draft", image: "/banners/7.jpg" },
];

const COLLECTIONS = [
  { name: "Editor's Picks", products: 8, status: "Active" },
  { name: "Best Sellers", products: 12, status: "Active" },
  { name: "New Arrivals", products: 6, status: "Active" },
  { name: "Arabic Oud Collection", products: 4, status: "Active" },
  { name: "Under $100", products: 14, status: "Active" },
  { name: "Holiday 2026", products: 0, status: "Draft" },
];

export default function AdminContentPage() {
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Content</h1>

      {/* Banners */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Homepage banners</h2>
          <button className="btn btn-primary text-sm">
            <Plus className="w-4 h-4" /> New banner
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {MOCK_BANNERS.map((b) => (
            <div key={b.id} className="bg-white border border-[var(--color-line)] overflow-hidden">
              <div className="aspect-[16/9] bg-[var(--color-bg-alt)] overflow-hidden">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{b.title}</p>
                  <span
                    className={`inline-block mt-1 text-[10px] tracking-wider uppercase px-2 py-0.5 ${
                      b.status === "Live"
                        ? "bg-emerald-100 text-emerald-700"
                        : b.status === "Scheduled"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 hover:bg-[var(--color-bg-alt)] rounded" aria-label="Preview">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 hover:bg-[var(--color-bg-alt)] rounded" aria-label="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Featured collections</h2>
          <button className="btn btn-primary text-sm">
            <Plus className="w-4 h-4" /> New collection
          </button>
        </div>
        <div className="bg-white border border-[var(--color-line)]">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--color-ink-muted)] border-b border-[var(--color-line)]">
                <th className="p-4">Name</th>
                <th className="p-4">Products</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {COLLECTIONS.map((c) => (
                <tr key={c.name} className="border-b border-[var(--color-line)] hover:bg-[var(--color-bg-alt)]">
                  <td className="p-4 text-sm font-medium">{c.name}</td>
                  <td className="p-4 text-sm">{c.products}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] tracking-wider uppercase px-2 py-0.5 ${
                        c.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="p-1.5 hover:bg-[var(--color-bg)] rounded" aria-label="Edit">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
