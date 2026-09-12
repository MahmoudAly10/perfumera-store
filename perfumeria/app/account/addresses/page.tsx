"use client";

import { useState } from "react";
import { Plus, MapPin, Trash2, Check } from "lucide-react";
import { useAuth, useUI } from "@/lib/store";
import type { Address } from "@/lib/types";

export default function AddressesPage() {
  const auth = useAuth();
  const ui = useUI();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  });

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    auth.addAddress({ ...form, isDefault: auth.user!.addresses.length === 0 });
    setForm({ label: "Home", street: "", city: "", state: "", zip: "", country: "United States" });
    setShowForm(false);
    ui.showToast("success", "Address added");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl">Saved addresses</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-secondary text-sm"
        >
          <Plus className="w-4 h-4" /> Add new
        </button>
      </div>

      {showForm && (
        <form onSubmit={onAdd} className="bg-[var(--color-bg-alt)] p-6 mb-6 space-y-4">
          <h3 className="font-display text-xl">New address</h3>
          <div>
            <label className="label">Label</label>
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="input"
              placeholder="Home, Work, etc."
            />
          </div>
          <div>
            <label className="label">Street *</label>
            <input
              required
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              className="input"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">City *</label>
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">State *</label>
              <input
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">ZIP *</label>
              <input
                required
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Country *</label>
              <input
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              Save address
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {auth.user!.addresses.map((a) => (
          <AddressCard
            key={a.id}
            address={a}
            onDelete={() => {
              if (confirm("Delete this address?")) {
                auth.removeAddress(a.id);
                ui.showToast("success", "Address removed");
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

function AddressCard({ address, onDelete }: { address: Address; onDelete: () => void }) {
  return (
    <div className="border border-[var(--color-line)] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[var(--color-gold-dark)]" />
          <span className="font-medium">{address.label}</span>
          {address.isDefault && (
            <span className="text-[10px] tracking-wider uppercase px-1.5 py-0.5 bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] flex items-center gap-1">
              <Check className="w-2.5 h-2.5" /> Default
            </span>
          )}
        </div>
        <button
          onClick={onDelete}
          className="text-[var(--color-ink-muted)] hover:text-[var(--color-rose)]"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-[var(--color-ink-soft)]">
        {address.street}<br />
        {address.city}, {address.state} {address.zip}<br />
        {address.country}
      </p>
    </div>
  );
}
