"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password),
    special: /[!@#$%^&*]/.test(form.password),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          department: form.department,
        },
      },
    });

    if (error) setError(error.message);
    else window.location.href = "/login";
    setLoading(false);
  };

  return (
    <div
      className="flex flex-col mb-3.5"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Form */}
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-sm">
          <div className="text-center mb-4">
            {" "}
            <h1
              className="text-3xl font-bold mb-1"
              style={{ color: "var(--color-slate-dark)" }}
            >
              Create your workspace
            </h1>
            <p style={{ color: "var(--color-slate-mid)" }}>
              Join the editorial approach to task management.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <div>
              <label
                className="text-xs font-semibold tracking-widest mb-1 block"
                style={{ color: "var(--color-slate-mid)" }}
              >
                NAME
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                style={{
                  backgroundColor: "var(--color-surface-highest)",
                  color: "var(--color-slate-dark)",
                }}
                required
              />
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-slate-mid)" }}
              >
                3-50 characters, letters only.
              </p>
            </div>

            {/* Email */}
            <div>
              <label
                className="text-xs font-semibold tracking-widest mb-1 block"
                style={{ color: "var(--color-slate-mid)" }}
              >
                EMAIL
              </label>
              <input
                type="email"
                placeholder="yourname@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                style={{
                  backgroundColor: "var(--color-surface-highest)",
                  color: "var(--color-slate-dark)",
                }}
                required
              />
            </div>

            {/* Department */}
            <div>
              <label
                className="text-xs font-semibold tracking-widest mb-1 block"
                style={{ color: "var(--color-slate-mid)" }}
              >
                JOB TITLE{" "}
                <span style={{ color: "var(--color-slate-light)" }}>
                  (OPTIONAL)
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. Project Manager"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                style={{
                  backgroundColor: "var(--color-surface-highest)",
                  color: "var(--color-slate-dark)",
                }}
              />
            </div>

            {/* Password */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label
                  className="text-xs font-semibold tracking-widest mb-1 block"
                  style={{ color: "var(--color-slate-mid)" }}
                >
                  PASSWORD
                </label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                  style={{
                    backgroundColor: "var(--color-surface-highest)",
                    color: "var(--color-slate-dark)",
                  }}
                  required
                />
              </div>
              <div className="flex-1">
                <label
                  className="text-xs font-semibold tracking-widest mb-1 block"
                  style={{ color: "var(--color-slate-mid)" }}
                >
                  CONFIRM PASSWORD
                </label>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                  style={{
                    backgroundColor: "var(--color-surface-highest)",
                    color: "var(--color-slate-dark)",
                  }}
                  required
                />
              </div>
            </div>

            {/* Password checks */}
            <div
              className="rounded-lg p-4 space-y-2"
              style={{ backgroundColor: "var(--color-surface-low)" }}
            >
              {[
                {
                  check: passwordChecks.length,
                  label: "At least 8 characters",
                },
                {
                  check: passwordChecks.uppercase,
                  label: "One uppercase, lowercase, and digit",
                },
                {
                  check: passwordChecks.special,
                  label: "One special character",
                },
              ].map(({ check, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <span
                    style={{
                      color: check
                        ? "var(--color-success)"
                        : "var(--color-slate-light)",
                    }}
                  >
                    {check ? "✓" : "○"}
                  </span>
                  <span
                    style={{
                      color: check
                        ? "var(--color-slate-dark)"
                        : "var(--color-slate-mid)",
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {error && (
              <p
                className="text-sm text-center"
                style={{ color: "var(--color-error)" }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-70"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p
            className="text-center text-sm mt-6"
            style={{ color: "var(--color-slate-mid)" }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{ color: "var(--color-primary)" }}
              className="font-semibold"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
