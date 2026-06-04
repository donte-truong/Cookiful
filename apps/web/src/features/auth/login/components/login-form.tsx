"use client";

import { useActionState } from "react";

import { loginWithPassword } from "../../actions";
import { AuthSubmitButton } from "../../components/auth-submit-button";
import { initialAuthFormState } from "../../types";

export function LoginForm() {
  const [state, formAction] = useActionState(
    loginWithPassword,
    initialAuthFormState,
  );

  return (
    <div className="glass-panel hearth-shadow rounded-[2rem] p-7 sm:p-10">
      <form action={formAction} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label
            className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-hearth-text"
            htmlFor="email"
          >
            Email Address
          </label>
          <input
            autoComplete="email"
            className="rounded-t-[1rem] border-0 border-b-2 border-hearth-outline/30 bg-hearth-container/70 px-4 py-4 text-lg text-hearth-text placeholder:text-hearth-outline focus:border-hearth-copper focus:ring-0"
            id="email"
            name="email"
            placeholder="chef@culinary.com"
            required
            type="email"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-hearth-text"
            htmlFor="password"
          >
            Password
          </label>
          <input
            autoComplete="current-password"
            className="rounded-t-[1rem] border-0 border-b-2 border-hearth-outline/30 bg-hearth-container/70 px-4 py-4 text-lg text-hearth-text placeholder:text-hearth-outline focus:border-hearth-copper focus:ring-0"
            id="password"
            name="password"
            placeholder="••••••••"
            required
            type="password"
          />
        </div>

        {state.status === "error" ? (
          <p
            className="rounded-[1.25rem] bg-hearth-blush/55 px-4 py-3 text-sm font-medium text-hearth-text"
            role="alert"
          >
            {state.message}
          </p>
        ) : null}

        <AuthSubmitButton label="Sign In" pendingLabel="Signing In" />
      </form>
    </div>
  );
}
