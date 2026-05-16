import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
      <p className="mt-2 text-sm text-slate-600">
        Use your LoanForge account. Seed users end with <code>@loanforge.test</code>.
      </p>
      <AuthForm mode="login" />
    </main>
  );
}
