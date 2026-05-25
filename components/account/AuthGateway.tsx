"use client";

import type { FormEvent } from "react";

interface AuthGatewayProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isLoginMode: boolean;
  setIsLoginMode: (value: boolean) => void;
  isLoading: boolean;
  authError: string | null;
  onAuth: (e: FormEvent) => void;
}

export function AuthGateway({
  email,
  setEmail,
  password,
  setPassword,
  isLoginMode,
  setIsLoginMode,
  isLoading,
  authError,
  onAuth,
}: AuthGatewayProps) {
  return (
    <div className="flex h-full flex-col justify-center py-6">
      <div className="rounded-[32px] bg-white p-8 shadow-soft-airy">
        <h1 className="font-sans text-2xl font-semibold text-[#222222]">
          {isLoginMode ? "Welcome back" : "Create account"}
        </h1>
        <p className="mt-2 text-sm text-[#222222]/55">
          {isLoginMode
            ? "Sign in to manage your orders and profile."
            : "Join Sikka to discover local businesses."}
        </p>

        <form onSubmit={onAuth} className="mt-8 flex flex-col gap-5">
          <label className="block">
            <span className="mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/45">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={isLoading}
              className="w-full rounded-2xl border border-[#222222]/12 bg-white px-5 py-4 font-sans text-sm text-[#222222] placeholder:text-[#222222]/30 focus:border-[#222222]/30 focus:outline-none focus:ring-2 focus:ring-[#222222]/10 disabled:opacity-50"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/45">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={isLoginMode ? "current-password" : "new-password"}
              disabled={isLoading}
              className="w-full rounded-2xl border border-[#222222]/12 bg-white px-5 py-4 font-sans text-sm text-[#222222] placeholder:text-[#222222]/30 focus:border-[#222222]/30 focus:outline-none focus:ring-2 focus:ring-[#222222]/10 disabled:opacity-50"
            />
          </label>

          {authError && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-full bg-[#222222] py-4 font-sans text-xs font-medium uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? isLoginMode
                ? "Signing in…"
                : "Creating account…"
              : isLoginMode
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setIsLoginMode(!isLoginMode)}
          disabled={isLoading}
          className="mt-5 w-full py-2 font-sans text-xs font-medium text-[#222222]/45 transition-colors hover:text-[#222222]/70 disabled:opacity-50"
        >
          {isLoginMode
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
