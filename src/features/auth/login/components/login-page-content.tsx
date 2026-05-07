import Link from "next/link";
import LoginForm from "./login-form";
import RecoveryRedirect from "./recovery-redirect";

export default function LoginPageContent() {
  return (
    <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-sm">
      <RecoveryRedirect />
      <div className="text-center md:text-center mb-3">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-slate-dark">Welcome Back</h1>
        <p className="text-sm text-slate-mid">Please enter your details to access your workspace</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm mt-5 text-slate-mid">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-brand-primary">
          SignUp
        </Link>
      </p>
    </div>
  );
}
