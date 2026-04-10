import Link from "next/link";
import type { Metadata } from "next";
import LoginForm from "./_components/login-form";

export const metadata: Metadata = {
  title: { absolute: "Rafiq - Login" },
  description: "Log in to your Taskly workspace.",
};

export default function LoginPage() {
  return (
    <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-sm">
      <div className="text-center md:text-center mb-3">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-[var(--color-slate-dark)]">
          Welcome Back
        </h1>
        <p className="text-sm text-[var(--color-slate-mid)]">
          Please enter your details to access your workspace
        </p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Footer */}
      <p className="text-center text-sm mt-5 text-[var(--color-slate-mid)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[var(--color-primary)]"
        >
          SignUp
        </Link>
      </p>
    </div>
  );
}
