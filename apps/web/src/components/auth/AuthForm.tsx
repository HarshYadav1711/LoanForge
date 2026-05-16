"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { getAuthErrorMessage, useAuth } from "@/contexts/AuthContext";

type AuthFormProps = {
  mode: "login" | "register";
};

type FieldProps = {
  email: string;
  password: string;
  name: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onNameChange: (value: string) => void;
};

function LoginFields({
  email,
  password,
  onEmailChange,
  onPasswordChange,
}: Omit<FieldProps, "name" | "onNameChange">) {
  return (
    <>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input
          id="login-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          autoComplete="username"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Password</span>
        <input
          id="login-password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          minLength={8}
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>
    </>
  );
}

function RegisterFields({
  email,
  password,
  name,
  onEmailChange,
  onPasswordChange,
  onNameChange,
}: FieldProps) {
  return (
    <>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Name</span>
        <input
          id="register-name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          autoComplete="name"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input
          id="register-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Password</span>
        <input
          id="register-password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>
    </>
  );
}

export function AuthForm({ mode }: AuthFormProps) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ email, password, ...(name.trim() ? { name: name.trim() } : {}) });
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {mode === "login" ? (
        <LoginFields
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
        />
      ) : (
        <RegisterFields
          email={email}
          password={password}
          name={name}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onNameChange={setName}
        />
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {isSubmitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-600">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
              Register as borrower
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
