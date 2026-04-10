import Link from "next/link";
import type { Metadata } from "next";
import SignUpForm from "./_components/sign-up-form";

export const metadata: Metadata = {
  title: { absolute: "Rafiq- SignUp" },
  description: "Create a new Taskly account and start managing your workspace.",
};

export default function SignUpPage() {
  return (
    <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-sm">
      <div className="text-center md:text-center mb-3">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-[var(--color-slate-dark)]">
          Create your workspace
        </h1>
        <p className="text-sm text-[var(--color-slate-mid)]">
          Join the editorial approach to task management.
        </p>
      </div>

      <SignUpForm />

      <p className="text-center text-sm mt-5 text-[var(--color-slate-mid)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--color-primary)]"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
