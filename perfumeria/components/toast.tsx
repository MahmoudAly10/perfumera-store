"use client";

import { useEffect, useState } from "react";
import { Check, X, AlertCircle, Info } from "lucide-react";
import { useUI } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ToastHost() {
  const ui = useUI();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !ui.toast) return null;

  const Icon =
    ui.toast.type === "success" ? Check : ui.toast.type === "error" ? AlertCircle : Info;
  const accent =
    ui.toast.type === "success"
      ? "bg-emerald-600"
      : ui.toast.type === "error"
      ? "bg-[var(--color-rose)]"
      : "bg-[var(--color-gold)]";

  return (
    <div className="fixed top-24 right-4 z-50 toast-in">
      <div className="bg-[var(--color-bg)] border border-[var(--color-line)] shadow-xl flex items-center gap-3 max-w-sm pl-3 pr-4 py-3">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0", accent)}>
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-sm flex-1">{ui.toast.message}</p>
        <button
          onClick={ui.hideToast}
          className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
