"use client";

import { useState } from "react";
import { useAuth, useUI } from "@/lib/store";
import { SCENT_FAMILIES } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const auth = useAuth();
  const ui = useUI();
  const [name, setName] = useState(auth.user!.name);
  const [phone, setPhone] = useState(auth.user!.phone ?? "");
  const [scentFamilies, setScentFamilies] = useState<string[]>(
    auth.user!.preferences.scentFamilies
  );
  const [newsletter, setNewsletter] = useState(auth.user!.preferences.receiveNewsletter);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    auth.updateProfile({
      name,
      phone,
      preferences: {
        scentFamilies: scentFamilies as any,
        receiveNewsletter: newsletter,
      },
    });
    ui.showToast("success", "Settings saved");
  };

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-3xl mb-6">Settings</h2>

      <form onSubmit={onSave} className="space-y-6">
        <div>
          <h3 className="font-display text-xl mb-3">Personal info</h3>
          <div className="space-y-4 p-6 bg-[var(--color-bg-alt)]">
            <div>
              <label className="label">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                value={auth.user!.email}
                disabled
                className="input opacity-60"
              />
              <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                To change your email, please contact support.
              </p>
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
                placeholder="+1 555 0123"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl mb-3">Scent preferences</h3>
          <p className="text-sm text-[var(--color-ink-soft)] mb-4">
            Help us personalize your recommendations.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SCENT_FAMILIES.map((f) => {
              const active = scentFamilies.includes(f.id);
              return (
                <button
                  type="button"
                  key={f.id}
                  onClick={() =>
                    setScentFamilies(
                      active
                        ? scentFamilies.filter((s) => s !== f.id)
                        : [...scentFamilies, f.id]
                    )
                  }
                  className={cn(
                    "p-3 border text-sm text-left transition-colors",
                    active
                      ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-bg)]"
                      : "border-[var(--color-line)] hover:border-[var(--color-ink)]"
                  )}
                >
                  <div className="text-xl mb-1">{f.emoji}</div>
                  <div className="font-medium">{f.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl mb-3">Notifications</h3>
          <div className="space-y-3 p-6 bg-[var(--color-bg-alt)]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-gold)]"
              />
              <div>
                <p className="font-medium text-sm">Email newsletter</p>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  New releases, scent stories, and members-only sales.
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-[var(--color-gold)]"
              />
              <div>
                <p className="font-medium text-sm">Order updates</p>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Shipping, delivery, and account notifications.
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-[var(--color-gold)]"
              />
              <div>
                <p className="font-medium text-sm">Wishlist alerts</p>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Price drops and restock notifications.
                </p>
              </div>
            </label>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Save changes
        </button>
      </form>
    </div>
  );
}
