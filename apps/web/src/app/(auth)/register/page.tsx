import { AuthForm } from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Borrower self-registration. Staff accounts are created by administrators.
      </p>
      <AuthForm mode="register" />
    </main>
  );
}
