"use client";

import type { FormEvent } from "react";
import type { Translations } from "@/types/i18n";
import { ui } from "@/utils/ui";

interface AuthGatewayProps {
  labels: Translations;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  adminAccessKey: string;
  setAdminAccessKey: (value: string) => void;
  isLoginMode: boolean;
  setIsLoginMode: (value: boolean) => void;
  isLoading: boolean;
  authError: string | null;
  onAuth: (e: FormEvent) => void;
}

const authInputClassName =
  "w-full rounded-[32px] border-0 bg-white px-5 py-4 font-sans text-sm text-[#222222] shadow-soft-airy placeholder:text-[#222222]/30 focus:outline-none focus:ring-2 focus:ring-[#222222]/10 disabled:opacity-50 dark:border dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-white/30 dark:shadow-none dark:focus:ring-white/10";

export function AuthGateway({
  labels,
  email,
  setEmail,
  password,
  setPassword,
  adminAccessKey,
  setAdminAccessKey,
  isLoginMode,
  setIsLoginMode,
  isLoading,
  authError,
  onAuth,
}: AuthGatewayProps) {
  return (
    <div className="flex h-full flex-col justify-center py-6">
      <div className={`p-8 ${ui.card}`}>
        <h1 className="font-sans text-2xl font-semibold text-[#222222] dark:text-white">
          {isLoginMode ? labels.welcomeBack : labels.createAccountTitle}
        </h1>
        <p className="mt-2 text-sm text-[#222222]/55 dark:text-white/55">
          {isLoginMode ? labels.signInSubtitle : labels.signUpSubtitle}
        </p>

        <form onSubmit={onAuth} className="mt-8 flex flex-col gap-5">
          <label className="block">
            <span className="mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/45 dark:text-white/45">
              {labels.email}
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={isLoading}
              className={authInputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/45 dark:text-white/45">
              {labels.password}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={isLoginMode ? "current-password" : "new-password"}
              disabled={isLoading}
              className={authInputClassName}
            />
          </label>

          {!isLoginMode && (
            <label className="block">
              <span className="mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/45 dark:text-white/45">
                {labels.adminAccessKey}
              </span>
              <input
                type="text"
                value={adminAccessKey}
                onChange={(e) => setAdminAccessKey(e.target.value)}
                placeholder="••••-••••-••••"
                required
                autoComplete="off"
                disabled={isLoading}
                className={authInputClassName}
              />
            </label>
          )}

          {authError && (
            <p className="rounded-[32px] border border-[#222222]/10 bg-[#F9F9F9] px-4 py-3 text-center text-sm font-semibold text-[#222222] dark:border-white/10 dark:bg-black dark:text-white">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-full bg-[#222222] py-4 font-sans text-xs font-medium uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {isLoading
              ? isLoginMode
                ? labels.signingIn
                : labels.creatingAccount
              : isLoginMode
                ? labels.signIn
                : labels.createAccount}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setAdminAccessKey("");
          }}
          disabled={isLoading}
          className="mt-5 w-full py-2 font-sans text-xs font-medium text-[#222222]/45 transition-colors hover:text-[#222222]/70 disabled:opacity-50 dark:text-white/45 dark:hover:text-white/70"
        >
          {isLoginMode ? labels.toggleToSignUp : labels.toggleToSignIn}
        </button>
      </div>
    </div>
  );
}
