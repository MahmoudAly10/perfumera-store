"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import { useAuth, useUI } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const ui = useUI();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      const res = auth.login(email);
      if (res.success) {
        ui.showToast("success", res.message);
        router.push("/account");
      } else {
        ui.showToast("error", res.message);
      }
    } else {
      const res = auth.signup(name, email);
      if (res.success) {
        ui.showToast("success", res.message);
        router.push("/account");
      } else {
        ui.showToast("error", res.message);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-[var(--color-ink-soft)] text-sm">
            {mode === "login"
              ? "Sign in to access your account"
              : "Join Perfumeria for member benefits"}
          </p>
        </div>

        <div className="bg-[var(--color-bg)] border border-[var(--color-line)] p-8">
          <div className="flex border-b border-[var(--color-line)] mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 pb-3 text-sm tracking-wider uppercase border-b-2 -mb-px transition-colors ${
                mode === "login"
                  ? "border-[var(--color-ink)] font-medium"
                  : "border-transparent text-[var(--color-ink-muted)]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 pb-3 text-sm tracking-wider uppercase border-b-2 -mb-px transition-colors ${
                mode === "signup"
                  ? "border-[var(--color-ink)] font-medium"
                  : "border-transparent text-[var(--color-ink-muted)]"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="label">Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)]" />
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Password</label>
                {mode === "login" && (
                  <Link href="#" className="text-xs text-[var(--color-gold-dark)] hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === "login" && (
              <p className="text-xs text-[var(--color-ink-muted)] bg-[var(--color-bg-alt)] p-3">
                <strong>Demo:</strong> Use any email, or{" "}
                <code className="font-mono">demo@perfumeria.com</code> to log in as a user with order history.
              </p>
            )}

            <button type="submit" className="btn btn-primary w-full">
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-[var(--color-ink-muted)]">
            <div className="flex-1 h-px bg-[var(--color-line)]" />
            Or continue with
            <div className="flex-1 h-px bg-[var(--color-line)]" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-secondary text-xs">
              Google
            </button>
            <button type="button" className="btn btn-secondary text-xs">
              Apple
            </button>
          </div>

          <p className="text-xs text-center text-[var(--color-ink-muted)] mt-6">
            {mode === "login" ? "New to Perfumeria? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-[var(--color-ink)] hover:text-[var(--color-gold-dark)] font-medium"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
